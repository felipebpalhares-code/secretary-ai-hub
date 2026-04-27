from datetime import date
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# ───── Identidade (etapa 1) ─────

class IdentitySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    full_name: Optional[str] = None
    nickname: Optional[str] = None
    birth_date: Optional[date] = None
    cpf: Optional[str] = None
    rg: Optional[str] = None
    cnh_number: Optional[str] = None
    cnh_expiry: Optional[date] = None
    cnh_category: Optional[str] = None
    passport_number: Optional[str] = None
    passport_expiry: Optional[date] = None
    marital_status: Optional[str] = None
    religion: Optional[str] = None
    birthplace: Optional[str] = None


class PreferencesSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    how_to_address: Optional[str] = None
    communication_style: Optional[str] = None
    work_hours_start: Optional[str] = None
    work_hours_end: Optional[str] = None
    work_days: Optional[str] = None
    emergency_contact: Optional[str] = None
    life_priorities: List[str] = []  # serialized in route layer (DB stores JSON Text)


# ───── Empresarial ─────

class CompanyIn(BaseModel):
    name: str
    cnpj: Optional[str] = None
    industry: Optional[str] = None
    role: Optional[str] = None
    ownership_pct: Optional[float] = None
    is_active: bool = True
    systems: List[str] = []
    # Dados da Receita Federal
    nome_fantasia: Optional[str] = None
    capital_social: Optional[float] = None
    porte: Optional[str] = None
    natureza_juridica: Optional[str] = None
    address_full: Optional[str] = None
    municipio: Optional[str] = None
    uf: Optional[str] = None
    cep: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    simples_nacional: bool = False
    mei: bool = False


class CompanyOut(CompanyIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class PartnerIn(BaseModel):
    name: str
    cpf: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    ownership: Optional[float] = None


class PartnerOut(PartnerIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    company_id: int


class ProfessionalIn(BaseModel):
    role: str   # "contador", "advogado", "corretor", "outro"
    name: str
    register: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None


class ProfessionalOut(ProfessionalIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ───── Família ─────

class FamilyMemberIn(BaseModel):
    relation: str   # "conjuge", "filho", "pai", "mae", "irmao"
    name: str
    cpf: Optional[str] = None
    birth_date: Optional[date] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    school: Optional[str] = None
    school_phone: Optional[str] = None
    doctor_name: Optional[str] = None
    notes: Optional[str] = None


class FamilyMemberOut(FamilyMemberIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class FamilyDoctorIn(BaseModel):
    name: str
    specialty: Optional[str] = None
    phone: Optional[str] = None
    clinic: Optional[str] = None
    serves: Optional[str] = None  # "filhos", "ana", "familia"


class FamilyDoctorOut(FamilyDoctorIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ───── Financeiro (somente Investment + RealEstate) ─────

class InvestmentIn(BaseModel):
    type: str
    institution: Optional[str] = None
    approx_value: Optional[float] = None
    rate_description: Optional[str] = None


class InvestmentOut(InvestmentIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class RealEstateIn(BaseModel):
    label: str
    address: Optional[str] = None
    registration: Optional[str] = None
    approx_value: Optional[float] = None
    is_financed: bool = False
    financed_until: Optional[str] = None


class RealEstateOut(RealEstateIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ───── Jurídico ─────

class LegalCaseIn(BaseModel):
    case_number: str
    case_type: Optional[str] = None
    court: Optional[str] = None
    lawyer_name: Optional[str] = None
    lawyer_oab: Optional[str] = None
    next_deadline: Optional[date] = None
    status: str = "active"
    outcome: Optional[str] = None
    closed_date: Optional[date] = None
    notes: Optional[str] = None


class LegalCaseOut(LegalCaseIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ContractIn(BaseModel):
    type: str
    parties: Optional[str] = None
    expiry_date: Optional[date] = None
    notes: Optional[str] = None


class ContractOut(ContractIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ───── Acessos (cofre) ─────

class VaultEntryIn(BaseModel):
    category: str   # "gov", "bank", "system"
    name: str
    username: Optional[str] = None
    password: Optional[str] = None  # criptografado em repouso; só retornado em /reveal
    url: Optional[str] = None
    notes: Optional[str] = None


class VaultEntryOut(BaseModel):
    """Listagem normal NÃO retorna password (só id e metadados)."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    category: str
    name: str
    username: Optional[str] = None
    url: Optional[str] = None
    notes: Optional[str] = None


class VaultEntryReveal(BaseModel):
    """Retorno do endpoint /reveal — inclui a senha decriptada."""
    id: int
    password: Optional[str] = None


# ───── Objetivos ─────

class GoalIn(BaseModel):
    year: int
    category: str   # "pessoal", "empresarial"
    description: str
    progress: int = 0
    is_done: bool = False


class GoalOut(GoalIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ───── Banner stats ─────

class BannerStats(BaseModel):
    companies: int
    legal_cases_active: int
    real_estate: int
    goals_open: int
    legal_deadline_soon: bool   # algum prazo em ≤ 7 dias
