"""
Field-level AES encryption for sensitive data.
The ENCRYPTION_KEY env var must be a 32-byte Fernet key (generate once with Fernet.generate_key()).
"""
import os
from cryptography.fernet import Fernet
from sqlalchemy import String
from sqlalchemy.types import TypeDecorator

_raw_key = os.getenv("ENCRYPTION_KEY", "")
_fernet: Fernet | None = None


def _get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        if not _raw_key:
            raise RuntimeError(
                "ENCRYPTION_KEY not set. Generate one with: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
            )
        _fernet = Fernet(_raw_key.encode())
    return _fernet


def encrypt(value: str) -> str:
    return _get_fernet().encrypt(value.encode()).decode()


def decrypt(value: str) -> str:
    return _get_fernet().decrypt(value.encode()).decode()


class EncryptedString(TypeDecorator):
    """SQLAlchemy column type that auto-encrypts on write, decrypts on read."""
    impl = String
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return encrypt(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            try:
                return decrypt(value)
            except Exception:
                return value  # already plain (migration safety)
        return value
