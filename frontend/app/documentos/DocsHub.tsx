"use client"
import { useState } from "react"
import { Icon } from "@/components/Icon"
import { DocCard } from "@/components/documents/DocCard"
import { DocDetail } from "@/components/documents/DocDetail"
import { DOCUMENTS } from "@/lib/documents-data"
import { cn } from "@/lib/cn"

type Folder = {
  id: string
  label: string
  count: number
  new?: number
  color: string
  icon: Parameters<typeof Icon>[0]["name"]
}

const FOLDERS: Folder[] = [
  { id: "juridico", label: "Jurídico", count: 14, new: 2, color: "border-t-purple-600", icon: "shield" },
  { id: "financeiro", label: "Financeiro", count: 23, new: 3, color: "border-t-ok", icon: "money" },
  { id: "empresas", label: "Empresas", count: 18, color: "border-t-blue-600", icon: "building" },
  { id: "pessoal", label: "Pessoal", count: 9, color: "border-t-accent", icon: "user" },
  { id: "governo", label: "Governo", count: 7, new: 1, color: "border-t-warn", icon: "bank" },
  { id: "saude", label: "Saúde", count: 4, color: "border-t-err", icon: "target" },
  { id: "obras", label: "Obras Vimar", count: 12, new: 1, color: "border-t-orange-500", icon: "building" },
]

