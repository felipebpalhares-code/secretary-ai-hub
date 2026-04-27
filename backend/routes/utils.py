"""
Utilitários públicos pro frontend:
  - GET /api/utils/cnpj/{cnpj}  → consulta CNPJ na BrasilAPI (gratuita, sem chave)
                                   formato simplificado + QSA + dados extras
                                   cache em memória 24h
  - GET /api/utils/cep/{cep}    → reservado pra futura implementação de endereços
"""
from __future__ import annotations
import re
import time
from typing import Any, Optional

import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/utils", tags=["utils"])

BRASILAPI_CNPJ = "https://brasilapi.com.br/api/cnpj/v1/{cnpj}"
TIMEOUT_S = 5.0
CACHE_TTL = 24 * 60 * 60

_cnpj_cache: dict[str, tuple[float, dict[str, Any]]] = {}


def _to_float(v: Any) -> Optional[float]:
    if v is None or v == "":
        return None
    try:
        if isinstance(v, str):
            v = v.replace(",", ".")
        return float(v)
    except (TypeError, ValueError):
        return None


def _normalize_cnpj_status(situacao: Any) -> str:
    """Receita: 1=Nula, 2=Ativa, 3=Suspensa, 4=Inapta, 8=Baixada."""
    try:
        return "active" if int(situacao) == 2 else "inactive"
    except (TypeError, ValueError):
        return "inactive"


def _normalize_qsa(qsa_raw: Any) -> list[dict[str, Any]]:
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


def _format_address(d: dict[str, Any]) -> Optional[str]:
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
        "status": _normalize_cnpj_status(data.get("situacao_cadastral")),
        "capital_social": _to_float(data.get("capital_social")),
        "porte": data.get("descricao_porte") or data.get("porte"),
        "natureza_juridica": (
            data.get("descricao_natureza_juridica") or data.get("natureza_juridica")
        ),
        "address_full": _format_address(data),
        "municipio": data.get("municipio"),
        "uf": data.get("uf"),
        "cep": str(data.get("cep") or "") or None,
        "telefone": str(ddd).strip() if ddd else None,
        "email": data.get("email"),
        "simples_nacional": bool(data.get("opcao_pelo_simples")),
        "mei": bool(data.get("opcao_pelo_mei")),
        "qsa": _normalize_qsa(data.get("qsa")),
        "source": "brasilapi",
    }


@router.get("/cnpj/{cnpj}")
async def lookup_cnpj(cnpj: str) -> dict[str, Any]:
    digits = re.sub(r"\D", "", cnpj)
    if len(digits) != 14:
        raise HTTPException(status_code=400, detail="CNPJ deve conter 14 dígitos")

    now = time.time()
    cached = _cnpj_cache.get(digits)
    if cached and (now - cached[0]) < CACHE_TTL:
        return cached[1]

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_S) as client:
            res = await client.get(BRASILAPI_CNPJ.format(cnpj=digits))
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timeout ao consultar BrasilAPI")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Erro ao consultar BrasilAPI: {e}")

    if res.status_code == 404:
        raise HTTPException(status_code=404, detail="CNPJ não encontrado na Receita")
    if res.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"BrasilAPI retornou {res.status_code}")

    try:
        data = res.json()
    except Exception:
        raise HTTPException(status_code=502, detail="BrasilAPI retornou resposta inválida")

    payload = _from_brasilapi(data)
    _cnpj_cache[digits] = (now, payload)
    return payload
