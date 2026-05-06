"use client"
import { useRef, useState } from "react"
import { ChevronRight, Upload, FileText, Trash2 } from "lucide-react"
import { useAgentWizard } from "@/stores/agentWizard"
import { WizardFooter } from "./WizardFooter"

const ACCEPT = ".pdf,.docx,.txt,.md"

export function StepDocuments() {
  const { documents, addDocuments, removeDocument, prev, next } = useAgentWizard()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = useState(false)

  function pickFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    addDocuments(Array.from(files))
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    pickFiles(e.dataTransfer.files)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-loose">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-display text-text-primary">Documentos pra treinar</h1>
          <p className="text-body text-text-secondary mt-2">
            Envie PDFs, DOCXs ou TXTs que esse agente deve consultar (RAG). É opcional —
            você pode adicionar depois.
          </p>

          {/* Drop zone */}
          <div
            onDragEnter={() => setDragOver(true)}
            onDragLeave={() => setDragOver(false)}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                inputRef.current?.click()
              }
            }}
            className={`mt-loose flex flex-col items-center justify-center text-center rounded-xl border-2 border-dashed transition cursor-pointer p-12 ${
              dragOver
                ? "border-brand bg-brand-subtle"
                : "border-default bg-bg-surface hover:border-strong hover:bg-bg-subtle"
            }`}
          >
            <Upload size={48} strokeWidth={1.5} className="text-text-tertiary" />
            <div className="text-body-strong text-text-primary mt-3">
              Arraste arquivos ou clique pra selecionar
            </div>
            <div className="text-small text-text-tertiary mt-1">PDF, DOCX, TXT · múltiplos</div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                pickFiles(e.target.files)
                e.target.value = ""
              }}
            />
          </div>

          {/* Lista Linear */}
          {documents.length > 0 && (
            <div className="mt-comfortable bg-bg-surface border border-default rounded-md overflow-hidden">
              {documents.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center gap-3 px-4 py-3 border-b border-default last:border-0 hover:bg-bg-subtle transition"
                >
                  <FileText size={16} strokeWidth={1.5} className="text-text-tertiary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-body text-text-primary truncate">{file.name}</div>
                    <div className="text-tiny text-text-tertiary mt-0.5">
                      {formatSize(file.size)} · selecionado
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(idx)}
                    aria-label={`Remover ${file.name}`}
                    className="text-text-tertiary hover:text-danger p-1.5 rounded-default hover:bg-danger-subtle transition"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <WizardFooter
        onBack={prev}
        extras={
          <button
            type="button"
            onClick={next}
            className="text-small text-text-secondary hover:text-text-primary px-2 py-1 rounded-default hover:bg-bg-subtle transition"
          >
            Pular este passo
          </button>
        }
      >
        <button
          type="button"
          onClick={next}
          className="inline-flex items-center gap-2 bg-brand text-white rounded-default px-4 py-2 text-body-strong font-medium shadow-xs hover:bg-brand-hover transition"
        >
          Continuar
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </WizardFooter>
    </div>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
