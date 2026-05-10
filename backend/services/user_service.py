"""
Sprint H — serviço de usuários (CRUD, login, bootstrap, backfill).

Toda a lógica de senha (hash/verify) e de geração de senha temporária vive em
core/security. Este módulo orquestra essas primitivas com a sessão do banco.
"""
from __future__ import annotations
import logging
import os
from datetime import datetime
from typing import Optional, Sequence

from sqlalchemy import text
from sqlalchemy.orm import Session

from core.security import (
    generate_temporary_password,
    hash_password,
    verify_password,
)
from models.user import DEFAULT_ASSISTANT_PERMISSIONS, User, UserRole
from schemas.user import PermissionMap

log = logging.getLogger(__name__)


class UserServiceError(Exception):
    """Erros de negócio (não-HTTP) — rota traduz pra 4xx apropriado."""


# ---------- Reads ----------

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def list_users(db: Session) -> Sequence[User]:
    return db.query(User).order_by(User.created_at.asc()).all()


def count_active_admins(db: Session) -> int:
    return (
        db.query(User)
        .filter(User.role == UserRole.ADMIN, User.is_active.is_(True))
        .count()
    )


# ---------- Writes ----------

def _normalize_permissions(role: UserRole, perms: Optional[PermissionMap]) -> PermissionMap:
    """ADMIN guarda dict vazio (ignorado em runtime); ASSISTANT normaliza com default e força admin-only false."""
    if role == UserRole.ADMIN:
        return {}
    base = {k: dict(v) for k, v in DEFAULT_ASSISTANT_PERMISSIONS.items()}
    if perms:
        for module, actions in perms.items():
            if module not in base:
                continue
            for action, value in actions.items():
                if action in base[module]:
                    base[module][action] = bool(value)
    # Reforça admin-only — mesmo se vier true do cliente, fica false.
    base["configuracoes"] = {"ver": False}
    base["usuarios"] = {"ver": False}
    return base


def create_user(
    db: Session,
    *,
    email: str,
    name: str,
    role: UserRole,
    permissions: Optional[PermissionMap] = None,
    raw_password: Optional[str] = None,
    must_change_password: bool = True,
) -> tuple[User, str]:
    """
    Cria usuário e devolve (user, senha_em_texto). Se raw_password for None,
    gera uma senha temporária (16 chars). A senha é retornada uma única vez.
    """
    if get_user_by_email(db, email):
        raise UserServiceError("E-mail já cadastrado")

    plaintext = raw_password or generate_temporary_password()
    user = User(
        email=email,
        name=name,
        role=role,
        permissions=_normalize_permissions(role, permissions),
        hashed_password=hash_password(plaintext),
        is_active=True,
        must_change_password=must_change_password,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user, plaintext


def update_user(
    db: Session,
    user: User,
    *,
    name: Optional[str] = None,
    role: Optional[UserRole] = None,
    permissions: Optional[PermissionMap] = None,
    is_active: Optional[bool] = None,
) -> User:
    if name is not None:
        user.name = name
    if role is not None:
        user.role = role
    if permissions is not None or role is not None:
        user.permissions = _normalize_permissions(user.role, permissions if permissions is not None else user.permissions)
    if is_active is not None:
        if is_active is False and user.role == UserRole.ADMIN:
            # Não permite desativar o último admin
            other_admins = (
                db.query(User)
                .filter(
                    User.role == UserRole.ADMIN,
                    User.is_active.is_(True),
                    User.id != user.id,
                )
                .count()
            )
            if other_admins == 0:
                raise UserServiceError("Não é possível desativar o último admin ativo")
        user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user


def soft_delete_user(db: Session, user: User) -> User:
    """Soft delete = is_active False. Bloqueia o último admin."""
    return update_user(db, user, is_active=False)


def reset_password(db: Session, user: User) -> str:
    """Gera nova senha temporária, salva o hash, força troca no próximo login."""
    plaintext = generate_temporary_password()
    user.hashed_password = hash_password(plaintext)
    user.must_change_password = True
    db.commit()
    db.refresh(user)
    return plaintext


def change_password(
    db: Session,
    user: User,
    current_password: str,
    new_password: str,
) -> None:
    if not verify_password(current_password, user.hashed_password):
        raise UserServiceError("Senha atual incorreta")
    user.hashed_password = hash_password(new_password)
    user.must_change_password = False
    db.commit()


def validate_login(db: Session, email: str, password: str) -> Optional[User]:
    """Retorna user ativo se email+senha conferem; senão None."""
    user = get_user_by_email(db, email)
    if user is None or not user.is_active:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def update_last_login(db: Session, user: User) -> None:
    user.last_login_at = datetime.utcnow()
    db.commit()


# ---------- Bootstrap & backfill ----------

BOOTSTRAP_ENV_KEYS = ("BOOTSTRAP_ADMIN_EMAIL", "BOOTSTRAP_ADMIN_PASSWORD", "BOOTSTRAP_ADMIN_NAME")


def bootstrap_admin_if_needed(db: Session) -> Optional[User]:
    """
    Se não há nenhum user na tabela e BOOTSTRAP_ADMIN_* estão setados, cria
    o admin inicial e retorna ele. Senão, retorna None (com warning se DB
    está vazio sem env vars).
    """
    has_any_user = db.query(User).first() is not None
    if has_any_user:
        return None

    email = os.getenv("BOOTSTRAP_ADMIN_EMAIL")
    password = os.getenv("BOOTSTRAP_ADMIN_PASSWORD")
    name = os.getenv("BOOTSTRAP_ADMIN_NAME") or "Felipe"

    if not email or not password:
        log.warning(
            "⚠ Nenhum user no banco e BOOTSTRAP_ADMIN_EMAIL/PASSWORD não setados. "
            "Sistema inacessível até criar admin via CLI ou env vars."
        )
        return None

    admin, _ = create_user(
        db,
        email=email,
        name=name,
        role=UserRole.ADMIN,
        raw_password=password,
        must_change_password=False,
    )
    log.info("✓ Admin bootstrap criado: %s", email)
    return admin


# Lista é a mesma do alembic/versions/0002 — duplicada de propósito pra que
# o backfill não precise importar uma migration por nome.
_BACKFILL_TABLES: tuple[str, ...] = (
    "contacts",
    "organizations",
    "tasks",
    "task_columns",
    "agents",
    "agent_documents",
    "agent_webhooks",
    "agent_instructions",
    "pluggy_connection",
    "companies",
    "partners",
    "trusted_professionals",
    "family_members",
    "family_doctors",
    "bank_accounts",
    "credit_cards",
    "investments",
    "real_estate",
    "legal_cases",
    "contracts",
    "vault_entries",
    "goals",
)


def backfill_created_by_user_id(db: Session, admin_id: int) -> int:
    """
    Preenche created_by_user_id com admin_id em registros antigos com NULL.
    Retorna número total de linhas atualizadas. Idempotente: só toca em NULLs.
    """
    from sqlalchemy import inspect
    insp = inspect(db.get_bind())
    existing_tables = set(insp.get_table_names())
    total = 0
    for table in _BACKFILL_TABLES:
        if table not in existing_tables:
            continue
        cols = {c["name"] for c in insp.get_columns(table)}
        if "created_by_user_id" not in cols:
            continue
        result = db.execute(
            text(
                f"UPDATE {table} SET created_by_user_id = :uid "
                f"WHERE created_by_user_id IS NULL"
            ),
            {"uid": admin_id},
        )
        total += result.rowcount or 0
    db.commit()
    if total:
        log.info("Backfill created_by_user_id: %d registros → admin#%d", total, admin_id)
    return total
