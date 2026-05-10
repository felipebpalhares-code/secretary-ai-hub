"""
Alembic environment.

Lê DATABASE_PATH (igual a services/database.py) para garantir que migrations
rodam contra o mesmo SQLite usado pela aplicação. Em testes, conftest.py seta
DATABASE_PATH antes de importar qualquer coisa do app.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from sqlalchemy import engine_from_config, pool
from alembic import context

# Permite importar models a partir de backend/
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Importa Base + todos os models para que target_metadata os enxergue
from models.profile import Base  # noqa: E402
import models.banking  # noqa: F401, E402
import models.contact  # noqa: F401, E402
import models.message_log  # noqa: F401, E402
import models.task  # noqa: F401, E402
import models.agent  # noqa: F401, E402
import models.oauth_credential  # noqa: F401, E402

config = context.config

# Não chamamos fileConfig() de propósito: ele reconfigura loggers globais e
# quebra fixtures como caplog quando init_db() roda dentro de testes pytest.
# Logs do Alembic herdam o root logger normalmente.

# Override sqlalchemy.url para honrar DATABASE_PATH em runtime.
DATABASE_PATH = os.getenv("DATABASE_PATH", "./felipe_hub.db")
config.set_main_option("sqlalchemy.url", f"sqlite:///{DATABASE_PATH}")

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True,  # SQLite precisa de batch mode pra ALTER COLUMN
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
