"""Smoke test do OAuth: lista os primeiros contatos via People API."""
from __future__ import annotations

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from sqlalchemy.orm import Session

from services.google.oauth_service import get_credentials


def list_sample_contacts(db: Session, limit: int = 5) -> list[dict]:
    """Retorna até `limit` contatos do Google ({"name", "email"}). Levanta exception em erro."""
    creds = get_credentials(db)
    try:
        service = build("people", "v1", credentials=creds, cache_discovery=False)
        result = (
            service.people()
            .connections()
            .list(
                resourceName="people/me",
                pageSize=max(1, min(limit, 100)),
                personFields="names,emailAddresses",
            )
            .execute()
        )
    except HttpError as e:
        raise RuntimeError(f"People API falhou: {e}") from e

    contacts: list[dict] = []
    for person in result.get("connections", []) or []:
        name = ""
        names = person.get("names", [])
        if names:
            name = names[0].get("displayName", "") or ""

        email = ""
        emails = person.get("emailAddresses", [])
        if emails:
            email = emails[0].get("value", "") or ""

        if name or email:
            contacts.append({"name": name, "email": email})
        if len(contacts) >= limit:
            break

    return contacts
