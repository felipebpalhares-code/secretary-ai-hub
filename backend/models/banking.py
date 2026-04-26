"""
Tabelas pra cachear dados bancários puxados do Pluggy.
Reduz roundtrips e permite trabalhar offline com o último snapshot.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Index
from models.profile import Base


class PluggyConnection(Base):
    """1 connection = 1 banco vinculado (item no Pluggy)."""
    __tablename__ = "pluggy_connection"

    id            = Column(Integer, primary_key=True)
    pluggy_item_id = Column(String, unique=True, index=True)  # UUID do Pluggy
    bank_name     = Column(String)
    bank_image_url = Column(String, nullable=True)
    entity        = Column(String)  # "pf" | "palharestech" | "braz" | "vimar"
    status        = Column(String)  # UPDATED / OUTDATED / WAITING_USER_INPUT / LOGIN_ERROR
    last_synced_at = Column(DateTime, nullable=True)
    created_at    = Column(DateTime, default=datetime.utcnow)


class PluggyAccount(Base):
    """Conta corrente / poupança / investimento de um banco."""
    __tablename__ = "pluggy_account"

    id            = Column(Integer, primary_key=True)
    pluggy_id     = Column(String, unique=True, index=True)
    pluggy_item_id = Column(String, index=True)
    name          = Column(String)
    number        = Column(String)
    agency        = Column(String, nullable=True)
    type          = Column(String)   # CHECKING / SAVINGS / INVESTMENT
    subtype       = Column(String, nullable=True)
    balance       = Column(Float, default=0.0)
    currency      = Column(String, default="BRL")
    entity        = Column(String)
    is_primary    = Column(Integer, default=0)
    last_synced_at = Column(DateTime, default=datetime.utcnow)


class PluggyTransaction(Base):
    """Lançamentos individuais."""
    __tablename__ = "pluggy_transaction"

    id            = Column(Integer, primary_key=True)
    pluggy_id     = Column(String, unique=True, index=True)
    account_id    = Column(String, index=True)         # ref pluggy_account.pluggy_id
    date          = Column(DateTime, index=True)
    amount        = Column(Float)                       # positivo entrada, negativo saída
    description   = Column(String)
    description_raw = Column(String, nullable=True)
    category      = Column(String, nullable=True)       # categorização Pluggy
    category_id   = Column(String, nullable=True)
    type          = Column(String)                      # CREDIT / DEBIT
    balance       = Column(Float, nullable=True)        # saldo após a transação
    currency      = Column(String, default="BRL")

    # Enriquecimento local (Ricardo classifica)
    agent_category  = Column(String, nullable=True)     # "material-obra", "fornecedor", etc.
    agent_assigned  = Column(String, nullable=True)     # "ricardo", "marcos", "eng", etc
    cost_center_id  = Column(Integer, nullable=True)    # link com Centro de Custo (Finanças)
    notes           = Column(String, nullable=True)
    conciliated     = Column(Integer, default=0)


Index("idx_pluggy_tx_account_date", PluggyTransaction.account_id, PluggyTransaction.date.desc())
