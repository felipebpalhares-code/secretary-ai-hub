"""
Sprint E — Migration idempotente de Contact.company_name → Organization.

Uso (dentro do container backend):
    docker compose exec backend python scripts/migrate_contact_company_names.py

Lógica:
  1. Busca contatos com organization_id IS NULL AND company_name IS NOT NULL/empty.
  2. Agrupa por company_name.strip().lower() (ignora vazios após strip).
  3. Pra cada grupo:
     - Se já existe Organization com lower(name) = grupo, reusa.
     - Senão cria Organization usando o company_name original do primeiro
       contato do grupo (preserva capitalização que o Felipe digitou).
  4. Seta Contact.organization_id em todos os contatos do grupo.
  5. NÃO apaga company_name. A coluna fica como shadow read-only até o
     cleanup físico em sprint futura (depois que a UI estiver toda usando
     organization_id).

Idempotente: rodar duas vezes não duplica Organization nem revira o link
(o filtro 'organization_id IS NULL' garante que contatos já vinculados são
ignorados).

Output: 'migrados N contatos em M organizations'.
"""
from __future__ import annotations
import sys
from pathlib import Path

# Permite import absoluto a partir de backend/ quando rodado como script
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import func  # noqa: E402

from services.database import SessionLocal  # noqa: E402
from models.contact import Contact, Organization  # noqa: E402


def run() -> tuple[int, int]:
    """Executa a migração e retorna (contatos_migrados, organizations_envolvidas)."""
    contacts_migrated = 0
    orgs_touched: set[int] = set()

    with SessionLocal() as db:
        # Mapa em memória de Organization existentes por nome lowercase pra evitar
        # múltiplas queries quando contatos compartilham empresa.
        existing_by_lower = {
            o.name.strip().lower(): o
            for o in db.query(Organization).all()
            if o.name
        }

        candidates = (
            db.query(Contact)
            .filter(Contact.organization_id.is_(None))
            .filter(Contact.company_name.isnot(None))
            .all()
        )

        # Agrupa por chave normalizada
        groups: dict[str, list[Contact]] = {}
        first_label: dict[str, str] = {}
        for c in candidates:
            raw = (c.company_name or "").strip()
            if not raw:
                continue
            key = raw.lower()
            groups.setdefault(key, []).append(c)
            first_label.setdefault(key, raw)  # preserva capitalização do primeiro

        for key, group in groups.items():
            org = existing_by_lower.get(key)
            if org is None:
                org = Organization(name=first_label[key])
                db.add(org)
                db.flush()  # garante org.id antes de vincular
                existing_by_lower[key] = org

            for c in group:
                c.organization_id = org.id
                contacts_migrated += 1
            orgs_touched.add(org.id)

        db.commit()

    return contacts_migrated, len(orgs_touched)


if __name__ == "__main__":
    n, m = run()
    print(f"migrados {n} contatos em {m} organizations")
