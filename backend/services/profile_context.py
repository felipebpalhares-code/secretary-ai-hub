"""
Builds a context string from Felipe's profile to inject into every AI conversation.
Called by the orchestrator before each LLM request.
"""
from __future__ import annotations
from datetime import date
from sqlalchemy.orm import Session
from models.profile import (
    PersonalIdentity, Company, FamilyMember, LegalCase, Goal, AgentPreference
)


def build_context(session: Session) -> str:
    today = date.today()
    lines: list[str] = ["## Contexto do Usuário — Felipe Palhares\n"]

    # Identity
    identity = session.query(PersonalIdentity).first()
    if identity:
        age = today.year - identity.birth_date.year if identity.birth_date else "?"
        lines.append(f"**Nome:** {identity.full_name} ({identity.nickname}) — {age} anos")
        lines.append(f"**Localização:** {identity.birthplace}")
        lines.append(f"**Estado civil:** {identity.marital_status}\n")

    # Companies
    companies = session.query(Company).filter_by(is_active=True).all()
    if companies:
        lines.append("**Empresas ativas:**")
        for c in companies:
            lines.append(f"- {c.name} ({c.industry}) — {c.role}, {c.ownership_pct}%")
        lines.append("")

    # Family
    spouse = session.query(FamilyMember).filter_by(relation="conjuge").first()
    children = session.query(FamilyMember).filter_by(relation="filho").all()
    if spouse:
        lines.append(f"**Cônjuge:** {spouse.name}")
    if children:
        names = ", ".join(f"{c.name} ({today.year - c.birth_date.year if c.birth_date else '?'} anos)" for c in children)
        lines.append(f"**Filhos:** {names}")
    lines.append("")

    # Legal alerts
    active_cases = session.query(LegalCase).filter_by(status="active").all()
    urgent = [c for c in active_cases if c.next_deadline and (c.next_deadline - today).days <= 30]
    if urgent:
        lines.append("**⚠️ Prazos jurídicos próximos:**")
        for c in urgent:
            days = (c.next_deadline - today).days
            lines.append(f"- {c.case_type} nº {c.case_number} — prazo em {days} dias ({c.next_deadline.strftime('%d/%m/%Y')})")
        lines.append("")

    # Goals
    goals = session.query(Goal).filter_by(year=today.year, is_done=False).all()
    if goals:
        lines.append(f"**Metas {today.year} em andamento:**")
        for g in goals[:5]:
            lines.append(f"- [{g.category.upper()}] {g.description} ({g.progress}%)")
        lines.append("")

    # Preferences
    prefs = session.query(AgentPreference).first()
    if prefs:
        lines.append(f"**Tratamento:** Chame-o de \"{prefs.how_to_address}\"")
        lines.append(f"**Horário:** {prefs.work_hours_start}–{prefs.work_hours_end} ({prefs.work_days})")
        if prefs.communication_style:
            lines.append(f"**Estilo:** {prefs.communication_style}")

    return "\n".join(lines)
