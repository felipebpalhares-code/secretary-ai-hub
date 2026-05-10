"""
Sprint H — primitivas de segurança: bcrypt + JWT + senhas temporárias.
"""
from __future__ import annotations
import os
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt, JWTError
from passlib.context import CryptContext


# ---------- Bcrypt ----------

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    if not plain or not hashed:
        return False
    try:
        return _pwd_context.verify(plain, hashed)
    except Exception:
        return False


# ---------- JWT ----------

JWT_ALGORITHM = "HS256"
JWT_DEFAULT_EXPIRES = timedelta(days=30)
COOKIE_NAME = "access_token"


def _jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise RuntimeError(
            "JWT_SECRET não configurado. Gere um valor com "
            "`python -c 'import secrets; print(secrets.token_urlsafe(32))'` "
            "e exporte como env var antes de iniciar o backend."
        )
    return secret


def create_access_token(
    user_id: int,
    role: str,
    expires_in: timedelta = JWT_DEFAULT_EXPIRES,
) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int((now + expires_in).timestamp()),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    if not token:
        return None
    try:
        return jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None


# ---------- Senhas temporárias ----------

# Alfabeto sem caracteres ambíguos (0/O, 1/l/I) pra reduzir erro de digitação.
_TEMP_PASSWORD_ALPHABET = (
    "ABCDEFGHJKLMNPQRSTUVWXYZ"
    "abcdefghijkmnopqrstuvwxyz"
    "23456789"
)


def generate_temporary_password(length: int = 16) -> str:
    return "".join(secrets.choice(_TEMP_PASSWORD_ALPHABET) for _ in range(length))
