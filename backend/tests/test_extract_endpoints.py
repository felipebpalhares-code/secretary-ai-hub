"""
Sprint H — regressão dos endpoints de upload+extração de documento.

Bug: o frontend chamava esses endpoints via `fetch()` cru sem
`credentials: 'include'`, então o cookie httpOnly não viajava e o
backend respondia 401. O conserto do bug é no frontend, mas mantemos
estes testes pra garantir que:

1. O backend EXIGE auth (sem cookie → 401, não 200/400/500).
2. O backend EXIGE a permission correta (assistant sem permissão → 403).
3. Com auth + permission, a rota chega ao processamento (e responde
   422/400 por payload inválido, não 401/403).

Não exercita Claude Vision (rota recebe MIME inválido → 400 antes da IA).
"""
from __future__ import annotations
import io


def _txt_upload():
    """Multipart com um .txt — MIME não suportado, mas chega até a checagem."""
    return {"file": ("doc.txt", io.BytesIO(b"hello"), "text/plain")}


# ───────── /api/profile/identity/extract ─────────

def test_identity_extract_without_cookie_returns_401(unauth_client):
    r = unauth_client.post(
        "/api/profile/identity/extract",
        files=_txt_upload(),
        data={"kind": "rg"},
    )
    assert r.status_code == 401, r.text


def test_identity_extract_with_admin_passes_auth(client):
    """Admin tem permission; rota processa e devolve 400 por MIME ruim."""
    r = client.post(
        "/api/profile/identity/extract",
        files=_txt_upload(),
        data={"kind": "rg"},
    )
    # 400 (MIME não suportado) ou 422 (validação). Importante: NÃO 401/403.
    assert r.status_code in (400, 422), r.text


def test_identity_extract_assistant_without_perm_returns_403(assistant_factory):
    c = assistant_factory({"quem-sou-eu": {"ver": True}})  # sem editar
    r = c.post(
        "/api/profile/identity/extract",
        files=_txt_upload(),
        data={"kind": "rg"},
    )
    assert r.status_code == 403, r.text


def test_identity_extract_assistant_with_perm_passes_auth(assistant_factory):
    c = assistant_factory({"quem-sou-eu": {"ver": True, "editar": True}})
    r = c.post(
        "/api/profile/identity/extract",
        files=_txt_upload(),
        data={"kind": "rg"},
    )
    assert r.status_code in (400, 422), r.text


# ───────── /api/utils/extract-person-document ─────────

def test_person_extract_without_cookie_returns_401(unauth_client):
    r = unauth_client.post(
        "/api/utils/extract-person-document",
        files=_txt_upload(),
        data={"kind": "rg"},
    )
    assert r.status_code == 401, r.text


def test_person_extract_with_admin_passes_auth(client):
    r = client.post(
        "/api/utils/extract-person-document",
        files=_txt_upload(),
        data={"kind": "rg"},
    )
    assert r.status_code in (400, 422), r.text


# ───────── /api/agents/{id}/documents (upload de RAG) ─────────

def test_agent_document_upload_without_cookie_returns_401(unauth_client):
    """Mesmo classe de bug: fetch raw em uploadDocument()."""
    r = unauth_client.post(
        "/api/agents/some-id/documents",
        files=_txt_upload(),
    )
    assert r.status_code == 401, r.text
