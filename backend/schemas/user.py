"""
Sprint H — Schemas Pydantic para autenticação e gestão de usuários.
"""
from __future__ import annotations
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from models.user import UserRole


# ---------- Permissões ----------

PermissionMap = dict[str, dict[str, bool]]


# ---------- Auth ----------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=200)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=200)
    new_password: str = Field(..., min_length=12, max_length=200)


# ---------- User payloads ----------

class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=120)
    role: UserRole
    permissions: PermissionMap = Field(default_factory=dict)


class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    role: Optional[UserRole] = None
    permissions: Optional[PermissionMap] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    name: str
    role: UserRole
    permissions: PermissionMap
    is_active: bool
    must_change_password: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class LoginResponse(BaseModel):
    user: UserResponse


class UserCreatedResponse(BaseModel):
    """Retornado uma única vez quando admin cria um user — senha em texto."""
    user: UserResponse
    temporary_password: str


class TemporaryPasswordResponse(BaseModel):
    """Retornado em reset-password — senha em texto, mostrar uma vez só."""
    temporary_password: str
