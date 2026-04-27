import json
import os
import secrets
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from models.profile import (
    PersonalIdentity, AgentPreference, IdentityDocument,
    Company, Partner, TrustedProfessional,
    FamilyMember, FamilyDoctor,
    Investment, RealEstate,
    LegalCase, Contract,
    VaultEntry, Goal,
)
from schemas.profile import (
    IdentitySchema, PreferencesSchema,
    CompanyIn, CompanyOut,
    PartnerIn, PartnerOut,
    ProfessionalIn, ProfessionalOut,
    FamilyMemberIn, FamilyMemberOut,
    FamilyDoctorIn, FamilyDoctorOut,
    InvestmentIn, InvestmentOut,
    RealEstateIn, RealEstateOut,
    LegalCaseIn, LegalCaseOut,
    ContractIn, ContractOut,
    VaultEntryIn, VaultEntryOut, VaultEntryReveal,
    GoalIn, GoalOut,
    BannerStats,
)
from services.database import get_session
from services.profile_extract import extract_identity

router = APIRouter(prefix="/api/profile", tags=["profile"])

UPLOAD_ROOT = Path(os.getenv("UPLOAD_ROOT", "/data/uploads"))
IDENTITY_UPLOAD_DIR = UPLOAD_ROOT / "identity"
ACCEPTED_MIMES = {
    "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
    "application/pdf",
}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024


# ════════════════════════════════════════════════════════════════════
# Helpers
# ════════════════════════════════════════════════════════════════════

def _ensure_upload_dir() -> Path:
    IDENTITY_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    return IDENTITY_UPLOAD_DIR


def _get_or_create_identity(db: Session) -> PersonalIdentity:
    identity = db.query(PersonalIdentity).first()
    if identity is None:
        identity = PersonalIdentity()
        db.add(identity)
        db.commit()
        db.refresh(identity)
    return identity


def _get_or_create_preferences(db: Session) -> AgentPreference:
    prefs = db.query(AgentPreference).first()
    if prefs is None:
        prefs = AgentPreference()
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    return prefs


def _company_to_out(c: Company) -> CompanyOut:
    return CompanyOut(
        id=c.id,
        name=c.name,
        cnpj=c.cnpj,
        industry=c.industry,
        role=c.role,
        ownership_pct=c.ownership_pct,
        is_active=bool(c.is_active),
        systems=json.loads(c.systems_json or "[]"),
        nome_fantasia=c.nome_fantasia,
        capital_social=c.capital_social,
        porte=c.porte,
        natureza_juridica=c.natureza_juridica,
        address_full=c.address_full,
        municipio=c.municipio,
        uf=c.uf,
        cep=c.cep,
        telefone=c.telefone,
        email=c.email,
        simples_nacional=bool(c.simples_nacional),
        mei=bool(c.mei),
    )


def _prefs_to_schema(p: AgentPreference) -> PreferencesSchema:
    try:
        priorities = json.loads(p.life_priorities or "[]")
        if not isinstance(priorities, list):
            priorities = []
    except json.JSONDecodeError:
        priorities = []
    return PreferencesSchema(
        how_to_address=p.how_to_address,
        communication_style=p.communication_style,
        work_hours_start=p.work_hours_start,
        work_hours_end=p.work_hours_end,
        work_days=p.work_days,
        emergency_contact=p.emergency_contact,
        life_priorities=priorities,
    )


# ════════════════════════════════════════════════════════════════════
# Identidade (etapa 1)
# ════════════════════════════════════════════════════════════════════

@router.get("/identity", response_model=IdentitySchema)
def get_identity(db: Session = Depends(get_session)):
    return _get_or_create_identity(db)


@router.put("/identity", response_model=IdentitySchema)
def update_identity(payload: IdentitySchema, db: Session = Depends(get_session)):
    identity = _get_or_create_identity(db)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(identity, k, v)
    db.commit()
    db.refresh(identity)
    return identity


@router.get("/preferences", response_model=PreferencesSchema)
def get_preferences(db: Session = Depends(get_session)):
    return _prefs_to_schema(_get_or_create_preferences(db))


@router.put("/preferences", response_model=PreferencesSchema)
def update_preferences(payload: PreferencesSchema, db: Session = Depends(get_session)):
    prefs = _get_or_create_preferences(db)
    data = payload.model_dump(exclude_unset=True)
    if "life_priorities" in data:
        prefs.life_priorities = json.dumps(data.pop("life_priorities"), ensure_ascii=False)
    for k, v in data.items():
        setattr(prefs, k, v)
    prefs.updated_at = datetime.utcnow().isoformat()
    db.commit()
    db.refresh(prefs)
    return _prefs_to_schema(prefs)


