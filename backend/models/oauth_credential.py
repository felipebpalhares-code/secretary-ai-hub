"""
Credenciais OAuth de provedores externos (Google, etc).
Mono-usuário (Felipe): a unicidade é por `account_email`.
Tokens armazenados criptografados via Fernet (services.encryption).
"""
from __future__ import annotations
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Text

from models.profile import Base


def _uuid_hex() -> str:
    return uuid.uuid4().hex


class OAuthCredential(Base):
    __tablename__ = "oauth_credentials"

    id                      = Column(String, primary_key=True, default=_uuid_hex)
    provider                = Column(String, nullable=False, default="google", index=True)
    account_email           = Column(String, nullable=False, unique=True, index=True)
    access_token_encrypted  = Column(Text, nullable=False)
    refresh_token_encrypted = Column(Text, nullable=False)
    token_expiry            = Column(DateTime, nullable=False)
    scopes                  = Column(Text, nullable=False, default="[]")  # JSON array de strings
    created_at              = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at              = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
