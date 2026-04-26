"""
Log unificado de mensagens externas (WhatsApp, Telegram, Discord).
Permite busca cruzada entre canais no painel do hub.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Index
from models.profile import Base


class MessageLog(Base):
    __tablename__ = "message_log"

    id         = Column(Integer, primary_key=True)
    channel    = Column(String, index=True)     # "whatsapp" | "telegram" | "discord"
    direction  = Column(String)                 # "in" (user→bot) | "out" (bot→user)
    sender     = Column(String, index=True)     # número, username ou user_id
    agent      = Column(String, nullable=True)  # "silva" | "ricardo" | ... | "hub" | None
    body       = Column(Text)
    flag       = Column(String, nullable=True)  # "urgent" | "confirmation" | "alert" | None
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


Index("idx_msglog_channel_date", MessageLog.channel, MessageLog.created_at)
