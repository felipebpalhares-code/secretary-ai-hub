"""
Testes do sistema de feature flags.

Cobre o helper feature_enabled() + comportamento da rota /api/utils/companies-by-cpf
quando a flag FEATURE_BUSCA_EMPRESAS_POR_CPF_ENABLED está off (default) e on.
"""
from __future__ import annotations
import os

import pytest

from core.features import feature_enabled


# ───────── helper ─────────

def test_feature_disabled_when_unset(monkeypatch):
    monkeypatch.delenv("FEATURE_FOO_ENABLED", raising=False)
    assert feature_enabled("FOO") is False


@pytest.mark.parametrize("value", ["true", "TRUE", "1", "yes", "on"])
def test_feature_enabled_with_truthy(monkeypatch, value):
    monkeypatch.setenv("FEATURE_FOO_ENABLED", value)
    assert feature_enabled("FOO") is True


@pytest.mark.parametrize("value", ["false", "0", "no", "off", ""])
def test_feature_disabled_with_falsy(monkeypatch, value):
    monkeypatch.setenv("FEATURE_FOO_ENABLED", value)
    assert feature_enabled("FOO") is False


# ───────── /api/utils/companies-by-cpf ─────────

def test_cpf_lookup_returns_503_when_feature_off(client, monkeypatch):
    """Default (flag unset) → 503 Service Unavailable."""
    monkeypatch.delenv("FEATURE_BUSCA_EMPRESAS_POR_CPF_ENABLED", raising=False)
    r = client.get("/api/utils/companies-by-cpf/52998224725")  # CPF válido
    assert r.status_code == 503, r.text
    assert "PENDENCIAS" in r.json().get("detail", "")
    assert r.headers.get("Retry-After") == "86400"


def test_cpf_lookup_returns_503_when_feature_explicitly_off(client, monkeypatch):
    monkeypatch.setenv("FEATURE_BUSCA_EMPRESAS_POR_CPF_ENABLED", "false")
    r = client.get("/api/utils/companies-by-cpf/52998224725")
    assert r.status_code == 503, r.text


def test_cpf_lookup_unauth_still_returns_401(unauth_client, monkeypatch):
    """Auth roda antes da feature flag — 401 sem cookie."""
    monkeypatch.setenv("FEATURE_BUSCA_EMPRESAS_POR_CPF_ENABLED", "true")
    r = unauth_client.get("/api/utils/companies-by-cpf/52998224725")
    assert r.status_code == 401, r.text