# ──── Documentos do perfil ────

@router.post("/identity/extract")
async def extract_identity_endpoint(
    file: UploadFile = File(...),
    kind: str = Form("other"),
    db: Session = Depends(get_session),
):
    mime = (file.content_type or "").lower()
    if mime not in ACCEPTED_MIMES:
        raise HTTPException(400, f"Tipo não suportado: {mime!r}")
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Arquivo maior que 10 MB")
    if not content:
        raise HTTPException(400, "Arquivo vazio")

    upload_dir = _ensure_upload_dir()
    suffix = Path(file.filename or "").suffix or {
        "image/jpeg": ".jpg", "image/jpg": ".jpg",
        "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif",
        "application/pdf": ".pdf",
    }.get(mime, ".bin")
    safe_name = f"{datetime.utcnow().strftime('%Y%m%dT%H%M%S')}-{secrets.token_hex(6)}{suffix}"
    storage_path = upload_dir / safe_name
    storage_path.write_bytes(content)

    try:
        extracted = extract_identity(content, mime)
    except Exception as e:
        try:
            storage_path.unlink(missing_ok=True)
        except Exception:
            pass
        raise HTTPException(502, f"Falha na extração: {e}")

    identity = _get_or_create_identity(db)
    doc = IdentityDocument(
        identity_id=identity.id, kind=kind or "other",
        filename=file.filename or safe_name,
        storage_path=str(storage_path), mime_type=mime,
        size_bytes=len(content), uploaded_at=datetime.utcnow().isoformat(),
        extracted_fields=json.dumps(extracted, ensure_ascii=False),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "document_id": doc.id,
        "filename": doc.filename,
        "mime_type": doc.mime_type,
        "extracted": extracted,
    }


@router.get("/identity/documents")
def list_identity_documents(db: Session = Depends(get_session)):
    docs = db.query(IdentityDocument).order_by(IdentityDocument.id.desc()).all()
    return [
        {
            "id": d.id, "kind": d.kind, "filename": d.filename,
            "mime_type": d.mime_type, "size_bytes": d.size_bytes,
            "uploaded_at": d.uploaded_at,
        }
        for d in docs
    ]


@router.get("/identity/documents/{doc_id}")
def get_identity_document(doc_id: int, db: Session = Depends(get_session)):
    doc: Optional[IdentityDocument] = db.get(IdentityDocument, doc_id)
    if not doc:
        raise HTTPException(404, "Documento não encontrado")
    path = Path(doc.storage_path)
    if not path.exists():
        raise HTTPException(404, "Arquivo ausente no disco")
    return FileResponse(path, media_type=doc.mime_type or "application/octet-stream", filename=doc.filename)


@router.delete("/identity/documents/{doc_id}")
def delete_identity_document(doc_id: int, db: Session = Depends(get_session)):
    doc: Optional[IdentityDocument] = db.get(IdentityDocument, doc_id)
    if not doc:
        raise HTTPException(404, "Documento não encontrado")
    try:
        Path(doc.storage_path).unlink(missing_ok=True)
    except Exception:
        pass
    db.delete(doc)
    db.commit()
    return {"ok": True}


# ════════════════════════════════════════════════════════════════════
# Empresarial — Companies
# ════════════════════════════════════════════════════════════════════

@router.get("/companies", response_model=list[CompanyOut])
def list_companies(db: Session = Depends(get_session)):
    return [_company_to_out(c) for c in db.query(Company).order_by(Company.id).all()]


@router.post("/companies", response_model=CompanyOut, status_code=201)
def create_company(payload: CompanyIn, db: Session = Depends(get_session)):
    data = payload.model_dump()
    systems = data.pop("systems", [])
    c = Company(systems_json=json.dumps(systems, ensure_ascii=False), **data)
    db.add(c); db.commit(); db.refresh(c)
    return _company_to_out(c)


@router.put("/companies/{cid}", response_model=CompanyOut)
def update_company(cid: int, payload: CompanyIn, db: Session = Depends(get_session)):
    c = db.get(Company, cid)
    if not c:
        raise HTTPException(404, "Empresa não encontrada")
    data = payload.model_dump(exclude_unset=True)
    if "systems" in data:
        c.systems_json = json.dumps(data.pop("systems"), ensure_ascii=False)
    for k, v in data.items():
        setattr(c, k, v)
    db.commit(); db.refresh(c)
    return _company_to_out(c)


@router.delete("/companies/{cid}")
def delete_company(cid: int, db: Session = Depends(get_session)):
    c = db.get(Company, cid)
    if not c:
        raise HTTPException(404, "Empresa não encontrada")
    db.delete(c); db.commit()
    return {"ok": True}


