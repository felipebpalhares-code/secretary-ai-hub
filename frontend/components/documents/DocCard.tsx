import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import type { Document } from "@/lib/documents-data"

const THUMB_CLS: Record<Document["kind"], string> = {
  pdf: "bg-red-50 text-err border-red-200",
  doc: "bg-blue-50 text-blue-700 border-blue-200",
  img: "bg-purple-50 text-purple-700 border-purple-200",
  xls: "bg-emerald-50 text-emerald-700 border-emerald-200",
}

const THUMB_LABEL: Record<Document["kind"], string> = {
  pdf: "PDF",
  doc: "DOC",
  img: "IMG",
  xls: "XLS",
}

const CAT_DOT: Record<Document["category"], string> = {
  juridico: "bg-purple-600",
  financeiro: "bg-ok",
  empresas: "bg-blue-600",
  pessoal: "bg-accent",
  governo: "bg-warn",
  saude: "bg-err",
  obras: "bg-orange-600",
}

const CAT_LABEL: Record<Document["category"], string> = {
  juridico: "Jurídico",
  financeiro: "Financeiro",
  empresas: "Empresas",
  pessoal: "Pessoal",
  governo: "Governo",
  saude: "Saúde",
  obras: "Obras",
}

const TAG_CLS = {
  gray: "bg-hair-2 text-ink-2 border-hair",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
  indigo: "bg-accent-soft text-accent border-indigo-200",
}

const ORIGIN_ICN: Record<Document["origin"], Parameters<typeof Icon>[0]["name"]> = {
  whatsapp: "chat",
  telegram: "send",
  email: "mail",
  upload: "plus",
  hub: "bot",
}

export function DocCard({
  doc,
  selected,
  onClick,
}: {
  doc: Document
  selected: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border rounded-md p-3 cursor-pointer flex flex-col gap-[10px] transition-all relative",
        selected
          ? "border-accent ring-4 ring-indigo-600/10"
          : "border-hair hover:border-ink-4 hover:shadow-[0_1px_3px_rgba(15,23,42,.06)]"
      )}
    >
      {doc.alert && (
        <span className="absolute top-[10px] right-[10px] w-[6px] h-[6px] rounded-full bg-err" />
      )}

      <div className="flex items-start gap-[10px]">
        <div
          className={cn(
            "w-9 h-11 rounded border flex items-center justify-center font-extrabold text-[9px] tracking-wide",
            THUMB_CLS[doc.kind]
          )}
        >
          {THUMB_LABEL[doc.kind]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-bold text-ink truncate tracking-[-.15px]">{doc.name}</div>
          <div className="text-[10.5px] text-ink-3 mt-0.5 flex items-center gap-[5px] font-medium">
            <span className={cn("w-[6px] h-[6px] rounded-full", CAT_DOT[doc.category])} />
            {CAT_LABEL[doc.category]}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-[6px] text-[10.5px] text-ink-2 font-medium">
        <span className="w-[18px] h-[18px] rounded bg-bg border border-hair flex items-center justify-center text-ink-2 shrink-0">
          <Icon name={ORIGIN_ICN[doc.origin]} size={10} />
        </span>
        {doc.originMeta}
      </div>

      <div className="flex gap-1 flex-wrap">
        {doc.tags.map((t, i) => (
          <span
            key={i}
            className={cn("text-[9.5px] font-bold px-[6px] py-[1.5px] rounded border", TAG_CLS[t.variant])}
          >
            {t.label}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10.5px] text-ink-3 font-medium">
        <div className="flex items-center gap-[5px]">
          <span className="w-[18px] h-[18px] rounded bg-bg border border-hair flex items-center justify-center text-[10px]">
            {doc.agent.emoji}
          </span>
          {doc.agent.label}
        </div>
        <span>{doc.time}</span>
      </div>
    </div>
  )
}
