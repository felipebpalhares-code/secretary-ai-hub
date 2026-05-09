"""Schemas Pydantic do módulo Organization (Sprint E)."""
from __future__ import annotations
import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


_CNPJ_DIGITS_RE = re.compile(r"^\d{14}$")


def _normalize_cnpj(v: Optional[str]) -> Optional[str]:
    if v is None:
        return None
    digits = re.sub(r"\D", "", v)
    if not digits:
        return None
    if not _CNPJ_DIGITS_RE.match(digits):
        raise ValueError("CNPJ deve ter exatamente 14 dígitos")
    return digits


def _strip_or_none(v: Optional[str]) -> Optional[str]:
    if v is None:
        return None
    s = v.strip()
    return s or None


class OrganizationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    trade_name: Optional[str] = None
    cnpj: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("name", "trade_name", "industry", "website", "notes", mode="before")
    @classmethod
    def _strip(cls, v):
        return _strip_or_none(v) if isinstance(v, str) else v

    @field_validator("cnpj", mode="before")
    @classmethod
    def _norm_cnpj(cls, v):
        return _normalize_cnpj(v) if isinstance(v, str) else v


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    trade_name: Optional[str] = None
    cnpj: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("name", "trade_name", "industry", "website", "notes", mode="before")
    @classmethod
    def _strip(cls, v):
        return _strip_or_none(v) if isinstance(v, str) else v

    @field_validator("cnpj", mode="before")
    @classmethod
    def _norm_cnpj(cls, v):
        return _normalize_cnpj(v) if isinstance(v, str) else v


class OrganizationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    trade_name: Optional[str]
    cnpj: Optional[str]
    industry: Optional[str]
    website: Optional[str]
    notes: Optional[str]
    enriched_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    contact_count: int = 0


class OrganizationStats(BaseModel):
    total: int
    with_cnpj: int
    enriched: int
    without_contacts: int
