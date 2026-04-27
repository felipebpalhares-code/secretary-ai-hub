"""
Utilitários públicos pro frontend:
  - GET /api/utils/cnpj/{cnpj}  → consulta CNPJ na BrasilAPI (gratuita, sem chave)
                                   formato simplificado + QSA (sócios) + cache em memória 24h
  - GET /api/utils/cep/{cep}    → reservado pra futura implementação de endereços
"""
from __future__ import annotations
import re
import time
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/utils", tags=["utils"])

BRASILAPI_CNPJ = "https://brasilapi.com.br/api/cnpj/v1/{cnpj}"
TIMEOUT_S = 5.0
CACHE_TTL = 24 * 60 * 60  # 24h

_cnpj_cache: dict[str, tuple[float, dict[str, Any]]] = {}


def _normalize_cnpj_status(situacao: Any) -> str:
    """Receita: 1=Nula, 2=Ativa, 3=Suspensa, 4=Inapta, 8=Baixada."""
    try:
        return "active" if int(situacao) == 2 else "inactive"
    except (TypeError, ValueError):
        return "inactive"


def _normalize_qsa(qsa_raw: Any) -> list[dict[str, Any]]:
    """Mapeia o QSA bruto da BrasilAPI pro formato simplificado que o frontend usa."""
    if not isinstance(qsa_raw, list):
        return []
    out: list[dict[str, Any]] = []
    for item in qsa_raw:
        if not isinstance(item, dict):
            continue
        pct: float | None
        raw_pct = item.get("percentual_capital_social")
        try:
            if raw_pct is None or raw_pct == "":
                pct = None
            else:
                pct = float(raw_pct)
                if pct == 0:
                    pct = None  # 0 normalmente significa "não informado"
        except (TypeError, ValueError):
            pct = None

        out.append({
            "nome": item.get("nome_socio"),
            "qual": item.get("qualificacao_socio"),
            "cpf_cnpj_mascarado": item.get("cnpj_cpf_do_socio"),
            "percentual": pct,
        })
    return out


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

    payload = {
        "razao_social": data.get("razao_social") or data.get("nome_fantasia"),
        "ramo": data.get("cnae_fiscal_descricao"),
        "status": _normalize_cnpj_status(data.get("situacao_cadastral")),
        "qsa": _normalize_qsa(data.get("qsa")),
    }
    _cnpj_cache[digits] = (now, payload)
    return payload
