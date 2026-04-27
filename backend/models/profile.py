from sqlalchemy import Column, Integer, String, Date, Float, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

from services.encryption import EncryptedString

Base = declarative_base()


class PersonalIdentity(Base):
    __tablename__ = "personal_identity"
    id              = Column(Integer, primary_key=True)
    full_name       = Column(String)
    nickname        = Column(String)
    birth_date      = Column(Date)
    cpf             = Column(EncryptedString)
    rg              = Column(EncryptedString)
    cnh_number      = Column(EncryptedString)
    cnh_expiry      = Column(Date)
    cnh_category    = Column(String)
    passport_number = Column(EncryptedString)
    passport_expiry = Column(Date)
    marital_status  = Column(String)
    religion        = Column(String)
    birthplace      = Column(String)
    documents       = relationship("IdentityDocument", back_populates="identity", cascade="all, delete-orphan")


class IdentityDocument(Base):
    __tablename__ = "identity_documents"
    id               = Column(Integer, primary_key=True)
    identity_id      = Column(Integer, ForeignKey("personal_identity.id"))
    kind             = Column(String)
    filename         = Column(String)
    storage_path     = Column(String)
    mime_type        = Column(String)
    size_bytes       = Column(Integer)
    uploaded_at      = Column(String)
    extracted_fields = Column(Text)
    identity         = relationship("PersonalIdentity", back_populates="documents")


class Address(Base):
    __tablename__ = "addresses"
    id           = Column(Integer, primary_key=True)
    label        = Column(String)
    street       = Column(String)
    number       = Column(String)
    complement   = Column(String)
    neighborhood = Column(String)
    city         = Column(String)
    state        = Column(String)
    zip_code     = Column(String)
    is_primary   = Column(Boolean, default=False)


class Company(Base):
    __tablename__ = "companies"
    id                = Column(Integer, primary_key=True)
    name              = Column(String, nullable=False)
    cnpj              = Column(EncryptedString)
    industry          = Column(String)
    role              = Column(String)
    ownership_pct     = Column(Float)
    is_active         = Column(Boolean, default=True)
    systems_json      = Column(Text, default="[]")  # lista de strings (SAP, Salesforce, …)
    # Dados da Receita Federal (BrasilAPI / OpenCNPJ)
    nome_fantasia     = Column(String)
    capital_social    = Column(Float)
    porte             = Column(String)        # "ME", "EPP", "Demais"
    natureza_juridica = Column(String)
    address_full      = Column(String)        # logradouro + número + complemento + bairro
    municipio         = Column(String)
    uf                = Column(String)
    cep               = Column(String)
    telefone          = Column(String)
    email             = Column(String)
    simples_nacional  = Column(Boolean, default=False)
    mei               = Column(Boolean, default=False)
    partners          = relationship("Partner", back_populates="company", cascade="all, delete-orphan")


class Partner(Base):
    __tablename__ = "partners"
    id         = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    name       = Column(String)
    cpf        = Column(EncryptedString)
    phone      = Column(EncryptedString)
    email      = Column(String)
    ownership  = Column(Float)
    company    = relationship("Company", back_populates="partners")


class TrustedProfessional(Base):
    """Profissionais de confiança (contador, advogado, corretor) — globais, não atrelados a empresa."""
    __tablename__ = "trusted_professionals"
    id       = Column(Integer, primary_key=True)
    role     = Column(String)   # "contador", "advogado", "corretor", "outro"
    name     = Column(String)
    register = Column(String)   # CRC, OAB, CRECI
    phone    = Column(EncryptedString)
    email    = Column(String)
    notes    = Column(Text)


class FamilyMember(Base):
    __tablename__ = "family_members"
    id           = Column(Integer, primary_key=True)
    relation     = Column(String)   # "conjuge", "filho", "pai", "mae", "irmao"
    name         = Column(String)
    cpf          = Column(EncryptedString)
    birth_date   = Column(Date)
    phone        = Column(EncryptedString)
    email        = Column(String)
    school       = Column(String)   # para filhos
    school_phone = Column(EncryptedString)
    doctor_name  = Column(String)
    notes        = Column(Text)


class FamilyDoctor(Base):
    __tablename__ = "family_doctors"
    id        = Column(Integer, primary_key=True)
    name      = Column(String)
    specialty = Column(String)
    phone     = Column(EncryptedString)
    clinic    = Column(String)
    serves    = Column(String)  # "filhos", "ana", "familia"


class BankAccount(Base):
    __tablename__ = "bank_accounts"
    id           = Column(Integer, primary_key=True)
    bank_name    = Column(String)
    agency       = Column(String)
    account      = Column(EncryptedString)
    account_type = Column(String)
    is_primary   = Column(Boolean, default=False)


class CreditCard(Base):
    __tablename__ = "credit_cards"
    id        = Column(Integer, primary_key=True)
    bank_name = Column(String)
    brand     = Column(String)
    tier      = Column(String)
    limit_brl = Column(Float)
    due_day   = Column(Integer)
    expiry    = Column(String)


class Investment(Base):
    __tablename__ = "investments"
    id               = Column(Integer, primary_key=True)
    type             = Column(String)
    institution      = Column(String)
    approx_value     = Column(Float)
    rate_description = Column(String)


class RealEstate(Base):
    __tablename__ = "real_estate"
    id             = Column(Integer, primary_key=True)
    label          = Column(String)
    address        = Column(String)
    registration   = Column(String)
    approx_value   = Column(Float)
    is_financed    = Column(Boolean, default=False)
    financed_until = Column(String)


class LegalCase(Base):
    __tablename__ = "legal_cases"
    id            = Column(Integer, primary_key=True)
    case_number   = Column(String)
    case_type     = Column(String)
    court         = Column(String)
    lawyer_name   = Column(String)
    lawyer_oab    = Column(String)
    next_deadline = Column(Date)
    status        = Column(String, default="active")  # "active", "closed"
    outcome       = Column(String)
    closed_date   = Column(Date)
    notes         = Column(Text)


class Contract(Base):
    __tablename__ = "contracts"
    id          = Column(Integer, primary_key=True)
    type        = Column(String)
    parties     = Column(String)
    expiry_date = Column(Date)
    notes       = Column(Text)


class VaultEntry(Base):
    __tablename__ = "vault_entries"
    id       = Column(Integer, primary_key=True)
    category = Column(String)   # "gov", "bank", "system"
    name     = Column(String)
    username = Column(String)
    password = Column(EncryptedString)
    url      = Column(String)
    notes    = Column(Text)


class Goal(Base):
    __tablename__ = "goals"
    id          = Column(Integer, primary_key=True)
    year        = Column(Integer)
    category    = Column(String)   # "pessoal", "empresarial"
    description = Column(Text)
    progress    = Column(Integer, default=0)
    is_done     = Column(Boolean, default=False)


class AgentPreference(Base):
    __tablename__ = "agent_preferences"
    id                  = Column(Integer, primary_key=True)
    how_to_address      = Column(String, default="Felipe")
    communication_style = Column(Text)
    work_hours_start    = Column(String, default="08:00")
    work_hours_end      = Column(String, default="18:00")
    work_days           = Column(String, default="seg,ter,qua,qui,sex")
    emergency_contact   = Column(String)
    life_priorities     = Column(Text, default="[]")  # JSON array of strings
    updated_at          = Column(String)
