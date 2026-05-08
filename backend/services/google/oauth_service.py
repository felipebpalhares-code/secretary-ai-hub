"""
Google OAuth 2.0 — fluxo Authorization Code com refresh automático.
Mono-usuário: tokens upserted por `account_email`.
"""
from __future__ import annotations
import json
import os
from datetime import datetime, timedelta
from urllib.parse import urlencode

import httpx
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
from sqlalchemy.orm import Session

from models.oauth_credential import OAuthCredential
from services.encryption import encrypt, decrypt


SCOPES = [
    "https://www.googleapis.com/auth/contacts.readonly",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar.events",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
]

AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"
REVOKE_URL = "https://oauth2.googleapis.com/revoke"
USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"


def _client_id() -> str:
    return os.getenv("GOOGLE_CLIENT_ID", "")


def _client_secret() -> str:
    return os.getenv("GOOGLE_CLIENT_SECRET", "")


def _redirect_uri() -> str:
    return os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")


def generate_auth_url(state: str) -> str:
    """URL de autorização do Google. `prompt=consent` + `access_type=offline` garantem refresh token."""
    params = {
        "client_id": _client_id(),
        "redirect_uri": _redirect_uri(),
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "access_type": "offline",
        "prompt": "consent",
        "include_granted_scopes": "true",
        "state": state,
    }
    return f"{AUTH_URL}?{urlencode(params)}"


def exchange_code(db: Session, code: str) -> OAuthCredential:
    """Troca authorization code por tokens, descobre o email e faz upsert no DB."""
    with httpx.Client(timeout=20.0) as client:
        token_resp = client.post(
            TOKEN_URL,
            data={
                "code": code,
                "client_id": _client_id(),
                "client_secret": _client_secret(),
                "redirect_uri": _redirect_uri(),
                "grant_type": "authorization_code",
            },
        )
        token_resp.raise_for_status()
        token_data = token_resp.json()

        access_token = token_data["access_token"]
        refresh_token = token_data.get("refresh_token")
        expires_in = int(token_data.get("expires_in", 3600))
        granted_scopes = token_data.get("scope", " ".join(SCOPES)).split()

        if not refresh_token:
            raise RuntimeError(
                "Google nao devolveu refresh_token. "
                "Revogue o app em https://myaccount.google.com/permissions e reautorize."
            )

        userinfo_resp = client.get(
            USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        userinfo_resp.raise_for_status()
        email = userinfo_resp.json().get("email")
        if not email:
            raise RuntimeError("Nao foi possivel obter o email do Google")

    expiry = datetime.utcnow() + timedelta(seconds=expires_in)

    cred = (
        db.query(OAuthCredential)
        .filter(OAuthCredential.account_email == email)
        .first()
    )
    if cred is None:
        cred = OAuthCredential(
            provider="google",
            account_email=email,
            access_token_encrypted=encrypt(access_token),
            refresh_token_encrypted=encrypt(refresh_token),
            token_expiry=expiry,
            scopes=json.dumps(granted_scopes),
        )
        db.add(cred)
    else:
        cred.access_token_encrypted = encrypt(access_token)
        cred.refresh_token_encrypted = encrypt(refresh_token)
        cred.token_expiry = expiry
        cred.scopes = json.dumps(granted_scopes)
    db.commit()
    db.refresh(cred)
    return cred


def get_credentials(db: Session, email: str | None = None) -> Credentials:
    """Retorna `google.oauth2.credentials.Credentials` válidas. Faz refresh se expirado."""
    q = db.query(OAuthCredential).filter(OAuthCredential.provider == "google")
    if email:
        q = q.filter(OAuthCredential.account_email == email)
    cred_row: OAuthCredential | None = q.order_by(OAuthCredential.created_at.asc()).first()
    if cred_row is None:
        raise RuntimeError("Google nao conectado")

    scopes = json.loads(cred_row.scopes or "[]")
    creds = Credentials(
        token=decrypt(cred_row.access_token_encrypted),
        refresh_token=decrypt(cred_row.refresh_token_encrypted),
        token_uri=TOKEN_URL,
        client_id=_client_id(),
        client_secret=_client_secret(),
        scopes=scopes,
        expiry=cred_row.token_expiry,
    )

    if creds.expired and creds.refresh_token:
        creds.refresh(GoogleRequest())
        cred_row.access_token_encrypted = encrypt(creds.token)
        if creds.expiry:
            cred_row.token_expiry = creds.expiry
        db.commit()

    return creds


def revoke_and_delete(db: Session, email: str) -> None:
    """Revoga o token no Google e remove a credencial do DB."""
    cred_row = (
        db.query(OAuthCredential)
        .filter(OAuthCredential.account_email == email)
        .first()
    )
    if cred_row is None:
        return

    try:
        token = decrypt(cred_row.access_token_encrypted)
        with httpx.Client(timeout=10.0) as client:
            client.post(REVOKE_URL, data={"token": token})
    except Exception:
        pass

    db.delete(cred_row)
    db.commit()
