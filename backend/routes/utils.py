"""
Utilitários públicos pro frontend:
  - GET /api/utils/cnpj/{cnpj}        → consulta CNPJ via BrasilAPI (fallback OpenCNPJ).
                                         Cache em memória 24h indexado pelo CNPJ.
  - GET /api/utils/companies-by-cpf   → busca empresas vinculadas ao CPF da identidade
                                         via CPF.CNPJ (pacote 15). Cache 24h.
  - GET /api/utils/cep/{cep}          → reservado pra futura implementação de endereços.
"""
from __future__ import annotations
import os
import re
import time
from typing import Any, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models.profile import PersonalIdentity
from services.database import get_session

router = APIRouter(prefix="/api/utils", tags=["utils"])

BRASILAPI_CNPJ = "https://brasilapi.com.br/api/cnpj/v1/{cnpj}"
OPENCNPJ_URL = "https://api.opencnpj.org/{cnpj}"
CPFCNPJ_URL = "https://api.cpfcnpj.com.br/{token}/15/{cpf}"
# Token de teste público da CPF.CNPJ (retorna dados fictícios pra integração).
# Em produção, setar CPF_LOOKUP_API_KEY no .env com chave real.
CPF_LOOKUP_API_KEY = os.getenv("CPF_LOOKUP_API_KEY", "5ae973d7a997af13f0aaf2bf60e65803")

TIMEOUT_S = 5.0
CACHE_TTL = 24 * 60 * 60

_cnpj_cache: dict[str, tuple[float, dict[str, Any]]] = {}
_cpf_cache: dict[str, tuple[float, list[dict[str, Any]]]] = {}


# ───────── helpers comuns ─────────

def _to_float(v: Any) -> Optional[float]:
    if v is None or v == "":
        return None
    try:
        if isinstance(v, str):
            v = v.replace(",", ".")
        return float(v)
    except (TypeError, ValueError):
        return None


# ───────── BrasilAPI ─────────

def _normalize_status_code(situacao: Any) -> str:
    """BrasilAPI: 1=Nula, 2=Ativa, 3=Suspensa, 4=Inapta, 8=Baixada."""
    try:
        return "active" if int(situacao) == 2 else "inactive"
    except (TypeError, ValueError):
        return "inactive"


def _normalize_qsa_brasilapi(qsa_raw: Any) -> list[dict[str, Any]]:
    if not isinstance(qsa_raw, list):
        return []
    out: list[dict[str, Any]] = []
    for item in qsa_raw:
        if not isinstance(item, dict):
            continue
        pct = _to_float(item.get("percentual_capital_social"))
        if pct == 0:
            pct = None
        out.append({
            "nome": item.get("nome_socio"),
            "qual": item.get("qualificacao_socio"),
            "cpf_cnpj_mascarado": item.get("cnpj_cpf_do_socio"),
            "percentual": pct,
        })
    return out


def _format_address_brasilapi(d: dict[str, Any]) -> Optional[str]:
    parts = [
        d.get("logradouro") or "",
        d.get("numero") or "",
        d.get("complemento") or "",
        d.get("bairro") or "",
    ]
    full = ", ".join(p.strip() for p in parts if p and p.strip())
    return full or None


def _from_brasilapi(data: dict[str, Any]) -> dict[str, Any]:
    ddd = data.get("ddd_telefone_1")
    return {
        "razao_social": data.get("razao_social") or data.get("nome_fantasia"),
        "nome_fantasia": data.get("nome_fantasia"),
        "ramo": data.get("cnae_fiscal_descricao"),
        "status": _normalize_status_code(data.get("situacao_cadastral")),
        "capital_social": _to_float(data.get("capital_social")),
        "porte": data.get("descricao_porte") or data.get("porte"),
        "natureza_juridica": (
            data.get("descricao_natureza_juridica") or data.get("natureza_juridica")
        ),
        "address_full": _format_address_brasilapi(data),
        "municipio": data.get("municipio"),
        "uf": data.get("uf"),
        "cep": str(data.get("cep") or "") or None,
        "telefone": str(ddd).strip() if ddd else None,
        "email": data.get("email"),
        "simples_nacional": bool(data.get("opcao_pelo_simples")),
        "mei": bool(data.get("opcao_pelo_mei")),
        "qsa": _normalize_qsa_brasilapi(data.get("qsa")),
        "source": "brasilapi",
    }


