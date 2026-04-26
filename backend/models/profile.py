from sqlalchemy import Column, Integer, String, Date, Float, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class PersonalIdentity(Base):
    __tablename__ = "personal_identity"
    id              = Column(Integer, primary_key=True)
    full_name       = Column(String)
    nickname        = Column(String)
    birth_date      = Column(Date)
    cpf             = Column(String)   # encrypted
    rg              = Column(String)   # encrypted
    cnh_number      = Column(String)   # encrypted
    cnh_expiry      = Column(Date)
    cnh_category    = Column(String)
    passport_number = Column(String)   # encrypted
    passport_expiry = Column(Date)
    marital_status  = Column(String)
    religion        = Column(String)
    birthplace      = Column(String)


class Address(Base):
    __tablename__ = "addresses"
    id           = Column(Integer, primary_key=True)
    label        = Column(String)   # "Principal", "Comercial", etc.
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
    id             = Column(Integer, primary_key=True)
    name           = Column(String, nullable=False)
    cnpj           = Column(String)   # encrypted
    industry       = Column(String)
    role           = Column(String)
    ownership_pct  = Column(Float)
    is_active      = Column(Boolean, default=True)
    partners       = relationship("Partner", back_populates="company", cascade="all, delete-orphan")
    systems        = relationship("CompanySystem", back_populates="company", cascade="all, delete-orphan")
    professionals  = relationship("TrustedProfessional", back_populates="company", cascade="all, delete-orphan")


class Partner(Base):
    __tablename__ = "partners"
    id         = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    name       = Column(String)
    cpf        = Column(String)   # encrypted
    phone      = Column(String)   # encrypted
    email      = Column(String)
    ownership  = Column(Float)
    company    = relationship("Company", back_populates="partners")


class TrustedProfessional(Base):
    __tablename__ = "trusted_professionals"
    id         = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    role       = Column(String)   # "contador", "advogado", "corretor"
    name       = Column(String)
    register   = Column(String)   # CRC, OAB, CRECI
    phone      = Column(String)
    email      = Column(String)
    company    = relationship("Company", back_populates="professionals")


class CompanySystem(Base):
    __tablename__ = "company_systems"
    id         = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    name       = Column(String)   # SAP, Salesforce, etc.
    category   = Column(String)   # ERP, CRM, etc.
    url        = Column(String)
    company    = relationship("Company", back_populates="systems")


class FamilyMember(Base):
    __tablename__ = "family_members"
    id           = Column(Integer, primary_key=True)
    relation     = Column(String)   # "conjuge", "filho", "pai", "mae", "irmao"
    name         = Column(String)
    cpf          = Column(String)   # encrypted
    birth_date   = Column(Date)
    phone        = Column(String)   # encrypted
    email        = Column(String)
    school       = Column(String)   # para filhos
    school_phone = Column(String)   # para filhos
    doctor_name  = Column(String)   # médico responsável
    notes        = Column(Text)


class FamilyDoctor(Base):
    __tablename__ = "family_doctors"
    id            = Column(Integer, primary_key=True)
    name          = Column(String)
    specialty     = Column(String)
    phone         = Column(String)
    clinic        = Column(String)
    serves        = Column(String)  # "filhos", "ana", "familia"


class BankAccount(Base):
    __tablename__ = "bank_accounts"
    id           = Column(Integer, primary_key=True)
    bank_name    = Column(String)
    agency       = Column(String)
    account      = Column(String)   # encrypted
    account_type = Column(String)   # "corrente", "poupança", "digital"
    is_primary   = Column(Boolean, default=False)


class CreditCard(Base):
    __tablename__ = "credit_cards"
    id           = Column(Integer, primary_key=True)
    bank_name    = Column(String)
    brand        = Column(String)   # Visa, Mastercard
    tier         = Column(String)   # Black, Gold, Platinum
    limit_brl    = Column(Float)
    due_day      = Column(Integer)
    expiry       = Column(String)   # MM/YYYY


class Investment(Base):
    __tablename__ = "investments"
    id              = Column(Integer, primary_key=True)
    type            = Column(String)   # "Tesouro Direto", "FII", "Ações", "CDB"
    institution     = Column(String)
    approx_value    = Column(Float)
    rate_description = Column(String)  # "112% CDI", "+8% a.a."


class RealEstate(Base):
    __tablename__ = "real_estate"
    id           = Column(Integer, primary_key=True)
    label        = Column(String)
    address      = Column(String)
    registration = Column(String)   # matrícula
    approx_value = Column(Float)
    is_financed  = Column(Boolean, default=False)
    financed_until = Column(String)  # "12/2031"


class LegalCase(Base):
    __tablename__ = "legal_cases"
    id            = Column(Integer, primary_key=True)
    case_number   = Column(String)
    case_type     = Column(String)   # "Trabalhista", "Cível", etc.
    court         = Column(String)
    lawyer_name   = Column(String)
    lawyer_oab    = Column(String)
    next_deadline = Column(Date)
    status        = Column(String)   # "active", "closed"
    outcome       = Column(String)   # para encerrados
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
    id         = Column(Integer, primary_key=True)
    category   = Column(String)   # "gov", "bank", "system"
    name       = Column(String)
    username   = Column(String)
    password   = Column(String)   # always encrypted
    url        = Column(String)
    notes      = Column(Text)


class Goal(Base):
    __tablename__ = "goals"
    id          = Column(Integer, primary_key=True)
    year        = Column(Integer)
    category    = Column(String)   # "pessoal", "empresarial"
    description = Column(Text)
    progress    = Column(Integer, default=0)  # 0–100
    is_done     = Column(Boolean, default=False)


class AgentPreference(Base):
    __tablename__ = "agent_preferences"
    id                   = Column(Integer, primary_key=True)
    how_to_address       = Column(String, default="Felipe")
    communication_style  = Column(Text)
    work_hours_start     = Column(String, default="08:00")
    work_hours_end       = Column(String, default="18:00")
    work_days            = Column(String, default="seg,ter,qua,qui,sex")
    emergency_contact    = Column(String)
    updated_at           = Column(String)