export function DocsHub() {
  const [selected, setSelected] = useState<string | null>("cert-federal")
  const [drawerOpen, setDrawerOpen] = useState(true)

  return (
    <div className="flex-1 flex overflow-hidden min-w-0">
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-[18px] min-w-0">
        {/* Alert banner */}
        <div className="bg-card border border-amber-200 border-l-[3px] border-l-warn rounded-md px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-amber-50 text-warn flex items-center justify-center shrink-0">
            <Icon name="alert" size={15} />
          </div>
          <div className="flex-1">
            <div className="text-[12.5px] font-bold text-ink tracking-[-.15px]">
              3 documentos com vencimento próximo
            </div>
            <div className="text-[11px] text-ink-2 mt-0.5 font-medium">
              Agentes notificados · clique em cada item para detalhes
            </div>
          </div>
          <div className="flex gap-[5px] flex-wrap">
            <MiniChip variant="red">Certidão Federal · 12d</MiniChip>
            <MiniChip variant="amber">Contrato Locação · 30d</MiniChip>
            <MiniChip>CNH Felipe · 45d</MiniChip>
          </div>
        </div>

        {/* Auto-save */}
        <div className="bg-card border border-hair border-l-[3px] border-l-ok rounded-md px-4 py-[11px] flex items-center gap-3">
          <div className="w-[30px] h-[30px] rounded-md bg-emerald-50 text-ok flex items-center justify-center">
            <Icon name="check" size={14} />
          </div>
          <div>
            <div className="text-[12px] font-bold text-ink tracking-[-.15px]">
              Auto-save ativo · WhatsApp, Telegram e e-mail
            </div>
            <div className="text-[11px] text-ink-2 mt-px font-medium">
              Todo documento recebido é classificado e arquivado pelo agente certo
            </div>
          </div>
          <div className="ml-auto flex gap-[14px] text-[11px] text-ink-2 font-medium">
            <div>
              Hoje: <b className="text-ink font-bold">7</b>
            </div>
            <div>
              Semana: <b className="text-ink font-bold">23</b>
            </div>
            <div>
              Mês: <b className="text-ink font-bold">87</b>
            </div>
          </div>
        </div>

        {/* Search card */}
        <div className="bg-card border border-hair rounded-lg p-4 flex flex-col gap-[10px]">
          <div className="flex gap-2 items-center">
            <div className="flex-1 flex items-center gap-[10px] bg-bg border border-hair rounded-md px-[14px] py-[9px] focus-within:border-accent focus-within:bg-card transition-all">
              <Icon name="search" size={15} className="text-ink-3" />
              <input
                placeholder="Buscar em nome, conteúdo OCR, metadados..."
                className="flex-1 bg-transparent outline-none text-[13px] text-ink placeholder:text-ink-3"
              />
              <span className="text-[10px] text-ink-3 bg-card border border-hair px-[6px] py-px rounded font-semibold">
                ⌘K
              </span>
            </div>
            <div className="flex gap-0 bg-card border border-hair rounded-md p-[2px]">
              <button className="px-[10px] py-[6px] rounded bg-bg text-ink text-[12px] font-semibold">
                Grade
              </button>
              <button className="px-[10px] py-[6px] rounded text-ink-3 text-[12px] font-semibold">
                Lista
              </button>
            </div>
          </div>
          <FilterRow label="Agente" chips={["Todos", "Dr. Silva", "Ricardo", "Engenheiro", "+4"]} />
          <div className="flex gap-[12px] flex-wrap">
            <FilterRow label="Origem" chips={["Todas", "WhatsApp", "Telegram", "E-mail", "Upload"]} />
            <FilterRow label="Período" chips={["Todos", "Hoje", "Semana", "Mês"]} />
          </div>
        </div>

        {/* Folders */}
        <div>
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-[10px]">
            Pastas automáticas
          </div>
          <div className="grid grid-cols-7 gap-2">
            {FOLDERS.map((f) => (
              <div
                key={f.id}
                className={cn(
                  "bg-card border border-hair border-t-2 rounded-md p-3 cursor-pointer flex flex-col gap-2 hover:border-ink-4 hover:shadow-[0_1px_3px_rgba(15,23,42,.06)] transition-all",
                  f.color
                )}
              >
                <div className="w-[30px] h-[30px] rounded-md bg-bg border border-hair flex items-center justify-center text-ink-2">
                  <Icon name={f.icon} size={14} />
                </div>
                <div className="text-[12.5px] font-bold text-ink tracking-[-.15px]">{f.label}</div>
                <div className="text-[10.5px] text-ink-3 flex items-center gap-[5px] font-medium">
                  {f.count} docs
                  {f.new && (
                    <span className="bg-err text-white font-bold px-[5px] py-px rounded text-[9px]">
                      {f.new}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Docs */}
        <div>
          <div className="flex items-center justify-between mb-[10px]">
            <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[.07em]">
              Recentes (87)
            </div>
            <button className="px-[11px] py-1 rounded-full border border-hair bg-card text-[11.5px] font-semibold text-ink-2 hover:border-ink-4 transition-colors">
              Mais recente
            </button>
          </div>
          <div className="grid grid-cols-3 gap-[10px]">
            {DOCUMENTS.map((d) => (
              <DocCard
                key={d.id}
                doc={d}
                selected={selected === d.id}
                onClick={() => {
                  setSelected(d.id)
                  setDrawerOpen(true)
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {drawerOpen && selected && <DocDetail onClose={() => setDrawerOpen(false)} />}
    </div>
  )
}

function FilterRow({ label, chips }: { label: string; chips: string[] }) {
  return (
    <div className="flex items-center gap-[5px]">
      <span className="text-[10.5px] font-bold text-ink-3 uppercase tracking-[.06em] mr-1">
        {label}
      </span>
      {chips.map((c, i) => (
        <button
          key={c}
          className={cn(
            "px-[11px] py-[4px] rounded-full border text-[11.5px] font-semibold tracking-[-.05px]",
            i === 0
              ? "bg-accent-soft border-indigo-200 text-accent"
              : "bg-card border-hair text-ink-2 hover:border-ink-4"
          )}
        >
          {c}
        </button>
      ))}
    </div>
  )
}

function MiniChip({
  variant = "default",
  children,
}: {
  variant?: "default" | "red" | "amber"
  children: React.ReactNode
}) {
  const cls =
    variant === "red"
      ? "bg-red-50 border-red-200 text-err"
      : variant === "amber"
        ? "bg-amber-50 border-amber-200 text-amber-700"
        : "bg-card border-hair text-ink"
  return (
    <span
      className={cn("text-[11px] font-semibold px-[10px] py-[3px] rounded-full border whitespace-nowrap", cls)}
    >
      {children}
    </span>
  )
}
