"use client"
import { useEffect, useMemo, useState } from "react"
import { Icon } from "@/components/Icon"
import { EmptyState } from "@/components/ui/EmptyState"
import { cn } from "@/lib/cn"
import type { Organization, OrganizationStats } from "@/lib/contacts-types"
import { listOrganizations, getOrganizationStats } from "@/lib/contacts-api"
import { OrgRow } from "@/components/empresas/OrgRow"
import { OrgModal } from "@/components/empresas/OrgModal"
import { PermissionGate } from "@/components/auth/PermissionGate"

type Filter = "all" | "with_cnpj" | "without_cnpj" | "enriched" | "without_contacts"

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "with_cnpj", label: "Com CNPJ" },
  { id: "without_cnpj", label: "Sem CNPJ" },
  { id: "enriched", label: "Enriquecidas" },
  { id: "without_contacts", label: "Sem contatos" },
]

type ModalState =
  | { open: false }
  | { open: true; mode: { kind: "create" } | { kind: "edit"; org: Organization } }


export function EmpresasHub() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [stats, setStats] = useState<OrganizationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [modal, setModal] = useState<ModalState>({ open: false })

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  async function refresh() {
    setLoading(true)
    try {
      const [list, st] = await Promise.all([
        listOrganizations(debounced || undefined, 100),
        getOrganizationStats(),
      ])
      setOrgs(list)
      setStats(st)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const visible = useMemo(() => {
    return orgs.filter((o) => {
      if (filter === "with_cnpj") return Boolean(o.cnpj)
      if (filter === "without_cnpj") return !o.cnpj
      if (filter === "enriched") return Boolean(o.enriched_at)
      if (filter === "without_contacts") return o.contact_count === 0
      return true
    })
  }, [orgs, filter])

  function handleSaved(_saved: Organization) {
    void refresh()
  }
  function handleDeleted(_id: number) {
    void refresh()
  }

  return (
    <div className="flex-1 flex overflow-hidden min-w-0 bg-bg-app">
      <Sidebar stats={stats} active={filter} onPick={setFilter} />

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 min-w-0 px-6 py-5">
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex items-center gap-2.5 bg-bg-surface border border-default rounded-default px-3.5 py-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-all">
            <Icon name="search" size={15} className="text-text-tertiary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou CNPJ…"
              className="flex-1 bg-transparent outline-none text-body text-text-primary placeholder:text-text-tertiary"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-text-tertiary hover:text-text-primary"
                aria-label="Limpar"
              >
                <Icon name="close" size={13} />
              </button>
            )}
          </div>
          <PermissionGate module="empresas" action="criar">
            <button
              onClick={() => setModal({ open: true, mode: { kind: "create" } })}
              className="inline-flex items-center gap-1.5 bg-brand text-white text-small font-semibold px-3 py-2 rounded-default hover:bg-brand-hover transition-colors"
            >
              <Icon name="plus" size={13} />
              Nova empresa
            </button>
          </PermissionGate>
        </div>

        <div className="flex gap-1.5 flex-wrap items-center">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-3 py-1 rounded-full border text-small font-medium transition-colors",
                filter === f.id
                  ? "bg-brand-subtle text-brand border-default"
                  : "bg-bg-surface text-text-secondary border-default hover:border-strong"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-bg-surface border border-default rounded-xl overflow-hidden">
          {error ? (
            <EmptyState icon="alert" title="Erro ao carregar" subtitle={<>{error}</>} />
          ) : loading ? (
            <div className="p-6 text-text-tertiary text-small">Carregando empresas…</div>
          ) : visible.length === 0 ? (
            <EmptyState
              icon="building"
              title={
                debounced || filter !== "all"
                  ? "Nenhuma empresa com esses filtros"
                  : "Nenhuma empresa cadastrada"
              }
              subtitle={
                debounced || filter !== "all" ? (
                  <>Ajuste a busca ou os filtros pra ver outras empresas.</>
                ) : (
                  <>
                    Crie a primeira aqui, ou via combobox direto no formulário
                    de contato em <code className="mono text-[11px] bg-bg-subtle px-1 rounded">/contatos</code>.
                  </>
                )
              }
            />
          ) : (
            <div>
              <div className="grid grid-cols-[1.5fr_140px_1.4fr_90px_70px] items-center gap-3 px-3 py-2 text-[10.5px] font-bold text-ink-3 uppercase tracking-[.07em] bg-bg-subtle border-b border-hair">
                <span>Empresa</span>
                <span>CNPJ</span>
                <span>Ramo</span>
                <span>Receita</span>
                <span className="text-right">Contatos</span>
              </div>
              {visible.map((o) => (
                <OrgRow
                  key={o.id}
                  org={o}
                  onClick={() => setModal({ open: true, mode: { kind: "edit", org: o } })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <OrgModal
        open={modal.open}
        mode={modal.open ? modal.mode : { kind: "create" }}
        onClose={() => setModal({ open: false })}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  )
}


function Sidebar({
  stats,
  active,
  onPick,
}: {
  stats: OrganizationStats | null
  active: Filter
  onPick: (f: Filter) => void
}) {
  const counts: Record<Filter, number> = {
    all: stats?.total ?? 0,
    with_cnpj: stats?.with_cnpj ?? 0,
    without_cnpj: (stats?.total ?? 0) - (stats?.with_cnpj ?? 0),
    enriched: stats?.enriched ?? 0,
    without_contacts: stats?.without_contacts ?? 0,
  }
  return (
    <aside className="w-[262px] min-w-[262px] bg-bg-surface border-r border-default p-4 overflow-y-auto shrink-0">
      <div className="text-tiny uppercase tracking-wider text-text-tertiary font-medium px-2 mb-2">
        Visões
      </div>
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => onPick(f.id)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-default text-body cursor-pointer transition-colors",
            active === f.id
              ? "bg-brand-subtle text-brand font-semibold"
              : "text-text-secondary hover:bg-bg-subtle"
          )}
        >
          <span className="truncate">{f.label}</span>
          <span className="text-tiny text-text-tertiary tabular-nums">{counts[f.id]}</span>
        </button>
      ))}
    </aside>
  )
}
