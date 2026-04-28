"""
Limpa todos os dados de aplicação do Felipe Hub, deixando o sistema em branco.

Uso (dentro do container backend):
    python /app/scripts/cleanup_data.py

Faz:
  - Drop + create all tables (reseta autoincrement)
  - Apaga arquivos em /data/uploads/

Não toca em:
  - Configurações (env, .env) — externas ao banco
  - Credenciais de login (Hostinger/SSH/GitHub) — externas ao app
  - Schemas/migrações — só os DADOS

NOTA: este projeto não tem tabela `users` (sistema single-user sem auth).
Não há credencial dentro do banco a preservar.

Idempotente: pode rodar quantas vezes quiser. Se já estiver zerado, só confirma.
"""
from __future__ import annotations
import os
import shutil
import sys
from pathlib import Path

# Garante que `backend/` está no sys.path quando rodando como script
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import inspect, text  # noqa: E402

from services.database import engine, SessionLocal  # noqa: E402
from models.profile import Base  # noqa: E402
import models.profile      # noqa: F401 E402
import models.message_log  # noqa: F401 E402
import models.banking      # noqa: F401 E402
import models.task         # noqa: F401 E402

UPLOAD_ROOT = Path(os.getenv("UPLOAD_ROOT", "/data/uploads"))


def count_rows() -> dict[str, int]:
    db = SessionLocal()
    out: dict[str, int] = {}
    for t in sorted(inspect(engine).get_table_names()):
        try:
            out[t] = db.execute(text(f"SELECT COUNT(*) FROM {t}")).scalar() or 0
        except Exception as e:
            out[t] = -1
            print(f"  ⚠ {t}: {e}", flush=True)
    db.close()
    return out


def cleanup_database() -> tuple[int, int]:
    """Drop+create todas as tabelas. Retorna (linhas_antes, tabelas)."""
    before = count_rows()
    total_before = sum(v for v in before.values() if v >= 0)
    print(f"Estado antes: {total_before} linhas em {len(before)} tabelas")
    for t, n in before.items():
        if n > 0:
            print(f"  · {t}: {n}", flush=True)

    print("\nDrop all tables…", flush=True)
    Base.metadata.drop_all(engine)
    # Drop tabelas órfãs que existem no DB mas não no metadata
    insp = inspect(engine)
    orphans = set(insp.get_table_names())
    if orphans:
        with engine.begin() as conn:
            for t in orphans:
                try:
                    conn.execute(text(f"DROP TABLE IF EXISTS {t}"))
                    print(f"  · drop órfã {t}", flush=True)
                except Exception as e:
                    print(f"  ⚠ {t}: {e}", flush=True)

    print("Recreate all tables…", flush=True)
    Base.metadata.create_all(engine)

    after = count_rows()
    total_after = sum(v for v in after.values() if v >= 0)
    print(f"\nEstado depois: {total_after} linhas em {len(after)} tabelas", flush=True)
    return total_before, len(after)


def cleanup_uploads() -> int:
    """Remove arquivos em /data/uploads. Retorna quantos arquivos apagados."""
    if not UPLOAD_ROOT.exists():
        print(f"\n{UPLOAD_ROOT} não existe — nada pra apagar", flush=True)
        return 0
    files = [f for f in UPLOAD_ROOT.rglob("*") if f.is_file()]
    n = len(files)
    if n == 0:
        print(f"\n{UPLOAD_ROOT}: 0 arquivos", flush=True)
        return 0
    print(f"\nApagando {n} arquivo(s) em {UPLOAD_ROOT}…", flush=True)
    for sub in UPLOAD_ROOT.iterdir():
        if sub.is_dir():
            shutil.rmtree(sub)
        else:
            sub.unlink()
    # Recria subdir esperado pra extract
    (UPLOAD_ROOT / "identity").mkdir(parents=True, exist_ok=True)
    return n


def main():
    print("═" * 60)
    print("Felipe Hub — Cleanup de dados")
    print("═" * 60)
    print()
    rows_before, table_count = cleanup_database()
    files_deleted = cleanup_uploads()
    print()
    print("═" * 60)
    print(f"✓ {rows_before} linhas removidas de {table_count} tabelas")
    print(f"✓ {files_deleted} arquivo(s) apagados em /data/uploads")
    print("✓ Schemas recriados (autoincrement zerado)")
    print("═" * 60)


if __name__ == "__main__":
    main()
