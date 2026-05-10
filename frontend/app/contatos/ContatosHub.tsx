"use client"
import { useEffect, useMemo, useState } from "react"
import { Icon } from "@/components/Icon"
import { EmptyState } from "@/components/ui/EmptyState"
import { cn } from "@/lib/cn"
import type {
  Contact,
  Category,
  ContactStats,
  ContactsListFilters,
} from "@/lib/contacts-types"
import {
  listCategories,
  listContacts,
  getStats,
  deleteCategory as apiDeleteCategory,
} from "@/lib/contacts-api"
import { ContactCard } from "@/components/contatos/ContactCard"
import { ContactRow } from "@/components/contatos/ContactRow"
import { ContactDetail } from "@/components/contatos/ContactDetail"
import { ContactModal } from "@/components/contatos/ContactModal"
import { CategoryDialog } from "@/components/contatos/CategoryDialog"
import { CategoryMenu } from "@/components/contatos/CategoryMenu"
import { ConfirmDialog } from "@/components/contatos/ConfirmDialog"
import { PermissionGate } from "@/components/auth/PermissionGate"

type Chip = "todos" | "30d" | "wa" | "email" | "empresa"

const CHIPS: { id: Chip; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "30d", label: "Últimos 30d" },
  { id: "wa", label: "Com WhatsApp" },
  { id: "email", label: "Com e-mail" },
  { id: "empresa", label: "Com empresa" },
]

type ModalState =
  | { open: false }
  | { open: true; mode: { kind: "create" } | { kind: "edit"; contact: Contact } }

type CategoryDialogState =
  | { open: false }
  | { open: true; mode: { kind: "create" } | { kind: "edit"; category: Category } }

type CategoryDeleteState =
  | { open: false }
  | { open: true; category: Category; busy: boolean }


