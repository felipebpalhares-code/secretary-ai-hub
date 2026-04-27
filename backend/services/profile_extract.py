"""
Extrai campos de identidade (CNH/RG/passaporte) a partir de imagem ou PDF
usando Claude com visão. Retorna dict compatível com IdentitySchema.
"""
from __future__ import annotations
import base64
import json
import os
import re
from typing import Any

import anthropic

MODEL = os.getenv("CLAUDE_VISION_MODEL", "claude-sonnet-4-6")

EXTRACT_PROMPT = """Você está analisando um documento brasileiro de identidade (CNH, RG, passaporte ou similar) enviado pelo usuário.

Extraia os campos abaixo e retorne **APENAS um objeto JSON válido**, sem comentários, sem markdown, sem texto adicional. Use `null` para campos que não conseguir identificar com segurança.

Schema esperado:
{
  "full_name": string | null,           // nome completo, preservando acentos
  "nickname": string | null,            // só se aparecer; senão null
  "birth_date": "YYYY-MM-DD" | null,    // data de nascimento em ISO
  "cpf": string | null,                 // só os 11 dígitos, sem pontos/traços
  "rg": string | null,                  // como aparece (com dígito verificador se houver)
  "cnh_number": string | null,          // número de registro da CNH
  "cnh_expiry": "YYYY-MM-DD" | null,    // validade da CNH em ISO
  "cnh_category": string | null,        // "A", "B", "AB", "C", "D" ou "E"
  "passport_number": string | null,     // número do passaporte
  "passport_expiry": "YYYY-MM-DD" | null,
  "marital_status": string | null,      // "casado", "solteiro", etc., em minúsculas
  "religion": string | null,            // se houver
  "birthplace": string | null           // cidade — UF da naturalidade
}

Regras:
- Datas brasileiras (DD/MM/AAAA) devem ser convertidas para ISO (AAAA-MM-DD).
- CPF apenas dígitos (sem máscara).
- Se o documento for de outra pessoa (não combina com identidade pessoal), retorne tudo null.
- Não invente. Se não tiver certeza, use null.

Responda apenas com o JSON."""


def _media_type(mime: str) -> str:
    """Normaliza mime type pro formato que a Anthropic API aceita."""
    m = (mime or "").lower().strip()
    if m in ("image/jpg",):
        return "image/jpeg"
    if m in ("image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"):
        return m
    return m


def _build_content_block(content: bytes, mime: str) -> dict[str, Any]:
    media_type = _media_type(mime)
    b64 = base64.standard_b64encode(content).decode("ascii")
    if media_type == "application/pdf":
        return {
            "type": "document",
            "source": {"type": "base64", "media_type": media_type, "data": b64},
        }
    return {
        "type": "image",
        "source": {"type": "base64", "media_type": media_type, "data": b64},
    }


def _strip_json(text: str) -> str:
    """Remove cercas de markdown (```json ... ```) caso o modelo as inclua."""
    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fenced:
        return fenced.group(1)
    # fallback: tenta achar o primeiro `{...}` balanceado
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end > start:
        return text[start : end + 1]
    return text


def extract_identity(content: bytes, mime: str) -> dict[str, Any]:
    """
    Chama Claude com vision/document e devolve dict parcial pronto pra IdentitySchema.
    Levanta RuntimeError se a chave não estiver setada ou o modelo retornar resposta inválida.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY não configurada no backend")

    client = anthropic.Anthropic(api_key=api_key)

    msg = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": [
                    _build_content_block(content, mime),
                    {"type": "text", "text": EXTRACT_PROMPT},
                ],
            }
        ],
    )

    text = "".join(
        block.text for block in msg.content if getattr(block, "type", None) == "text"
    ).strip()
    if not text:
        raise RuntimeError("Resposta vazia do modelo")

    raw = _strip_json(text)
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Modelo retornou JSON inválido: {e}\nResposta: {text[:500]}")

    if not isinstance(data, dict):
        raise RuntimeError("Modelo retornou JSON mas não é um objeto")

    # Filtra só os campos válidos do schema
    allowed = {
        "full_name", "nickname", "birth_date", "cpf", "rg",
        "cnh_number", "cnh_expiry", "cnh_category",
        "passport_number", "passport_expiry",
        "marital_status", "religion", "birthplace",
    }
    return {k: v for k, v in data.items() if k in allowed and v is not None}