# ──── Partners (sócios da empresa) ────

@router.get("/companies/{cid}/partners", response_model=list[PartnerOut])
def list_partners(cid: int, db: Session = Depends(get_session)):
    if not db.get(Company, cid):
        raise HTTPException(404, "Empresa não encontrada")
    return db.query(Partner).filter_by(company_id=cid).order_by(Partner.id).all()


@router.post("/companies/{cid}/partners", response_model=PartnerOut, status_code=201)
def create_partner(cid: int, payload: PartnerIn, db: Session = Depends(get_session)):
    if not db.get(Company, cid):
        raise HTTPException(404, "Empresa não encontrada")
    p = Partner(company_id=cid, **payload.model_dump())
    db.add(p); db.commit(); db.refresh(p)
    return p


@router.put("/partners/{pid}", response_model=PartnerOut)
def update_partner(pid: int, payload: PartnerIn, db: Session = Depends(get_session)):
    p = db.get(Partner, pid)
    if not p:
        raise HTTPException(404, "Sócio não encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit(); db.refresh(p)
    return p


@router.delete("/partners/{pid}")
def delete_partner(pid: int, db: Session = Depends(get_session)):
    p = db.get(Partner, pid)
    if not p:
        raise HTTPException(404, "Sócio não encontrado")
    db.delete(p); db.commit()
    return {"ok": True}


# ──── Profissionais de confiança (globais) ────

@router.get("/professionals", response_model=list[ProfessionalOut])
def list_professionals(db: Session = Depends(get_session)):
    return db.query(TrustedProfessional).order_by(TrustedProfessional.id).all()


@router.post("/professionals", response_model=ProfessionalOut, status_code=201)
def create_professional(payload: ProfessionalIn, db: Session = Depends(get_session)):
    pr = TrustedProfessional(**payload.model_dump())
    db.add(pr); db.commit(); db.refresh(pr)
    return pr


@router.put("/professionals/{pid}", response_model=ProfessionalOut)
def update_professional(pid: int, payload: ProfessionalIn, db: Session = Depends(get_session)):
    pr = db.get(TrustedProfessional, pid)
    if not pr:
        raise HTTPException(404, "Profissional não encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(pr, k, v)
    db.commit(); db.refresh(pr)
    return pr


@router.delete("/professionals/{pid}")
def delete_professional(pid: int, db: Session = Depends(get_session)):
    pr = db.get(TrustedProfessional, pid)
    if not pr:
        raise HTTPException(404, "Profissional não encontrado")
    db.delete(pr); db.commit()
    return {"ok": True}


# ════════════════════════════════════════════════════════════════════
# Família
# ════════════════════════════════════════════════════════════════════

@router.get("/family", response_model=list[FamilyMemberOut])
def list_family(db: Session = Depends(get_session)):
    return db.query(FamilyMember).order_by(FamilyMember.id).all()


@router.post("/family", response_model=FamilyMemberOut, status_code=201)
def create_family_member(payload: FamilyMemberIn, db: Session = Depends(get_session)):
    m = FamilyMember(**payload.model_dump())
    db.add(m); db.commit(); db.refresh(m)
    return m


@router.put("/family/{fid}", response_model=FamilyMemberOut)
def update_family_member(fid: int, payload: FamilyMemberIn, db: Session = Depends(get_session)):
    m = db.get(FamilyMember, fid)
    if not m:
        raise HTTPException(404, "Membro não encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(m, k, v)
    db.commit(); db.refresh(m)
    return m


@router.delete("/family/{fid}")
def delete_family_member(fid: int, db: Session = Depends(get_session)):
    m = db.get(FamilyMember, fid)
    if not m:
        raise HTTPException(404, "Membro não encontrado")
    db.delete(m); db.commit()
    return {"ok": True}


# ──── Médicos da família ────

@router.get("/family-doctors", response_model=list[FamilyDoctorOut])
def list_family_doctors(db: Session = Depends(get_session)):
    return db.query(FamilyDoctor).order_by(FamilyDoctor.id).all()


@router.post("/family-doctors", response_model=FamilyDoctorOut, status_code=201)
def create_family_doctor(payload: FamilyDoctorIn, db: Session = Depends(get_session)):
    d = FamilyDoctor(**payload.model_dump())
    db.add(d); db.commit(); db.refresh(d)
    return d


@router.put("/family-doctors/{did}", response_model=FamilyDoctorOut)
def update_family_doctor(did: int, payload: FamilyDoctorIn, db: Session = Depends(get_session)):
    d = db.get(FamilyDoctor, did)
    if not d:
        raise HTTPException(404, "Médico não encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(d, k, v)
    db.commit(); db.refresh(d)
    return d


@router.delete("/family-doctors/{did}")
def delete_family_doctor(did: int, db: Session = Depends(get_session)):
    d = db.get(FamilyDoctor, did)
    if not d:
        raise HTTPException(404, "Médico não encontrado")
    db.delete(d); db.commit()
    return {"ok": True}


# ════════════════════════════════════════════════════════════════════
# Financeiro — Investimentos + Imóveis
# ════════════════════════════════════════════════════════════════════

@router.get("/investments", response_model=list[InvestmentOut])
def list_investments(db: Session = Depends(get_session)):
    return db.query(Investment).order_by(Investment.id).all()


@router.post("/investments", response_model=InvestmentOut, status_code=201)
def create_investment(payload: InvestmentIn, db: Session = Depends(get_session)):
    inv = Investment(**payload.model_dump())
    db.add(inv); db.commit(); db.refresh(inv)
    return inv


@router.put("/investments/{iid}", response_model=InvestmentOut)
def update_investment(iid: int, payload: InvestmentIn, db: Session = Depends(get_session)):
    inv = db.get(Investment, iid)
    if not inv:
        raise HTTPException(404, "Investimento não encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(inv, k, v)
    db.commit(); db.refresh(inv)
    return inv


@router.delete("/investments/{iid}")
def delete_investment(iid: int, db: Session = Depends(get_session)):
    inv = db.get(Investment, iid)
    if not inv:
        raise HTTPException(404, "Investimento não encontrado")
    db.delete(inv); db.commit()
    return {"ok": True}


@router.get("/real-estate", response_model=list[RealEstateOut])
def list_real_estate(db: Session = Depends(get_session)):
    return db.query(RealEstate).order_by(RealEstate.id).all()


@router.post("/real-estate", response_model=RealEstateOut, status_code=201)
def create_real_estate(payload: RealEstateIn, db: Session = Depends(get_session)):
    re_ = RealEstate(**payload.model_dump())
    db.add(re_); db.commit(); db.refresh(re_)
    return re_


@router.put("/real-estate/{rid}", response_model=RealEstateOut)
def update_real_estate(rid: int, payload: RealEstateIn, db: Session = Depends(get_session)):
    re_ = db.get(RealEstate, rid)
    if not re_:
        raise HTTPException(404, "Imóvel não encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(re_, k, v)
    db.commit(); db.refresh(re_)
    return re_


@router.delete("/real-estate/{rid}")
def delete_real_estate(rid: int, db: Session = Depends(get_session)):
    re_ = db.get(RealEstate, rid)
    if not re_:
        raise HTTPException(404, "Imóvel não encontrado")
    db.delete(re_); db.commit()
    return {"ok": True}


# ════════════════════════════════════════════════════════════════════
# Jurídico — LegalCase + Contract
# ════════════════════════════════════════════════════════════════════

@router.get("/legal-cases", response_model=list[LegalCaseOut])
def list_legal_cases(db: Session = Depends(get_session)):
    return db.query(LegalCase).order_by(LegalCase.id).all()


@router.post("/legal-cases", response_model=LegalCaseOut, status_code=201)
def create_legal_case(payload: LegalCaseIn, db: Session = Depends(get_session)):
    lc = LegalCase(**payload.model_dump())
    db.add(lc); db.commit(); db.refresh(lc)
    return lc


@router.put("/legal-cases/{lid}", response_model=LegalCaseOut)
def update_legal_case(lid: int, payload: LegalCaseIn, db: Session = Depends(get_session)):
    lc = db.get(LegalCase, lid)
    if not lc:
        raise HTTPException(404, "Processo não encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(lc, k, v)
    db.commit(); db.refresh(lc)
    return lc


@router.delete("/legal-cases/{lid}")
def delete_legal_case(lid: int, db: Session = Depends(get_session)):
    lc = db.get(LegalCase, lid)
    if not lc:
        raise HTTPException(404, "Processo não encontrado")
    db.delete(lc); db.commit()
    return {"ok": True}


@router.get("/contracts", response_model=list[ContractOut])
def list_contracts(db: Session = Depends(get_session)):
    return db.query(Contract).order_by(Contract.id).all()


@router.post("/contracts", response_model=ContractOut, status_code=201)
def create_contract(payload: ContractIn, db: Session = Depends(get_session)):
    c = Contract(**payload.model_dump())
    db.add(c); db.commit(); db.refresh(c)
    return c


@router.put("/contracts/{cid}", response_model=ContractOut)
def update_contract(cid: int, payload: ContractIn, db: Session = Depends(get_session)):
    c = db.get(Contract, cid)
    if not c:
        raise HTTPException(404, "Contrato não encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit(); db.refresh(c)
    return c


@router.delete("/contracts/{cid}")
def delete_contract(cid: int, db: Session = Depends(get_session)):
    c = db.get(Contract, cid)
    if not c:
        raise HTTPException(404, "Contrato não encontrado")
    db.delete(c); db.commit()
    return {"ok": True}


# ════════════════════════════════════════════════════════════════════
# Acessos — Cofre criptografado
# ════════════════════════════════════════════════════════════════════

@router.get("/vault", response_model=list[VaultEntryOut])
def list_vault(category: Optional[str] = None, db: Session = Depends(get_session)):
    q = db.query(VaultEntry)
    if category:
        q = q.filter(VaultEntry.category == category)
    return q.order_by(VaultEntry.id).all()


@router.post("/vault", response_model=VaultEntryOut, status_code=201)
def create_vault_entry(payload: VaultEntryIn, db: Session = Depends(get_session)):
    v = VaultEntry(**payload.model_dump())
    db.add(v); db.commit(); db.refresh(v)
    return v


@router.put("/vault/{vid}", response_model=VaultEntryOut)
def update_vault_entry(vid: int, payload: VaultEntryIn, db: Session = Depends(get_session)):
    v = db.get(VaultEntry, vid)
    if not v:
        raise HTTPException(404, "Entrada não encontrada")
    data = payload.model_dump(exclude_unset=True)
    # Se password vier vazio/None, não sobrescreve a existente
    if "password" in data and not data["password"]:
        data.pop("password")
    for k, val in data.items():
        setattr(v, k, val)
    db.commit(); db.refresh(v)
    return v


@router.delete("/vault/{vid}")
def delete_vault_entry(vid: int, db: Session = Depends(get_session)):
    v = db.get(VaultEntry, vid)
    if not v:
        raise HTTPException(404, "Entrada não encontrada")
    db.delete(v); db.commit()
    return {"ok": True}


@router.get("/vault/{vid}/reveal", response_model=VaultEntryReveal)
def reveal_vault_entry(vid: int, db: Session = Depends(get_session)):
    v = db.get(VaultEntry, vid)
    if not v:
        raise HTTPException(404, "Entrada não encontrada")
    return VaultEntryReveal(id=v.id, password=v.password)


# ════════════════════════════════════════════════════════════════════
# Objetivos — Goals
# ════════════════════════════════════════════════════════════════════

@router.get("/goals", response_model=list[GoalOut])
def list_goals(db: Session = Depends(get_session)):
    return db.query(Goal).order_by(Goal.id).all()


@router.post("/goals", response_model=GoalOut, status_code=201)
def create_goal(payload: GoalIn, db: Session = Depends(get_session)):
    g = Goal(**payload.model_dump())
    db.add(g); db.commit(); db.refresh(g)
    return g


@router.put("/goals/{gid}", response_model=GoalOut)
def update_goal(gid: int, payload: GoalIn, db: Session = Depends(get_session)):
    g = db.get(Goal, gid)
    if not g:
        raise HTTPException(404, "Meta não encontrada")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(g, k, v)
    db.commit(); db.refresh(g)
    return g


@router.delete("/goals/{gid}")
def delete_goal(gid: int, db: Session = Depends(get_session)):
    g = db.get(Goal, gid)
    if not g:
        raise HTTPException(404, "Meta não encontrada")
    db.delete(g); db.commit()
    return {"ok": True}


# ════════════════════════════════════════════════════════════════════
# Banner stats — counts pra topo da tela /quem-sou-eu
# ════════════════════════════════════════════════════════════════════

@router.get("/banner-stats", response_model=BannerStats)
def banner_stats(db: Session = Depends(get_session)):
    today = date.today()
    soon = today + timedelta(days=7)
    deadline_soon = (
        db.query(LegalCase)
        .filter(LegalCase.status == "active")
        .filter(LegalCase.next_deadline.isnot(None))
        .filter(LegalCase.next_deadline <= soon)
        .filter(LegalCase.next_deadline >= today)
        .first()
        is not None
    )
    return BannerStats(
        companies=db.query(Company).filter_by(is_active=True).count(),
        legal_cases_active=db.query(LegalCase).filter_by(status="active").count(),
        real_estate=db.query(RealEstate).count(),
        goals_open=(
            db.query(Goal)
            .filter(Goal.year == today.year)
            .filter(Goal.is_done.is_(False))
            .count()
        ),
        legal_deadline_soon=deadline_soon,
    )