export function ContatosHub() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [chip, setChip] = useState<Chip>("todos")
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")
  const [categoryId, setCategoryId] = useState<number | null>(null)

  const [contacts, setContacts] = useState<Contact[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<ContactStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selected, setSelected] = useState<Contact | null>(null)
  const [modal, setModal] = useState<ModalState>({ open: false })
  const [catDialog, setCatDialog] = useState<CategoryDialogState>({ open: false })
  const [catDelete, setCatDelete] = useState<CategoryDeleteState>({ open: false })

  // ── Debounce search ──
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  // ── Categorias e stats no mount ──
  useEffect(() => {
    void Promise.all([listCategories(), getStats()])
      .then(([cats, st]) => {
        setCategories(cats)
        setStats(st)
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar"))
  }, [])

  // ── Lista de contatos reagindo aos filtros ──
  useEffect(() => {
    const filters: ContactsListFilters = {
      category_id: categoryId,
      search: debounced || undefined,
      last_30_days: chip === "30d" || undefined,
      has_email: chip === "email" || undefined,
      has_company: chip === "empresa" || undefined,
    }
    setLoading(true)
    listContacts(filters)
      .then(setContacts)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar contatos"))
      .finally(() => setLoading(false))
  }, [debounced, chip, categoryId])

  async function refreshAll() {
    const [list, st] = await Promise.all([
      listContacts({
        category_id: categoryId,
        search: debounced || undefined,
        last_30_days: chip === "30d" || undefined,
        has_email: chip === "email" || undefined,
        has_company: chip === "empresa" || undefined,
      }),
      getStats(),
    ])
    setContacts(list)
    setStats(st)
  }

  function handleSaved(saved: Contact) {
    void refreshAll()
    setSelected(saved)
  }

  function handleDeleted(id: number) {
    setContacts((prev) => prev.filter((c) => c.id !== id))
    if (selected?.id === id) setSelected(null)
    void getStats().then(setStats).catch(() => {})
  }

  function handleCategorySaved(_cat: Category) {
    void Promise.all([listCategories(), getStats()])
      .then(([cats, st]) => {
        setCategories(cats)
        setStats(st)
      })
      .catch(() => {})
  }

  async function handleCategoryDelete() {
    if (!catDelete.open) return
    setCatDelete({ ...catDelete, busy: true })
    try {
      await apiDeleteCategory(catDelete.category.id)
      // Se a categoria deletada era a ativa, volta pra "Todos"
      if (categoryId === catDelete.category.id) setCategoryId(null)
      await refreshAll()
      const cats = await listCategories()
      setCategories(cats)
      setCatDelete({ open: false })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao excluir categoria")
      setCatDelete({ open: false })
    }
  }

  const isWaChip = chip === "wa"
  const visibleContacts = useMemo(() => (isWaChip ? [] : contacts), [contacts, isWaChip])

  return (
    <div className="flex-1 flex overflow-hidden min-w-0 bg-bg-app">
      {/* Sidebar de categorias com contagens reais */}
      <Sidebar
        categories={categories}
        stats={stats}
        activeCategoryId={categoryId}
        onPick={(id) => setCategoryId(id)}
        onAddCategory={() => setCatDialog({ open: true, mode: { kind: "create" } })}
        onEditCategory={(cat) => setCatDialog({ open: true, mode: { kind: "edit", category: cat } })}
        onDeleteCategory={(cat) => setCatDelete({ open: true, category: cat, busy: false })}
      />

      {/* Coluna principal */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 min-w-0 px-6 py-5">
        {/* Search + view toggle */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex items-center gap-2.5 bg-bg-surface border border-default rounded-default px-3.5 py-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-all">
            <Icon name="search" size={15} className="text-text-tertiary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, empresa, telefone, e-mail…"
              className="flex-1 bg-transparent outline-none text-body text-text-primary placeholder:text-text-tertiary"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-text-tertiary hover:text-text-primary"
                aria-label="Limpar busca"
              >
                <Icon name="close" size={13} />
              </button>
            )}
          </div>
          <div className="flex bg-bg-surface border border-default rounded-default p-0.5">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-2.5 py-1.5 rounded text-small font-semibold transition-colors",
                  view === v
                    ? "bg-bg-subtle text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary"
                )}
              >
                {v === "grid" ? "Grade" : "Lista"}
              </button>
            ))}
          </div>
          <PermissionGate module="contatos" action="criar">
            <button
              onClick={() => setModal({ open: true, mode: { kind: "create" } })}
              className="inline-flex items-center gap-1.5 bg-brand text-white text-small font-semibold px-3 py-2 rounded-default hover:bg-brand-hover transition-colors"
            >
              <Icon name="plus" size={13} />
              Novo contato
            </button>
          </PermissionGate>
        </div>

        {/* Chips */}
        <div className="flex gap-1.5 flex-wrap items-center">
          {CHIPS.map((c) => (
            <button
              key={c.id}
              onClick={() => setChip(c.id)}
              className={cn(
                "px-3 py-1 rounded-full border text-small font-medium transition-colors",
                chip === c.id
                  ? "bg-brand-subtle text-brand border-default"
                  : "bg-bg-surface text-text-secondary border-default hover:border-strong"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Listagem */}
        <div className="flex-1 bg-bg-surface border border-default rounded-xl overflow-hidden">
          {error && !loading && contacts.length === 0 ? (
            <EmptyState
              icon="alert"
              title="Erro ao carregar contatos"
              subtitle={<>{error}</>}
            />
          ) : loading ? (
            <div className="p-6 text-text-tertiary text-small">Carregando contatos…</div>
          ) : isWaChip ? (
            <EmptyState
              icon="chat"
              title="Detecção de WhatsApp vem em sprint futura"
              subtitle={<>O campo dedicado de WhatsApp ainda não existe nesta versão.</>}
            />
          ) : visibleContacts.length === 0 ? (
            <EmptyState
              icon="users"
              title={
                debounced || categoryId != null || chip !== "todos"
                  ? "Nenhum contato com esses filtros"
                  : "Nenhum contato cadastrado"
              }
              subtitle={
                debounced || categoryId != null || chip !== "todos" ? (
                  <>Ajuste a busca ou os filtros pra ver outros contatos.</>
                ) : (
                  <>
                    Quando você adicionar contatos (família, sócios, profissionais de
                    confiança, clientes), eles aparecem aqui agrupados por categoria.
                  </>
                )
              }
            />
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
              {visibleContacts.map((c) => (
                <ContactCard
                  key={c.id}
                  contact={c}
                  categories={categories}
                  selected={selected?.id === c.id}
                  onClick={() => setSelected(c)}
                />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-hair-2">
              <div className="grid grid-cols-[36px_1.4fr_1.2fr_1fr_120px_36px] items-center gap-3 px-3 py-2 text-[10.5px] font-bold text-ink-3 uppercase tracking-[.07em] bg-bg-subtle border-b border-hair">
                <span />
                <span>Nome / cargo</span>
                <span>E-mail</span>
                <span>Telefone</span>
                <span>Categoria</span>
                <span />
              </div>
              {visibleContacts.map((c) => (
                <ContactRow
                  key={c.id}
                  contact={c}
                  categories={categories}
                  selected={selected?.id === c.id}
                  onClick={() => setSelected(c)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drawer de detalhes */}
      {selected && (
        <ContactDetail
          contact={selected}
          categories={categories}
          onClose={() => setSelected(null)}
          onEdit={() =>
            setModal({ open: true, mode: { kind: "edit", contact: selected } })
          }
          onDelete={async () => {
            try {
              const id = selected.id
              await import("@/lib/contacts-api").then((m) => m.deleteContact(id))
              handleDeleted(id)
            } catch (e) {
              setError(e instanceof Error ? e.message : "Erro ao apagar")
            }
          }}
        />
      )}

      {/* Modal create/edit */}
      <ContactModal
        open={modal.open}
        mode={modal.open ? modal.mode : { kind: "create" }}
        categories={categories}
        onClose={() => setModal({ open: false })}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />

      {/* Modais de categoria */}
      <CategoryDialog
        open={catDialog.open}
        mode={catDialog.open ? catDialog.mode : { kind: "create" }}
        onClose={() => setCatDialog({ open: false })}
        onSaved={handleCategorySaved}
      />
      <ConfirmDialog
        open={catDelete.open}
        title="Excluir categoria"
        destructive
        confirmLabel="Excluir"
        busy={catDelete.open ? catDelete.busy : false}
        onClose={() => setCatDelete({ open: false })}
        onConfirm={handleCategoryDelete}
        message={
          catDelete.open ? (
            <>
              Excluir <strong>{catDelete.category.name}</strong>? Os contatos
              desta categoria não serão apagados — ficarão sem categoria. Essa
              ação não pode ser desfeita.
            </>
          ) : null
        }
      />
    </div>
  )
}


function Sidebar({
  categories,
  stats,
  activeCategoryId,
  onPick,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: {
  categories: Category[]
  stats: ContactStats | null
  activeCategoryId: number | null
  onPick: (id: number | null) => void
  onAddCategory: () => void
  onEditCategory: (cat: Category) => void
  onDeleteCategory: (cat: Category) => void
}) {
  const countByCategory = useMemo(() => {
    const map = new Map<number | null, number>()
    stats?.by_category.forEach((b) => map.set(b.category_id, b.count))
    return map
  }, [stats])

  const total = stats?.total ?? 0
  const noCategoryCount = countByCategory.get(null) ?? 0

  return (
    <aside className="w-[262px] min-w-[262px] bg-bg-surface border-r border-default p-4 overflow-y-auto shrink-0">
      <div className="text-tiny uppercase tracking-wider text-text-tertiary font-medium px-2 mb-2">
        Visões
      </div>
      <SidebarRow
        label="Todos"
        count={total}
        active={activeCategoryId === null}
        onClick={() => onPick(null)}
      />

      <div className="text-tiny uppercase tracking-wider text-text-tertiary font-medium px-2 mt-6 mb-2 flex justify-between items-center">
        <span>Categorias</span>
        <button
          onClick={onAddCategory}
          className="w-[18px] h-[18px] rounded border border-default bg-bg-surface text-text-secondary hover:border-brand hover:text-brand flex items-center justify-center transition-colors"
          aria-label="Nova categoria"
          title="Nova categoria"
        >
          <Icon name="plus" size={11} />
        </button>
      </div>
      {categories.map((c) => (
        <CategoryRow
          key={c.id}
          category={c}
          count={countByCategory.get(c.id) ?? 0}
          active={activeCategoryId === c.id}
          onPick={() => onPick(c.id)}
          onEdit={() => onEditCategory(c)}
          onDelete={() => onDeleteCategory(c)}
        />
      ))}
      {noCategoryCount > 0 && (
        <SidebarRow
          label="Sem categoria"
          count={noCategoryCount}
          active={false}
          onClick={() => {/* sem filtro dedicado nesta sprint */}}
          dim
        />
      )}
    </aside>
  )
}

function SidebarRow({
  label,
  count,
  color,
  active,
  onClick,
  dim,
}: {
  label: string
  count: number
  color?: string | null
  active: boolean
  onClick: () => void
  dim?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-default text-body cursor-pointer transition-colors",
        active
          ? "bg-brand-subtle text-brand font-semibold"
          : "text-text-secondary hover:bg-bg-subtle",
        dim && !active && "text-text-tertiary"
      )}
    >
      <span className="flex items-center gap-2 truncate">
        {color && <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: color }} />}
        <span className="truncate">{label}</span>
      </span>
      <span className="text-tiny text-text-tertiary tabular-nums">{count}</span>
    </button>
  )
}

/** Categoria na sidebar com menu "..." aparecendo no hover. */
function CategoryRow({
  category,
  count,
  active,
  onPick,
  onEdit,
  onDelete,
}: {
  category: Category
  count: number
  active: boolean
  onPick: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      onClick={onPick}
      className={cn(
        "group w-full flex items-center justify-between px-3 py-2 rounded-default text-body cursor-pointer transition-colors",
        active
          ? "bg-brand-subtle text-brand font-semibold"
          : "text-text-secondary hover:bg-bg-subtle"
      )}
    >
      <span className="flex items-center gap-2 truncate">
        {category.color && (
          <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: category.color }} />
        )}
        <span className="truncate">{category.name}</span>
      </span>
      <span className="flex items-center gap-1 shrink-0">
        <span className="text-tiny text-text-tertiary tabular-nums group-hover:hidden">{count}</span>
        <span className="hidden group-hover:flex items-center gap-1">
          <span className="text-tiny text-text-tertiary tabular-nums">{count}</span>
          <CategoryMenu category={category} onEdit={onEdit} onDelete={onDelete} />
        </span>
      </span>
    </div>
  )
}
