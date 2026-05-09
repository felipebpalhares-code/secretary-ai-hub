"""Schemas Pydantic do módulo Contatos."""
from __future__ import annotations
from datetime import date, datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from schemas.organization import OrganizationRead


# ───────── Category ─────────

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    color: Optional[str] = Field(default=None, pattern=r"^#[0-9A-Fa-f]{6}$")


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=80)
    color: Optional[str] = Field(default=None, pattern=r"^#[0-9A-Fa-f]{6}$")


class CategoryRead(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_default: bool
    sort_order: int


# ───────── Tag ─────────

class TagRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


# ───────── Contact ─────────

def _strip_or_none(v: Optional[str]) -> Optional[str]:
    if v is None:
        return None
    s = v.strip()
    return s or None


class ContactBase(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    category_id: Optional[int] = None
    organization_id: Optional[int] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None
    birthday: Optional[date] = None
    is_starred: bool = False
    tags: List[str] = Field(default_factory=list)

    @field_validator("name", "phone", "role", "notes", "photo_url", mode="before")
    @classmethod
    def _strip(cls, v):
        return _strip_or_none(v) if isinstance(v, str) else v


class ContactCreate(ContactBase):
    @model_validator(mode="after")
    def _at_least_one_identifier(self):
        if not (self.name or self.email or self.phone):
            raise ValueError("Informe ao menos nome, e-mail ou telefone")
        return self


class ContactUpdate(BaseModel):
    """Patch parcial — só os campos enviados são atualizados."""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    category_id: Optional[int] = None
    organization_id: Optional[int] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None
    birthday: Optional[date] = None
    is_starred: Optional[bool] = None
    tags: Optional[List[str]] = None

    @field_validator("name", "phone", "role", "notes", "photo_url", mode="before")
    @classmethod
    def _strip(cls, v):
        return _strip_or_none(v) if isinstance(v, str) else v


class ContactRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    role: Optional[str]
    category_id: Optional[int]
    organization_id: Optional[int]
    organization: Optional[OrganizationRead] = None
    notes: Optional[str]
    photo_url: Optional[str]
    birthday: Optional[date]
    is_starred: bool
    created_at: datetime
    updated_at: datetime
    tags: List[TagRead] = Field(default_factory=list)


class ContactStats(BaseModel):
    total: int
    with_email: int
    with_phone: int
    with_company: int
    by_category: List[dict]  # [{"category_id": int|None, "count": int}]
