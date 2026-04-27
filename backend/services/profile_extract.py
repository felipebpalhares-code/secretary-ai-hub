"""
Extração de campos de documentos brasileiros (CNH, RG, CPF, passaporte) via Claude Vision.

Funções públicas:
  - extract_identity(content, mime)  → schema rico pra perfil próprio (etapa 1)
                                        inclui marital_status, religion, birthplace etc.
  - extract_person(content, mime)    → schema enxuto pra terceiros (família, sócios,
                                        profissionais) — sem campos pessoais íntimos.
"""
from __future__ import annotations
import base64
import json
import os
import re
from typing import Any

import anthropic

MODEL = os.getenv("CLAUDE_VISION_MODEL", "claude-sonnet-4-6")


# ───────── prompts ─────────

EXTRACT_IDENTITY_PROMPT = """Você está analisando um documento brasileiro de identidade (CNH, RG, passaporte ou similar) enviado pelo usuário.

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


EXTRACT_PERSON_PROMPT = """Você está analisando um documento brasileiro de identidade (CNH, RG, cartão CPF ou passaporte) de uma pessoa que vai ser cadastrada em um sistema (cônjuge, filho, sócio, profissional de confiança, etc.).

Extraia APENAS um objeto JSON válido, sem comentários nem markdown. Use `null` para campos ausentes ou ilegíveis.

Schema esperado:
{
  "full_name": string | null,           // nome completo, com acentos
  "cpf": string | null,                 // 11 dígitos, sem máscara
  "rg": string | null,                  // como aparece
  "birth_date": "YYYY-MM-DD" | null,
  "gender": "M" | "F" | null,           // só se explícito no documento
  "mother_name": string | null,         // nome da mãe (filiação)
  "father_name": string | null,         // nome do pai (filiação)
  "nationality": string | null,         // ex: "Brasileiro"
  "cnh_number": string | null,          // só se for CNH
  "cnh_category": string | null,        // "A", "B", "AB", "C", "D", "E"
  "cnh_expiry": "YYYY-MM-DD" | null     // validade da CNH
}

Regras:
- Datas DD/MM/AAAA → ISO YYYY-MM-DD.
- CPF só os 11 dígitos.
- Não invente. Se não tiver certeza, use null.

Responda apenas com o JSON."""


_IDENTITY_FIELDS = {
    "full_name", "nickname", "birth_date", "cpf", "rg",
    "cnh_number", "cnh_expiry", "cnh_category",
    "passport_number", "passport_expiry",
    "marital_status", "religion", "birthplace",
}

_PERSON_FIELDS = {
    "full_name", "cpf", "rg", "birth_date", "gender",
    "mother_name", "father_name", "nationality",
    "cnh_number", "cnh_category", "cnh_expiry",
}


# ───────── helpers ─────────

def _media_type(mime: str) -> str:
    m = (mime or "").lower().strip()
    if m == "image/jpg":
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
    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fenced:
        return fenced.group(1)
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end > start:
        return text[start : end + 1]
    return text


def _call_vision(content: bytes, mime: str, prompt: str) -> dict[str, Any]:
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
                    {"type": "text", "text": prompt},
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
    return data


# ───────── API pública ─────────

def extract_identity(content: bytes, mime: str) -> dict[str, Any]:
    data = _call_vision(content, mime, EXTRACT_IDENTITY_PROMPT)
    return {k: v for k, v in data.items() if k in _IDENTITY_FIELDS and v is not None}


def extract_person(content: bytes, mime: str) -> dict[str, Any]:
    data = _call_vision(content, mime, EXTRACT_PERSON_PROMPT)
    return {k: v for k, v in data.items() if k in _PERSON_FIELDS and v is not None}
