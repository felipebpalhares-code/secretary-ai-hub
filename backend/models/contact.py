"""
Contatos · Sprint D — modelo base.

Mono-usuário (Felipe): nenhum FK para users. IDs inteiros (auto-increment)
porque é o padrão de outras tabelas operacionais (banking/profile).

- Category: lookup com 4 seeds (Família, Sócios, Profissionais de confiança, Negócios)
- Contact: pelo menos 1 entre name/email/phone deve existir (validado no schema)
- Tag: nome sempre lowercase, deduplicado
- ContactTag: associação many-to-many com PK composta
"""
from __future__ import annotations
from datetime import datetime, date

from sqlalchemy import (
    Column, Integer, String, Boolean, Text, Date, DateTime,
    ForeignKey, UniqueConstraint, Index,
)
from sqlalchemy.orm import relationship

from models.profile import Base


class Category(Base):
    __tablename__ = "contact_categories"

    id          = Column(Integer, primary_key=True)
    name        = Column(String, nullable=False, unique=True)
    color       = Column(String)                # "#RRGGBB"
    is_default  = Column(Boolean, default=False, nullable=False)
    sort_order  = Column(Integer, default=0, nullable=False)
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    contacts    = relationship("Contact", back_populates="category", passive_deletes=True)


class Contact(Base):
    __tablename__ = "contacts"

    id              = Column(Integer, primary_key=True)
    name            = Column(String)
    email           = Column(String, index=True)
    phone           = Column(String)
    role            = Column(String)
    category_id     = Column(Integer, ForeignKey("contact_categories.id", ondelete="SET NULL"))
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), index=True)
    notes           = Column(Text)
    photo_url       = Column(String)
    birthday        = Column(Date)
    is_starred      = Column(Boolean, default=False, nullable=False)
    # Sprint G: rastreia origem externa pra sync (Google People resourceName).
    # external_id é unique parcial (NULL permitido) — dois contatos manuais sem id externo coexistem.
    external_source = Column(String, index=True)        # "google" | None
    external_id     = Column(String, unique=True, index=True)
    created_at      = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at      = Column(DateTime, index=True)  # soft delete

    category     = relationship("Category", back_populates="contacts")
    organization = relationship("Organization", back_populates="contacts", lazy="selectin")
    tags         = relationship(
        "Tag",
        secondary="contact_tags",
        back_populates="contacts",
        lazy="selectin",
    )

    __table_args__ = (
        Index("ix_contacts_deleted_at_id", "deleted_at", "id"),
    )


class Tag(Base):
    __tablename__ = "contact_tags_dict"

    id         = Column(Integer, primary_key=True)
    name       = Column(String, nullable=False, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    contacts = relationship(
        "Contact",
        secondary="contact_tags",
        back_populates="tags",
    )


class ContactTag(Base):
    __tablename__ = "contact_tags"

    contact_id = Column(Integer, ForeignKey("contacts.id", ondelete="CASCADE"), primary_key=True)
    tag_id     = Column(Integer, ForeignKey("contact_tags_dict.id", ondelete="CASCADE"), primary_key=True)


class GoogleSyncState(Base):
    """
    Singleton (id=1) com o estado da última sincronização Google → hub.
    `last_report_json` guarda o relatório completo da última execução
    (counts, errors); a tabela só é escrita pelo sync, não pela UI.
    """
    __tablename__ = "google_sync_state"

    id                = Column(Integer, primary_key=True)
    last_sync_at      = Column(DateTime)
    last_report_json  = Column(Text)


class Organization(Base):
    """
    Empresa que aparece como vínculo de um Contact.
    Diferente de `models.profile.Company` (empresas do Felipe com ownership_pct, sócios).
    Aqui é catálogo: nome livre + CNPJ opcional + dados da Receita quando enriquecido.
    """
    __tablename__ = "organizations"

    id          = Column(Integer, primary_key=True)
    name        = Column(String, nullable=False, index=True)        # razão social ou texto livre
    trade_name  = Column(String)                                    # nome fantasia
    cnpj        = Column(String, unique=True, index=True)           # 14 dígitos sem mask, nullable
    industry    = Column(String)                                    # cnae fiscal / ramo
    website     = Column(String)
    notes       = Column(Text)
    enriched_at = Column(DateTime)                                  # null = nunca enriquecido
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    contacts = relationship("Contact", back_populates="organization", passive_deletes=True)