# ───────── OpenCNPJ (fallback) ─────────

def _normalize_status_text(situacao: Any) -> str:
    """OpenCNPJ retorna texto: 'Ativa', 'Baixada', etc."""
    if isinstance(situacao, str) and situacao.strip().lower() == "ativa":
        return "active"
    return "inactive"


def _normalize_qsa_opencnpj(qsa_raw: Any) -> list[dict[str, Any]]:
    if not isinstance(qsa_raw, list):
        return []
    out: list[dict[str, Any]] = []
    for item in qsa_raw:
        if not isinstance(item, dict):
            continue
        out.append({
            "nome": item.get("nome_socio"),
            "qual": item.get("qualificacao_socio"),
            "cpf_cnpj_mascarado": item.get("cnpj_cpf_socio"),
            "percentual": None,  # OpenCNPJ não retorna percentual
        })
    return out


def _format_address_opencnpj(d: dict[str, Any]) -> Optional[str]:
    parts = [
        " ".join(p for p in [d.get("tipo_logradouro"), d.get("logradouro")] if p) or "",
        d.get("numero") or "",
        d.get("complemento") or "",
        d.get("bairro") or "",
    ]
    full = ", ".join(p.strip() for p in parts if p and p.strip())
    return full or None


def _format_phones_opencnpj(tels: Any) -> Optional[str]:
    if not isinstance(tels, list) or not tels:
        return None
    primary = next((t for t in tels if isinstance(t, dict) and not t.get("is_fax")), None) or tels[0]
    if not isinstance(primary, dict):
        return None
    ddd = (primary.get("ddd") or "").strip()
    num = (primary.get("numero") or "").strip()
    if not ddd or not num:
        return num or None
    return f"({ddd}) {num}"


def _from_opencnpj(data: dict[str, Any]) -> dict[str, Any]:
    return {
        "razao_social": data.get("razao_social") or data.get("nome_fantasia"),
        "nome_fantasia": data.get("nome_fantasia"),
        "ramo": None,  # OpenCNPJ retorna só o código do CNAE, não a descrição
        "status": _normalize_status_text(data.get("situacao_cadastral")),
        "capital_social": _to_float(data.get("capital_social")),
        "porte": data.get("porte_empresa"),
        "natureza_juridica": data.get("natureza_juridica"),
        "address_full": _format_address_opencnpj(data),
        "municipio": data.get("municipio"),
        "uf": data.get("uf"),
        "cep": str(data.get("cep") or "") or None,
        "telefone": _format_phones_opencnpj(data.get("telefones")),
        "email": data.get("email"),
        "simples_nacional": data.get("opcao_simples") == "S",
        "mei": data.get("opcao_mei") == "S",
        "qsa": _normalize_qsa_opencnpj(data.get("QSA")),
        "source": "opencnpj",
    }


# ───────── fetchers ─────────

async def _try_brasilapi(digits: str) -> Optional[dict[str, Any]]:
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_S) as client:
            res = await client.get(BRASILAPI_CNPJ.format(cnpj=digits))
    except (httpx.TimeoutException, httpx.HTTPError):
        return None
    if res.status_code != 200:
        return None
    try:
        return _from_brasilapi(res.json())
    except Exception:
        return None


async def _try_opencnpj(digits: str) -> Optional[dict[str, Any]]:
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_S) as client:
            res = await client.get(OPENCNPJ_URL.format(cnpj=digits))
    except (httpx.TimeoutException, httpx.HTTPError):
        return None
    if res.status_code != 200:
        return None
    try:
        return _from_opencnpj(res.json())
    except Exception:
        return None


# ───────── rota ─────────

# ───────── CPF.CNPJ — busca empresas por CPF ─────────

def _date_br_to_iso(s: Any) -> Optional[str]:
    """Converte 'DD/MM/AAAA' pra 'AAAA-MM-DD' (formato ISO usado pelo frontend)."""
    if not isinstance(s, str):
        return None
    parts = s.split("/")
    if len(parts) != 3:
        return None
    d, m, y = parts
    if not (d.isdigit() and m.isdigit() and len(y) == 4 and y.isdigit()):
        return None
    return f"{y}-{m.zfill(2)}-{d.zfill(2)}"


