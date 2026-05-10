"""baseline (no-op) — schema pré-Sprint-H gerenciado por create_all().

A baseline é vazia de propósito. Bancos novos têm suas tabelas criadas via
Base.metadata.create_all() em init_db(); bancos já existentes são marcados
nessa revisão por _ensure_alembic_baseline() em services/database.py.

Migrations futuras (a partir de 0002) usam Alembic normalmente.

Revision ID: 0001_baseline
Revises:
Create Date: 2026-05-10
"""
from typing import Sequence, Union

revision: str = "0001_baseline"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
