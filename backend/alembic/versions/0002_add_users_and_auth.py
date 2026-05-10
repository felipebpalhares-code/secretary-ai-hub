"""add users + created_by_user_id em tabelas operacionais.

Cria a tabela `users` (com guard pra DB já existente que rodou create_all
primeiro) e adiciona FK `created_by_user_id` nullable nas 22 tabelas
operacionais que representam dados criados pelo usuário (contatos,
empresas, tarefas, agentes, profile, banking, etc.). Tabelas de sistema
ficam fora: message_log, oauth_credentials, contact_categories,
contact_tags*, google_sync_state, agent_conversations, agent_messages,
pluggy_account, pluggy_transaction, addresses, identity_documents,
personal_identity, agent_preferences.

O bootstrap do admin e o backfill de created_by_user_id são feitos no
startup do FastAPI (services.user_service.bootstrap_admin_if_needed) — não
nesta migration — pra que mudanças em BOOTSTRAP_ADMIN_PASSWORD funcionem
sem rodar migrations de novo.

Revision ID: 0002_add_users_and_auth
Revises: 0001_baseline
Create Date: 2026-05-10
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0002_add_users_and_auth"
down_revision: Union[str, None] = "0001_baseline"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Tabelas onde a coluna created_by_user_id deve ser adicionada (Sprint H).
# Lista revisada com Felipe — em todas as tabelas razoáveis. Tabelas puramente
# de sistema (logs, lookups, sync state, sub-entidades) ficam de fora.
TABLES_WITH_AUDIT: tuple[str, ...] = (
    # Contatos & empresas
    "contacts",
    "organizations",
    # Tarefas
    "tasks",
    "task_columns",
    # Agentes IA
    "agents",
    "agent_documents",
    "agent_webhooks",
    "agent_instructions",
    # Banking (apenas a connection — accounts/transactions são sync de sistema)
    "pluggy_connection",
    # Profile
    "companies",
    "partners",
    "trusted_professionals",
    "family_members",
    "family_doctors",
    "bank_accounts",
    "credit_cards",
    "investments",
    "real_estate",
    "legal_cases",
    "contracts",
    "vault_entries",
    "goals",
)


def _users_table_exists(bind) -> bool:
    insp = sa.inspect(bind)
    return "users" in set(insp.get_table_names())


def _has_column(bind, table: str, column: str) -> bool:
    insp = sa.inspect(bind)
    if table not in set(insp.get_table_names()):
        return False
    return column in {c["name"] for c in insp.get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()

    # 1) Tabela users — guard porque create_all() em init_db() pode tê-la criado
    if not _users_table_exists(bind):
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("email", sa.String(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("hashed_password", sa.String(), nullable=False),
            sa.Column(
                "role",
                sa.Enum("ADMIN", "ASSISTANT", name="user_role"),
                nullable=False,
                server_default="ASSISTANT",
            ),
            sa.Column("permissions", sa.JSON(), nullable=False, server_default="{}"),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column(
                "must_change_password",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            ),
            sa.Column("last_login_at", sa.DateTime(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
        )
        op.create_index("ix_users_id", "users", ["id"])
        op.create_index("ix_users_email", "users", ["email"], unique=True)

    # 2) created_by_user_id em cada tabela operacional — guards garantem
    # idempotência (pula tabelas inexistentes ou colunas já presentes).
    for table in TABLES_WITH_AUDIT:
        if not _has_column(bind, table, "_skip_marker"):  # checa tabela existente
            insp = sa.inspect(bind)
            if table not in set(insp.get_table_names()):
                continue
        if _has_column(bind, table, "created_by_user_id"):
            continue
        with op.batch_alter_table(table) as batch:
            batch.add_column(
                sa.Column("created_by_user_id", sa.Integer(), nullable=True)
            )
            batch.create_foreign_key(
                f"fk_{table}_created_by_user_id",
                "users",
                ["created_by_user_id"],
                ["id"],
                ondelete="SET NULL",
            )


def downgrade() -> None:
    bind = op.get_bind()

    for table in TABLES_WITH_AUDIT:
        if not _has_column(bind, table, "created_by_user_id"):
            continue
        with op.batch_alter_table(table) as batch:
            batch.drop_constraint(
                f"fk_{table}_created_by_user_id", type_="foreignkey"
            )
            batch.drop_column("created_by_user_id")

    if _users_table_exists(bind):
        op.drop_index("ix_users_email", table_name="users")
        op.drop_index("ix_users_id", table_name="users")
        op.drop_table("users")
