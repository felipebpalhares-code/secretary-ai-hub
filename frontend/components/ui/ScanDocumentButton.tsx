"use client"
import { useEffect, useRef, useState } from "react"
import type { ChangeEvent, DragEvent } from "react"
import { Icon } from "@/components/Icon"
import { Modal } from "@/components/ui/Modal"
import { PrimaryButton, SecondaryButton } from "@/components/ui/FormField"
import {
  extractPersonDocument,
  type ExtractedPersonData,
  type ScanDocumentKind,
} from "@/lib/api"

const KIND_LABEL: Record<ScanDocumentKind, string> = {
  cnh: "CNH",
  rg: "RG",
  cpf: "Cartão CPF",
  passaporte: "Passaporte",
}

const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif,application/pdf"

type Props = {
  onExtracted: (data: ExtractedPersonData) => void
  documentTypes?: ScanDocumentKind[]
  buttonLabel?: string
  buttonVariant?: "primary" | "secondary"
}

type Phase =
  | { kind: "idle" }
  | { kind: "extracting" }
  | { kind: "error"; message: string }

export function ScanDocumentButton({
  onExtracted,
  documentTypes = ["rg", "cnh", "cpf"],
  buttonLabel = "📷 Escanear documento",
  buttonVariant = "secondary",
}: Props) {
  const [open, setOpen] = useState(false)
  const [docKind, setDocKind] = useState<ScanDocumentKind>(documentTypes[0] ?? "rg")
  const [dragActive, setDragActive] = useState(false)
  const [phase, setPhase] = useState<Phase>({ kind: "idle" })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setPhase({ kind: "idle" })
      setDragActive(false)
      setDocKind(documentTypes[0] ?? "rg")
    }
  }, [open, documentTypes])

  async function processFile(file: File) {
    setPhase({ kind: "extracting" })
    try {
      const res = await extractPersonDocument(file, docKind)
      onExtracted(res.extracted)
      setOpen(false)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao processar documento"
      setPhase({ kind: "error", message: msg })
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void processFile(file)
    e.target.value = ""
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragActive(false)
    if (phase.kind === "extracting") return
    const file = e.dataTransfer.files?.[0]
    if (file) void processFile(file)
  }

  const buttonClass =
    buttonVariant === "primary"
      ? "inline-flex items-center gap-1.5 bg-accent text-white text-[12px] font-semibold px-3 py-1.5 rounded-md hover:bg-accent/90 transition-colors"
      : "inline-flex items-center gap-1.5 bg-card border border-hair text-ink-2 text-[11.5px] font-semibold px-3 py-1.5 rounded-md hover:border-accent hover:text-accent transition-colors"

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass}>
        <Icon name="zap" size={13} />
        {buttonLabel}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Escanear documento"
        size="md"
        footer={
          <SecondaryButton onClick={() => setOpen(false)} disabled={phase.kind === "extracting"}>
            {phase.kind === "extracting" ? "Aguarde…" : "Cancelar"}
          </SecondaryButton>
        }
      >
        <div className="text-[12.5px] text-ink-2 font-medium mb-3">
          Anexe a foto do documento e a IA preenche os campos do formulário automaticamente.
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em]">
            Tipo:
          </span>
          {documentTypes.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setDocKind(k)}
              disabled={phase.kind === "extracting"}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded border transition-colors ${
                docKind === k
                  ? "bg-accent text-white border-accent"
                  : "bg-card text-ink-2 border-hair hover:border-ink-4"
              } disabled:opacity-50`}
            >
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault()
            if (phase.kind !== "extracting") setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-8 transition-colors text-center ${
            dragActive
              ? "border-accent bg-accent-soft"
              : phase.kind === "extracting"
                ? "border-hair bg-bg opacity-70"
                : "border-hair bg-bg hover:border-ink-4"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED}
            onChange={onFileChange}
            className="hidden"
          />

          {phase.kind === "extracting" ? (
            <div className="flex items-center justify-center gap-2 text-accent">
              <SpinnerIcon />
              <span className="text-[12.5px] font-semibold">Lendo documento com IA…</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-md bg-card border border-hair mx-auto flex items-center justify-center text-accent mb-3">
                <Icon name="file" size={18} />
              </div>
              <div className="text-[12.5px] font-semibold text-ink mb-1">
                Arraste o arquivo aqui ou clique pra escolher
              </div>
              <div className="text-[10.5px] text-ink-3 font-medium mb-3">
                JPG, PNG, WebP, GIF ou PDF · até 10 MB
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 bg-card border border-hair text-ink text-[12px] font-semibold px-3 py-1.5 rounded-md hover:border-accent hover:text-accent transition-colors"
              >
                <Icon name="plus" size={13} />
                Escolher arquivo
              </button>
            </>
          )}
        </div>

        {phase.kind === "error" && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-800 text-[12px] font-semibold px-3 py-2 rounded">
            {phase.message}
          </div>
        )}

        <div className="text-[10.5px] text-ink-3 font-medium leading-[1.55] mt-4 pt-3 border-t border-hair">
          O documento é processado pela IA, os dados extraídos são preenchidos no formulário e o arquivo é descartado. Não armazenamos cópias do documento. Confirme com a pessoa antes de cadastrar dados de terceiros.
        </div>
      </Modal>
    </>
  )
}

function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="9" strokeOpacity=".25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  )
}

/** Banner verde que aparece logo após preenchimento por OCR. Use junto ao Modal de cadastro. */
export function ExtractedHint({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11.5px] font-semibold px-3 py-2 rounded mb-3 flex items-center gap-2">
      <Icon name="check" size={13} />
      {count} campo(s) preenchido(s) automaticamente — revise antes de salvar.
    </div>
  )
}
