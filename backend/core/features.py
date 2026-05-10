"""
Sistema de feature flags do Felipe Hub.

Cada flag é uma env var booleana com prefixo `FEATURE_*_ENABLED`. O default
é **desligado** quando a var não estiver setada — deny-by-default. Pra
usar como dependency FastAPI:

    from core.features import require_feature

    @router.get("/x", dependencies=[Depends(require_feature("BUSCA_EMPRESAS_POR_CPF"))])
    def x(): ...

Quando a feature estiver off, o endpoint responde 503 Not Implemented
com `Retry-After: 86400` e mensagem indicando que está desabilitada.

A documentação de cada flag (motivo, custo, como reativar) vive em
`docs/PENDENCIAS.md`.
"""
from __future__ import annotations
import os

from fastapi import HTTPException, status


_TRUTHY = frozenset({"1", "true", "yes", "on"})


def feature_enabled(name: str) -> bool:
    """Verifica se uma feature está habilitada via env."""
    raw = os.getenv(f"FEATURE_{name}_ENABLED", "").strip().lower()
    return raw in _TRUTHY


def require_feature(name: str):
    """
    Dependency factory: bloqueia endpoint com 503 se a feature estiver off.
    Use o nome curto sem o prefixo `FEATURE_*_ENABLED` (a função adiciona).
    """
    def _check():
        if not feature_enabled(name):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Feature desabilitada: {name}. Veja docs/PENDENCIAS.md.",
                headers={"Retry-After": "86400"},
            )
    return _check
