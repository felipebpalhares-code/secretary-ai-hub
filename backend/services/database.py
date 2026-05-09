"""
Sessão SQLAlchemy compartilhada (SQLite local).
"""
import logging
import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from models.profile import Base
import models.message_log     # noqa: F401  (garante registro da tabela no metadata)
import models.banking         # noqa: F401
import models.task            # noqa: F401
import models.agent           # noqa: F401
import models.oauth_credential  # noqa: F401
import models.contact         # noqa: F401

log = logging.getLogger(__name__)

# Em Docker, DATABASE_PATH=/data/felipe_hub.db (volume persistido).
# Local: cria felipe_hub.db na raiz do backend.
DATABASE_PATH = os.getenv("DATABASE_PATH", "./felipe_hub.db")
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)


# Mini-runner de migrations idempotentes pra SQLite.
# Não usamos Alembic, então `create_all` cria tabelas novas mas não adiciona
# colunas em tabelas pré-existentes. Cada item aqui é um ALTER TABLE que só roda
# se a coluna ainda não existe.
_RUNTIME_COLUMN_MIGRATIONS: list[tuple[str, str, str]] = [
    # (tabela, coluna, DDL completo do ALTER TABLE)
    ("contacts", "organization_id",
     "ALTER TABLE contacts ADD COLUMN organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL"),
]


def _apply_runtime_migrations() -> None:
    insp = inspect(engine)
    existing = set(insp.get_table_names())
    with engine.begin() as conn:
        for table, column, ddl in _RUNTIME_COLUMN_MIGRATIONS:
            if table not in existing:
                continue
            cols = {c["name"] for c in insp.get_columns(table)}
            if column in cols:
                continue
            conn.execute(text(ddl))
            log.info("Runtime migration aplicada: %s.%s", table, column)


def _drop_company_name_if_safe() -> None:
    """
    Sprint F — finaliza a transição Sprint E removendo o shadow `company_name`.
    Pula com warning se ainda há contatos com a coluna preenchida (operador
    precisa rodar scripts/migrate_contact_company_names.py antes).
    Pula sem warning se a coluna já foi removida (idempotente).
    """
    insp = inspect(engine)
    if "contacts" not in insp.get_table_names():
        return
    cols = {c["name"] for c in insp.get_columns("contacts")}
    if "company_name" not in cols:
        return  # já removida

    with engine.connect() as conn:
        leftover = conn.execute(text(
            "SELECT COUNT(*) FROM contacts "
            "WHERE company_name IS NOT NULL AND TRIM(company_name) != ''"
        )).scalar() or 0

    if leftover > 0:
        log.warning(
            "DROP company_name pulado: %d contatos ainda com a coluna preenchida. "
            "Rode 'python scripts/migrate_contact_company_names.py' antes.",
            leftover,
        )
        return

    sqlite_v = engine.dialect.dbapi.sqlite_version
    try:
        major, minor, *_ = (int(x) for x in sqlite_v.split("."))
    except (TypeError, ValueError):
        major, minor = 0, 0
    if (major, minor) < (3, 35):
        log.warning(
            "DROP COLUMN não suportado em SQLite %s — coluna company_name mantida",
            sqlite_v,
        )
        return

    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE contacts DROP COLUMN company_name"))
    log.info("DROP COLUMN contacts.company_name aplicado")


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    _apply_runtime_migrations()
    _drop_company_name_if_safe()


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
