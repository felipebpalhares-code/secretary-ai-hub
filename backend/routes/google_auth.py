"""
Rotas OAuth Google + endpoint de teste.

Fluxo:
  /api/auth/google/start    -> 302 pra Google (com state em cookie httponly)
  /api/auth/google/callback -> valida state, troca code, redireciona pro frontend
  /api/auth/google/status   -> JSON com estado da conexao
  /api/auth/google/disconnect -> revoga + apaga credencial
  /api/google/test          -> lista 5 contatos (smoke test)
"""
from __future__ import annotations
import json
import os
import secrets
from urllib.parse import urlencode

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session

from models.oauth_credential import OAuthCredential
from services.database import get_session
from services.google.oauth_service import (
    generate_auth_url,
    exchange_code,
    revoke_and_delete,
)
from services.google.test_service import list_sample_contacts


router = APIRouter(tags=["google-auth"])

STATE_COOKIE = "google_oauth_state"
STATE_TTL_SECONDS = 600  # 10 min


def _frontend_url() -> str:
    return os.getenv("FRONTEND_URL", "http://localhost:3000")


def _redirect_to_frontend(params: dict) -> RedirectResponse:
    url = f"{_frontend_url()}/configuracoes?{urlencode(params)}"
    return RedirectResponse(url, status_code=302)


# ─────────────────────────────────────────────────────
# Auth flow
# ─────────────────────────────────────────────────────

@router.get("/api/auth/google/start")
async def google_start():
    state = secrets.token_urlsafe(32)
    auth_url = generate_auth_url(state)
    resp = RedirectResponse(auth_url, status_code=302)
    resp.set_cookie(
        key=STATE_COOKIE,
        value=state,
        max_age=STATE_TTL_SECONDS,
        httponly=True,
        samesite="lax",
        secure=False,  # local dev (http). Em prod (https) o reverse proxy cuida.
        path="/",
    )
    return resp


@router.get("/api/auth/google/callback")
async def google_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    google_oauth_state: str | None = Cookie(default=None),
    db: Session = Depends(get_session),
):
    if error == "access_denied":
        resp = _redirect_to_frontend({"google": "error", "msg": "Usuario cancelou"})
        resp.delete_cookie(STATE_COOKIE, path="/")
        return resp

    if error:
        resp = _redirect_to_frontend({"google": "error", "msg": error})
        resp.delete_cookie(STATE_COOKIE, path="/")
        return resp

    if not code:
        return JSONResponse({"ok": False, "error": "missing code"}, status_code=400)

    if not state or not google_oauth_state or state != google_oauth_state:
        return JSONResponse({"ok": False, "error": "invalid state"}, status_code=400)

    try:
        exchange_code(db, code)
    except Exception as e:
        resp = _redirect_to_frontend({"google": "error", "msg": str(e)[:200]})
        resp.delete_cookie(STATE_COOKIE, path="/")
        return resp

    resp = _redirect_to_frontend({"google": "connected"})
    resp.delete_cookie(STATE_COOKIE, path="/")
    return resp


@router.get("/api/auth/google/status")
async def google_status(db: Session = Depends(get_session)):
    cred = (
        db.query(OAuthCredential)
        .filter(OAuthCredential.provider == "google")
        .order_by(OAuthCredential.created_at.asc())
        .first()
    )
    if cred is None:
        return {"connected": False, "email": None, "expires_at": None, "scopes": []}

    return {
        "connected": True,
        "email": cred.account_email,
        "expires_at": cred.token_expiry.isoformat() if cred.token_expiry else None,
        "scopes": json.loads(cred.scopes or "[]"),
    }


@router.post("/api/auth/google/disconnect")
async def google_disconnect(db: Session = Depends(get_session)):
    cred = (
        db.query(OAuthCredential)
        .filter(OAuthCredential.provider == "google")
        .order_by(OAuthCredential.created_at.asc())
        .first()
    )
    if cred is not None:
        revoke_and_delete(db, cred.account_email)
    return {"ok": True}


# ─────────────────────────────────────────────────────
# Smoke test
# ─────────────────────────────────────────────────────

@router.get("/api/google/test")
async def google_test(db: Session = Depends(get_session)):
    cred = (
        db.query(OAuthCredential)
        .filter(OAuthCredential.provider == "google")
        .first()
    )
    if cred is None:
        return JSONResponse(
            {"ok": False, "error": "Google nao conectado"},
            status_code=401,
        )

    try:
        contacts = list_sample_contacts(db, limit=5)
    except Exception as e:
        return JSONResponse(
            {"ok": False, "error": f"Falha ao buscar contatos: {e}"},
            status_code=500,
        )
    return {"ok": True, "contacts": contacts}
