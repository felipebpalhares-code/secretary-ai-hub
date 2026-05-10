"""
Sprint H — Usuário do Felipe Hub.

ADMIN tem controle total (ignora o JSON de permissions); ASSISTANT é granular
via permissions (ver/criar/editar/deletar por módulo). Permissões dos módulos
'usuarios' e 'configuracoes' são sempre tratadas como False para ASSISTANT,
mesmo que apareçam true no JSON.
"""
from __future__ import annotations
import enum
from datetime import datetime

from sqlalchemy import (
    Column, Integer, String, Boolean, JSON, DateTime,
    Enum as SQLEnum,
)

from models.profile import Base


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    ASSISTANT = "ASSISTANT"


class User(Base):
    __tablename__ = "users"

    id                   = Column(Integer, primary_key=True, index=True)
    email                = Column(String, unique=True, index=True, nullable=False)
    name                 = Column(String, nullable=False)
    hashed_password      = Column(String, nullable=False)
    role                 = Column(SQLEnum(UserRole, name="user_role"), nullable=False, default=UserRole.ASSISTANT)
    permissions          = Column(JSON, nullable=False, default=dict)
    is_active            = Column(Boolean, default=True, nullable=False)
    must_change_password = Column(Boolean, default=False, nullable=False)
    last_login_at        = Column(DateTime, nullable=True)
    created_at           = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at           = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


# Permissão default para ASSISTANT recém-criado: nenhum acesso (deny by default).
# Admin cria assistente com permissões explicitamente marcadas via UI.
DEFAULT_ASSISTANT_PERMISSIONS: dict[str, dict[str, bool]] = {
    "contatos":      {"ver": False, "criar": False, "editar": False, "deletar": False},
    "empresas":      {"ver": False, "criar": False, "editar": False, "deletar": False},
    "agenda":        {"ver": False, "criar": False, "editar": False, "deletar": False},
    "tarefas":       {"ver": False, "criar": False, "editar": False, "deletar": False},
    "agentes":       {"ver": False, "criar": False, "editar": False, "deletar": False},
    "bancos":        {"ver": False, "editar": False},
    "quem-sou-eu":   {"ver": False, "criar": False, "editar": False, "deletar": False},
    "whatsapp":      {"ver": False, "enviar": False},
    "drive":         {"ver": False},
    "gmail":         {"ver": False},
    "configuracoes": {"ver": False},
    "usuarios":      {"ver": False},
}


# Módulos exclusivos de admin: mesmo se o JSON marcar true, ASSISTANT é negado.
ADMIN_ONLY_MODULES = frozenset({"configuracoes", "usuarios"})


def has_permission(user: User, module: str, action: str) -> bool:
    """
    Resolve uma checagem de permissão. ADMIN sempre passa; ASSISTANT consulta
    o JSON, com deny-by-default e rejeição de módulos admin-only.
    """
    if not user.is_active:
        return False
    if user.role == UserRole.ADMIN:
        return True
    if module in ADMIN_ONLY_MODULES:
        return False
    perms = user.permissions or {}
    module_perms = perms.get(module) or {}
    return bool(module_perms.get(action, False))
