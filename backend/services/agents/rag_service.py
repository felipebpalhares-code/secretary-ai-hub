"""
RAG — busca semântica nos documentos indexados de cada agente.

A geração de embeddings da query e o cliente Chroma vivem no document_service;
aqui orquestramos: query → embedding → Chroma → chunks formatados.
"""
from __future__ import annotations
import logging
from typing import Any

from services.agents import document_service as docsvc

log = logging.getLogger(__name__)


def search_relevant_chunks(agent_id: str, query: str, top_k: int = 5) -> list[dict[str, Any]]:
    """
    Retorna os top_k chunks mais relevantes pra query no contexto do agente.

    Cada item: {text, filename, document_id, chunk_index, distance}
    Em caso de falha (Chroma off, collection vazia, etc.) retorna [].
    """
    if not query or not query.strip():
        return []

    try:
        embedder = docsvc._get_embedder()
        query_emb = embedder.encode([query], convert_to_numpy=True, show_progress_bar=False).tolist()
    except Exception as e:
        log.warning("Falha ao gerar embedding da query: %s", e)
        return []

    try:
        coll = docsvc._get_or_create_collection(agent_id)
        if coll.count() == 0:
            return []
        result = coll.query(query_embeddings=query_emb, n_results=top_k)
    except Exception as e:
        log.warning("Falha ao consultar Chroma (agent=%s): %s", agent_id, e)
        return []

    docs       = (result.get("documents")  or [[]])[0]
    metadatas  = (result.get("metadatas")  or [[]])[0]
    distances  = (result.get("distances")  or [[]])[0]

    out: list[dict[str, Any]] = []
    for text, meta, dist in zip(docs, metadatas, distances):
        meta = meta or {}
        out.append({
            "text":         text,
            "filename":     meta.get("filename"),
            "document_id":  meta.get("document_id"),
            "chunk_index":  meta.get("chunk_index"),
            "distance":     dist,
        })
    return out


def format_context(chunks: list[dict[str, Any]]) -> str:
    """Renderiza chunks em texto pronto pra injetar no system prompt."""
    if not chunks:
        return ""
    parts: list[str] = ["## Contexto relevante de documentos\n"]
    for i, c in enumerate(chunks, 1):
        src = c.get("filename") or "documento"
        parts.append(f"[Trecho {i} — {src}]\n{c.get('text', '').strip()}\n")
    parts.append(
        "Use estes trechos como base factual ao responder. "
        "Se a pergunta não for respondida pelo contexto, diga isso claramente."
    )
    return "\n".join(parts)
