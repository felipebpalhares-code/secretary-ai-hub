"use client"
import { useEffect, useRef, useState } from "react"
import { Loader2, Upload, FileText, Trash2, AlertCircle, CheckCircle2 } from "lucide-react"
import {
  type Agent,
  type DocumentMeta,
  type DocumentStatus,
  deleteDocument,
  listDocuments,
  uploadDocument,
} from "@/lib/agents-api"

const ACCEPT = ".pdf,.docx,.txt,.md"
const POLL_MS = 3000

export function DocumentsTab({ agent }: { agent: Agent }) {
  const [docs, setDocs] = useState<DocumentMeta[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Carrega lista inicial
  useEffect(() => {
    let cancelled = false
    listDocuments(agent.id)
      .then((d) => !cancelled && setDocs(d))
      .catch((e) => !cancelled && setError(String(e?.message ?? e)))
    return () => { cancelled = true }
  }, [agent.id])

  // Polling enquanto há docs em "processing"
  useEffect(() => {
    if (!docs) return
    const anyProcessing = docs.some((d) => d.status === "processing")
    if (!anyProcessing) return
    const interval = setInterval(async () => {
      try {
        const fresh = await listDocuments(agent.id)
        setDocs(fresh)
      } catch {
        /* silencioso — tentamos de novo no próximo tick */
      }
    }, POLL_MS)
    return () => clearInterval(interval)
  }, [docs, agent.id])

  async function pickFiles(files: FileList | null) {
    if (!files || files.length === 0 || !docs) return
    setUploading(true); setError(null)
    try {
      // Upload sequencial com optimistic UI: cada doc retorna o registro real
      const created: DocumentMeta[] = []
      for (const file of Array.from(files)) {
        try {
          const d = await uploadDocument(agent.id, file)
          created.push(d)
        } catch (e) {
          setError(`Falha ao subir "${file.name}": ${(e as Error).message}`)
        }
      }
      setDocs([...created, ...docs])
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(documentId: string) {
    if (!docs) return
    setDocs(docs.filter((d) => d.id !== documentId))
    try {
      await deleteDocument(agent.id, documentId)
    } catch (e) {
      // se falhar, recarrega lista
      setError((e as Error).message)
      const fresh = await listDocuments(agent.id).catch(() => null)
      if (fresh) setDocs(fresh)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-comfortable">
        {/* Drop zone */}
        <div
          onDragEnter={() => setDragOver(true)}
          onDragLeave={() => setDragOver(false)}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); pickFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click() }
          }}
          className={`flex flex-col items-center justify-center text-center rounded-xl border-2 border-dashed transition cursor-pointer p-12 ${
            dragOver
              ? "border-brand bg-brand-subtle"
              : "border-default bg-bg-surface hover:border-strong hover:bg-bg-subtle"
          }`}
        >
          <Upload size={48} strokeWidth={1.5} className="text-text-tertiary" />
          <div className="text-body-strong text-text-primary mt-3">
            {uploading ? "Enviando…" : "Arraste arquivos ou clique pra selecionar"}
          </div>
          <div className="text-small text-text-tertiary mt-1">PDF, DOCX, TXT · múltiplos</div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT}
            disabled={uploading}
            className="hidden"
            onChange={(e) => { pickFiles(e.target.files); e.target.value = "" }}
          />
        </div>

        {error && (
          <div className="bg-danger-subtle border border-default rounded-md p-3 text-small text-danger">
            {error}
          </div>
        )}

        {/* Lista */}
        {docs === null ? (
          <ListSkeleton />
        ) : docs.length === 0 ? (
          <div className="bg-bg-surface border border-default rounded-md p-8 text-center text-small text-text-tertiary">
            Nenhum documento ainda. Adicione PDFs/DOCXs/TXTs para treinar o agente.
          </div>
        ) : (
          <div className="bg-bg-surface border border-default rounded-md overflow-hidden">
            {docs.map((d) => (
              <DocRow key={d.id} doc={d} onDelete={() => handleDelete(d.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DocRow({ doc, onDelete }: { doc: DocumentMeta; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-default last:border-0 hover:bg-bg-subtle transition">
      <FileText size={16} strokeWidth={1.5} className="text-text-tertiary shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-body text-text-primary truncate">{doc.filename}</div>
        <div className="text-tiny text-text-tertiary mt-0.5 flex items-center gap-2 flex-wrap">
          <DocStatusBadge status={doc.status} />
          {doc.status === "ready" && (
            <>
              <span>·</span>
              <span>{doc.chunks_count} chunk{doc.chunks_count === 1 ? "" : "s"}</span>
              <span>·</span>
              <span>{doc.total_tokens.toLocaleString("pt-BR")} tokens</span>
            </>
          )}
          {doc.status === "failed" && doc.error_message && (
            <>
              <span>·</span>
              <span className="text-danger truncate">{doc.error_message}</span>
            </>
          )}
          <span>·</span>
          <span>{formatDate(doc.created_at)}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Remover ${doc.filename}`}
        className="text-text-tertiary hover:text-danger p-1.5 rounded-default hover:bg-danger-subtle transition"
      >
        <Trash2 size={14} strokeWidth={1.5} />
      </button>
    </div>
  )
}

function DocStatusBadge({ status }: { status: DocumentStatus }) {
  if (status === "processing")
    return (
      <span className="inline-flex items-center gap-1 text-info">
        <Loader2 size={11} strokeWidth={1.5} className="animate-spin" />
        Processando
      </span>
    )
  if (status === "ready")
    return (
      <span className="inline-flex items-center gap-1 text-success">
        <CheckCircle2 size={11} strokeWidth={1.5} />
        Pronto
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-danger">
      <AlertCircle size={11} strokeWidth={1.5} />
      Falhou
    </span>
  )
}

function ListSkeleton() {
  return (
    <div className="bg-bg-surface border border-default rounded-md overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-default last:border-0">
          <div className="w-4 h-4 bg-bg-muted rounded animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-1/3 bg-bg-muted rounded animate-pulse" />
            <div className="h-2 w-1/4 bg-bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}