def _normalize_situacao_text(s: Any) -> str:
    if isinstance(s, str) and s.strip().lower() == "ativa":
        return "active"
    return "inactive"


@router.get("/companies-by-cpf")
async def companies_by_cpf(db: Session = Depends(get_session)) -> list[dict[str, Any]]:
    """
    Retorna a lista de empresas onde o usuário (CPF da identidade) é sócio,
    consultada na CPF.CNPJ. Cache em memória 24h pelo CPF.
    """
    identity = db.query(PersonalIdentity).first()
    if not identity or not identity.cpf:
        raise HTTPException(
            status_code=400,
            detail="Cadastre seu CPF na aba Identidade antes de buscar empresas.",
        )
    digits = re.sub(r"\D", "", identity.cpf)
    if len(digits) != 11:
        raise HTTPException(status_code=400, detail="CPF da identidade é inválido.")

    now = time.time()
    cached = _cpf_cache.get(digits)
    if cached and (now - cached[0]) < CACHE_TTL:
        return cached[1]

    url = CPFCNPJ_URL.format(token=CPF_LOOKUP_API_KEY, cpf=digits)
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_S) as client:
            res = await client.get(url)
    except (httpx.TimeoutException, httpx.HTTPError) as e:
        print(f"[CPF.CNPJ] network error: {e}", flush=True)
        raise HTTPException(
            status_code=503,
            detail="Serviço temporariamente indisponível. Tente novamente mais tarde.",
        )

    try:
        data = res.json()
    except Exception:
        raise HTTPException(status_code=502, detail="Resposta inválida da CPF.CNPJ.")

    if not isinstance(data, dict):
        raise HTTPException(status_code=502, detail="Formato inesperado da CPF.CNPJ.")

    if data.get("status") != 1:
        codigo = data.get("erroCodigo")
        msg = data.get("erro") or "erro desconhecido"
        # Log no servidor pra debug; mensagem genérica pro frontend
        print(f"[CPF.CNPJ] erro código={codigo} msg={msg!r} (HTTP {res.status_code})", flush=True)
        if codigo in (100, 101):
            raise HTTPException(
                status_code=400,
                detail="CPF inválido. Confira o cadastro na aba Identidade.",
            )
        # Saldo zerado, chave inválida, qualquer outro erro: mensagem genérica
        raise HTTPException(
            status_code=503,
            detail="Serviço temporariamente indisponível. Tente novamente mais tarde.",
        )

    empresas_raw = data.get("empresas") or []
    if not isinstance(empresas_raw, list):
        empresas_raw = []

    payload: list[dict[str, Any]] = []
    for e in empresas_raw:
        if not isinstance(e, dict):
            continue
        cnpj_digits = re.sub(r"\D", "", str(e.get("cnpj") or ""))
        if len(cnpj_digits) != 14:
            continue
        payload.append({
            "cnpj": cnpj_digits,
            "razao_social": e.get("razao"),
            "nome_fantasia": e.get("fantasia"),
            "qualificacao": e.get("qualificacao"),
            "data_entrada": _date_br_to_iso(e.get("dataSociedade")),
            "situacao": _normalize_situacao_text(e.get("situacao")),
        })

    _cpf_cache[digits] = (now, payload)
    return payload


# ───────── rota CNPJ ─────────

@router.get("/cnpj/{cnpj}")
async def lookup_cnpj(cnpj: str) -> dict[str, Any]:
    digits = re.sub(r"\D", "", cnpj)
    if len(digits) != 14:
        raise HTTPException(status_code=400, detail="CNPJ deve conter 14 dígitos")

    now = time.time()
    cached = _cnpj_cache.get(digits)
    if cached and (now - cached[0]) < CACHE_TTL:
        return cached[1]

    payload = await _try_brasilapi(digits)
    if payload is None:
        payload = await _try_opencnpj(digits)

    if payload is None:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível consultar a Receita (BrasilAPI e OpenCNPJ indisponíveis ou CNPJ não encontrado).",
        )

    _cnpj_cache[digits] = (now, payload)
    return payload
