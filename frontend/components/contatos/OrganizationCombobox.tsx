"use client"
import { useEffect, useRef, useState } from "react"
import { Icon } from "@/components/Icon"
import { cn } from "@/lib/cn"
import {
  listOrganizations,
  createOrganization,
  enrichOrganization,
  updateOrganization,
} from "@/lib/contacts-api"
import type { Organization } from "@/lib/contacts-types"
import { AddCnpjDialog } from "./AddCnpjDialog"


function formatCnpj(d: string | null | undefined): string | null {
  if (!d) return null
  const s = d.replace(/\D/g, "")
  if (s.length !== 14) return d
  return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}/${s.slice(8, 12)}-${s.slice(12)}`
}

function relativeFromIso(iso: string | null): string | null {
  if (!iso) return null
  const ms = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(ms) || ms < 0) return null
  const d = Math.floor(ms / 86_400_000)
  if (d === 0) return "hoje"
  if (d === 1) return "1 dia"
  if (d < 30) return `${d} dias`
  const m = Math.round(d / 30)
  return m === 1 ? "1 mês" : `${m} meses`
}


export function OrganizationCombobox({
  value,
  onChange,
}: {
  value: Organization | null
  onChange: (org: Organization | null) => void
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Organization[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCnpjDialog, setShowCnpjDialog] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Click-outside fecha o dropdown
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])

  // Busca debounced
  useEffect(() => {
    if (value) return // quando há seleção, não buscamos
    let mounted = true
    const t = setTimeout(async () => {
      try {
        const r = await listOrganizations(query.trim() || undefined, 20)
        if (mounted) setResults(r)
      } catch {
        if (mounted) setResults([])
      }
    }, 180)
    return () => {
      mounted = false
      clearTimeout(t)
    }
  }, [query, value])

  async function selectExisting(org: Organization) {
    onChange(org)
    setOpen(false)
    setQuery("")
  }

  async function createAndSelect(name: string) {
    setBusy(true)
    setError(null)
    try {
      const created = await createOrganization({ name: name.trim() })
      onChange(created)
      setOpen(false)
      setQuery("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar empresa")
    } finally {
      setBusy(false)
    }
  }

  async function handleEnrich() {
    if (!value) return
    setBusy(true)
    setError(null)
    try {
      const fresh = await enrichOrganization(value.id)
      onChange(fresh)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao enriquecer")
    } finally {
      setBusy(false)
    }
  }

  async function handleAddCnpj(cnpj: string) {
    if (!value) return
    setBusy(true)
    setError(null)
    try {
      const updated = await updateOrganization(value.id, { cnpj })
      const enriched = await enrichOrganization(updated.id).catch(() => updated)
      onChange(enriched)
      setShowCnpjDialog(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar CNPJ")
    } finally {
      setBusy(false)
    }
  }

  // Sugestão de criação: query não-vazia e sem match exato (case-insensitive)
  const trimmed = query.trim()
  const exactMatch = results.some(
    (r) => r.name.trim().toLowerCase() === trimmed.toLowerCase()
  )
  const showCreateOption = trimmed.length > 0 && !exactMatch

  // ───────── Selecionado ─────────
  if (value) {
    const enrichedAgo = relativeFromIso(value.enriched_at)
    return (
      <div ref={wrapRef} className="space-y-1.5">
        <div className="flex items-center gap-2 bg-bg border border-hair rounded-md px-3 py-2">
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold text-ink truncate">
              {value.name}
              {value.trade_name && value.trade_name !== value.name && (
                <span className="text-ink-3 font-medium ml-1">· {value.trade_name}</span>
              )}
            </div>
            <div className="text-[10.5px] text-ink-3 font-medium mt-px flex items-center gap-2 flex-wrap">
              {value.cnpj && <span className="mono">{formatCnpj(value.cnpj)}</span>}
              {value.industry && (
                <span className="truncate max-w-[260px]" title={value.industry}>
                  · {value.industry}
                </span>
              )}
              {enrichedAgo && (
                <span className="text-ink-3">· atualizado há {enrichedAgo}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {value.cnpj ? (
              <button
                type="button"
                onClick={handleEnrich}
                disabled={busy}
                className="text-[11px] font-semibold px-2 py-1 rounded border border-hair text-ink-2 hover:border-accent hover:text-accent disabled:opacity-50 transition-colors"
                title="Atualizar dados via Receita"
              >
                {busy ? "…" : "Atualizar"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowCnpjDialog(true)}
                className="text-[11px] font-semibold px-2 py-1 rounded border border-dashed border-hair text-ink-3 hover:border-accent hover:text-accent transition-colors"
              >
                + CNPJ
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange(null)}
              className="w-6 h-6 rounded text-ink-3 hover:text-err hover:bg-red-50 flex items-center justify-center transition-colors"
              aria-label="Desvincular empresa"
              title="Desvincular"
            >
              <Icon name="close" size={12} />
            </button>
          </div>
        </div>

        {error && (
          <div className="text-[11px] text-err font-semibold">{error}</div>
        )}

        <AddCnpjDialog
          open={showCnpjDialog}
          orgName={value.name}
          busy={busy}
          onClose={() => setShowCnpjDialog(false)}
          onConfirm={handleAddCnpj}
        />
      </div>
    )
  }

  // ───────── Sem seleção: input + dropdown ─────────
  return (
    <div ref={wrapRef} className="relative">
      <div
        className={cn(
          "flex items-center gap-2 bg-bg border border-hair rounded-md px-3 py-2",
          "focus-within:border-accent focus-within:ring-1 focus-within:ring-accent"
        )}
      >
        <Icon name="building" size={13} className="text-ink-3 shrink-0" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Empresa (digita para buscar)"
          className="flex-1 bg-transparent outline-none text-[12.5px] text-ink placeholder:text-ink-3"
        />
      </div>

      {open && (
        <div className="absolute z-30 mt-1 left-0 right-0 max-h-60 overflow-y-auto bg-card border border-hair rounded-md shadow-md">
          {results.length === 0 && !showCreateOption && (
            <div className="px-3 py-2 text-[11.5px] text-ink-3 font-medium">
              Nenhuma empresa cadastrada — digite para criar.
            </div>
          )}
          {results.map((o) => (
            <button
              key={o.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                selectExisting(o)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-bg-subtle border-b border-hair-2 last:border-b-0"
            >
              <div className="text-[12px] font-semibold text-ink">{o.name}</div>
              <div className="text-[10.5px] text-ink-3 font-medium mt-px flex gap-2">
                {o.cnpj && <span className="mono">{formatCnpj(o.cnpj)}</span>}
                {o.industry && <span className="truncate">{o.industry}</span>}
              </div>
            </button>
          ))}
          {showCreateOption && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                createAndSelect(trimmed)
              }}
              disabled={busy}
              className="w-full text-left px-3 py-2 text-[12px] font-semibold text-accent hover:bg-accent-soft border-t border-hair disabled:opacity-50"
            >
              + Criar empresa: «{trimmed}»
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="text-[11px] text-err font-semibold mt-1">{error}</div>
      )}
    </div>
  )
}
