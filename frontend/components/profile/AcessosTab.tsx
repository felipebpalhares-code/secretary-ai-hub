"use client"
import { useCallback, useEffect, useState } from "react"
import { Icon } from "@/components/Icon"
import {
  listVault,
  deleteVaultEntry,
  revealVaultEntry,
  type VaultCategory,
  type VaultEntry,
} from "@/lib/api"
import {
  AddBtn,
  EmptyState,
  ErrorBanner,
  LoadingPlaceholder,
  SectionHdr,
  confirmDelete,
} from "./_shared"
import { EditVaultEntryModal } from "./EditVaultEntryModal"

const SECTIONS: { id: VaultCategory; title: string; icon: Parameters<typeof Icon>[0]["name"] }[] = [
  { id: "gov", title: "Portais governamentais", icon: "shield" },
  { id: "bank", title: "Bancos online", icon: "bank" },
  { id: "system", title: "Sistemas e apps", icon: "lock" },
]

function VaultRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: VaultEntry
  onEdit: () => void
  onDelete: () => void
}) {
  const [revealed, setRevealed] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleReveal() {
    if (revealed) {
      setRevealed(null)
      return
    }
    setLoading(true)
    try {
      const res = await revealVaultEntry(entry.id)
      setRevealed(res.password ?? "")
    } catch {
      setRevealed("(erro)")
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    try {
      const pwd = revealed ?? (await revealVaultEntry(entry.id)).password ?? ""
      await navigator.clipboard.writeText(pwd)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center gap-[10px] px-[14px] py-[10px] bg-bg border border-hair rounded-md mb-[6px]">
      <div className="w-[30px] h-[30px] rounded-[7px] bg-card border border-hair flex items-center justify-center text-ink-2 shrink-0">
        <Icon name={entry.category === "gov" ? "shield" : entry.category === "bank" ? "bank" : "lock"} size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-semibold text-ink tracking-[-.1px]">{entry.name}</div>
        <div className="text-[11px] text-ink-3 font-medium mt-0.5">
          {entry.username ?? "—"}
          {entry.url && <a href={entry.url} target="_blank" rel="noreferrer" className="ml-2 text-accent">↗</a>}
        </div>
      </div>
      <div className="mono text-[12px] text-ink-2 tracking-[.05em] px-2 min-w-[90px] text-right">
        {loading ? "…" : revealed ?? "●●●●●●●●"}
      </div>
      <button
        onClick={handleReveal}
        className="text-ink-3 hover:text-accent p-0.5 rounded"
        aria-label={revealed ? "Ocultar senha" : "Revelar senha"}
      >
        <Icon name="eye" size={13} />
      </button>
      <button
        onClick={handleCopy}
        className="bg-card border border-hair rounded px-2 py-1 text-[10.5px] font-semibold text-ink-2 hover:border-ink-4 hover:text-ink transition-colors"
      >
        {copied ? "Copiado!" : "Copiar"}
      </button>
      <button onClick={onEdit} className="text-ink-3 hover:text-accent p-1 rounded">
        <Icon name="edit" size={13} />
      </button>
      <button onClick={onDelete} className="text-ink-3 hover:text-err p-1 rounded">
        <Icon name="close" size={13} />
      </button>
    </div>
  )
}

export function AcessosTab() {
  const [entries, setEntries] = useState<VaultEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<{ open: boolean; initial: VaultEntry | null; defaultCategory: VaultCategory }>({
    open: false, initial: null, defaultCategory: "gov",
  })

  const reload = useCallback(async () => {
    setError(null)
    try {
      setEntries(await listVault())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Falha ao carregar cofre")
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  async function handleDelete(e: VaultEntry) {
    if (!confirmDelete(e.name)) return
    await deleteVaultEntry(e.id)
    await reload()
  }

  if (entries === null) return <LoadingPlaceholder />
  if (error) return <ErrorBanner message={error} />

  const total = entries.length

  return (
    <>
      <div className="flex items-center gap-[10px] px-[14px] py-[10px] rounded-md font-semibold border bg-accent-soft text-accent border-indigo-200 text-[12.5px]">
        <Icon name="lock" size={14} />
        Senhas criptografadas com AES-256 (Fernet) antes de salvar. A listagem nunca traz a senha — só ao clicar no olho.
      </div>

      {SECTIONS.map((sec) => {
        const items = entries.filter((e) => e.category === sec.id)
        return (
          <div key={sec.id}>
            <SectionHdr
              title={sec.title}
              action={
                <AddBtn
                  label="Adicionar"
                  onClick={() => setModal({ open: true, initial: null, defaultCategory: sec.id })}
                />
              }
            />
            {items.length === 0 ? (
              <EmptyState icon={sec.icon} title="Nenhum acesso aqui ainda" />
            ) : (
              <div>
                {items.map((e) => (
                  <VaultRow
                    key={e.id}
                    entry={e}
                    onEdit={() => setModal({ open: true, initial: e, defaultCategory: e.category as VaultCategory })}
                    onDelete={() => handleDelete(e)}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}

      {total === 0 && (
        <div className="text-[11.5px] text-ink-3 italic font-medium text-center py-2">
          O cofre está vazio. Comece adicionando os principais portais (e-CAC, GOV.BR) e bancos.
        </div>
      )}

      <EditVaultEntryModal
        open={modal.open}
        onClose={() => setModal({ open: false, initial: null, defaultCategory: "gov" })}
        initial={modal.initial}
        defaultCategory={modal.defaultCategory}
        onSaved={reload}
      />
    </>
  )
}
