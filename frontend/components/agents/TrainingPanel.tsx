"use client"
import { useState, useEffect } from "react"
import { Icon } from "../Icon"
import { cn } from "@/lib/cn"
import type { Agent } from "@/lib/agents-data"

const TABS = [
  { id: "sp", label: "Especialidades", icon: "target" as const },
  { id: "dc", label: "Documentos", icon: "file" as const },
  { id: "bk", label: "Livros", icon: "card" as const },
  { id: "vd", label: "Vídeos", icon: "chat" as const },
  { id: "in", label: "Instruções", icon: "edit" as const },
  { id: "lg", label: "Histórico", icon: "clock" as const },
]

export function TrainingPanel({
  agent,
  open,
  onClose,
}: {
  agent: Agent | null
  open: boolean
  onClose: () => void
}) {
  const [tab, setTab] = useState("sp")
  const [specialties, setSpecialties] = useState([
    "Direito Civil",
    "Contratos",
    "Prazos Judiciais",
    "Direito Trabalhista",
    "Direito Imobiliário",
  ])
  const [newSpec, setNewSpec] = useState("")

  useEffect(() => {
    if (open) setTab("sp")
  }, [open, agent?.id])

  const addSpec = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !newSpec.trim()) return
    setSpecialties((s) => [...s, newSpec.trim()])
    setNewSpec("")
  }

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-slate-900/40 z-40 transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      <div
        className={cn(
          "fixed top-0 right-0 h-screen w-[480px] bg-card z-50 flex flex-col shadow-[-8px_0_32px_rgba(15,23,42,.12)] transition-transform",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center gap-[11px] px-5 py-4 border-b border-hair shrink-0">
          <div className="w-9 h-9 rounded-md bg-bg border border-hair flex items-center justify-center text-base">
            {agent?.emoji}
          </div>
          <div>
            <div className="text-[14px] font-bold text-ink tracking-[-.2px]">{agent?.name}</div>
            <div className="text-[11px] text-ink-3 mt-px font-medium">
              {agent?.title} · {agent?.level}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-ink-3 hover:text-ink p-1 rounded hover:bg-bg transition-colors"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="flex border-b border-hair overflow-x-auto px-5 shrink-0 scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-3 py-[11px] text-[11.5px] font-semibold whitespace-nowrap flex items-center gap-[5px] tracking-[-.1px] border-b-2 transition-colors",
                tab === t.id
                  ? "text-accent border-accent"
                  : "text-ink-3 border-transparent hover:text-ink-2"
              )}
            >
              <Icon name={t.icon} size={13} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {tab === "sp" && (
            <>
              <p className="text-[11.5px] text-ink-2 font-medium leading-[1.5]">
                Adicione especialidades e elas serão injetadas automaticamente no system prompt.
              </p>
              <div className="flex flex-wrap gap-[5px] items-center">
                {specialties.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-[5px] text-[11.5px] font-semibold px-[10px] py-[3px] rounded-full bg-accent-soft text-accent border border-indigo-200"
                  >
                    {s}
                    <button
                      onClick={() => setSpecialties((x) => x.filter((_, j) => j !== i))}
                      className="font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  value={newSpec}
                  onChange={(e) => setNewSpec(e.target.value)}
                  onKeyDown={addSpec}
                  placeholder="+ Especialidade..."
                  className="text-[11.5px] font-semibold bg-transparent border border-dashed border-ink-4 rounded-full px-[11px] py-[3px] outline-none w-[140px] focus:border-accent focus:border-solid"
                />
              </div>
              <div className="bg-accent-soft border border-indigo-200 rounded-md p-3 text-[11.5px] text-ink-2 leading-[1.6] font-medium">
                <div className="text-[10.5px] font-bold text-accent uppercase tracking-[.05em] mb-1">
                  System prompt atual
                </div>
                "Você é {agent?.name}, {agent?.title.toLowerCase()} de Felipe Palhares. Especialidades:{" "}
                {specialties.join(", ")}. Traduz juridiquês para português simples. Alerta sobre prazos
                críticos com 30, 15 e 7 dias de antecedência."
              </div>
            </>
          )}

          {tab === "dc" && (
            <>
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-ink-3 uppercase tracking-[.06em]">
                  12 documentos
                </div>
                <button className="inline-flex items-center gap-[5px] text-[11.5px] font-semibold border border-hair px-[11px] py-[5px] rounded-md text-ink hover:border-ink-4 transition-colors">
                  <Icon name="plus" size={12} />
                  Upload
                </button>
              </div>
              {[
                "Proc_0001234_Trabalhista.pdf 2,4 MB",
                "Proc_0005678_Civel.pdf 1,8 MB",
                "Contrato_Locacao_PalharesTech.pdf 890 KB",
                "CPC_Anotado_2024.pdf 12,1 MB",
              ].map((line, i) => {
                const [name, size] = line.split(/ (?=\d)/)
                return (
                  <div
                    key={i}
                    className="flex items-center gap-[10px] px-3 py-[9px] bg-bg border border-hair rounded-md"
                  >
                    <div className="w-7 h-7 rounded bg-card border border-hair flex items-center justify-center text-ink-2">
                      <Icon name="file" size={13} />
                    </div>
                    <div className="text-[12px] font-semibold text-ink flex-1 tracking-[-.1px]">
                      {name}
                    </div>
                    <div className="text-[10.5px] text-ink-3 font-medium">{size}</div>
                  </div>
                )
              })}
              <div className="border border-dashed border-ink-4 rounded-md p-5 text-center text-ink-3 bg-bg hover:border-accent hover:text-accent hover:bg-accent-soft transition-colors cursor-pointer">
                <Icon name="plus" size={20} className="mx-auto mb-1" />
                <div className="text-[12px] font-medium">
                  Arraste PDFs ou clique para selecionar · máx. 50 MB
                </div>
              </div>
            </>
          )}

          {tab === "bk" && (
            <>
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-ink-3 uppercase tracking-[.06em]">
                  Referências bibliográficas
                </div>
                <button className="inline-flex items-center gap-[5px] text-[11.5px] font-semibold border border-hair px-[11px] py-[5px] rounded-md text-ink hover:border-ink-4 transition-colors">
                  <Icon name="plus" size={12} />
                  Adicionar
                </button>
              </div>
              <Book
                title="Manual de Direito Civil — Vol. 1 a 6"
                author="Flávio Tartuce · Ed. Método, 2024"
                learn="Base doutrinária para contratos, responsabilidade civil e direitos reais. Aplicado ao contexto das empresas do Felipe."
              />
              <Book
                title="Código de Processo Civil Comentado"
                author="Humberto Theodoro Jr · Ed. Forense, 2024"
                learn="Referência para prazos processuais, recursos e execuções. Fundamental para alertas de prazo."
              />
              <Book
                title="CLT Consolidada"
                author="Texto oficial atualizado 2025"
                learn="Base para o processo trabalhista ativo (Proc. 0001234). Referência para relações de emprego."
              />
            </>
          )}

          {tab === "vd" && (
            <>
              <div className="text-[10px] font-bold text-ink-3 uppercase tracking-[.06em]">
                Cursos e canais
              </div>
              <VideoItem title="Direito para Empreendedores — T2" channel="Canal Dr. Felipe Valim · YouTube · 24 episódios" />
              <VideoItem title="Gestão de Contratos Empresariais" channel="Coursera · FGV · 12h" />
              <VideoItem title="Trabalhista para Empresários" channel="Canal Migalhas · YouTube · 3h" />
            </>
          )}

          {tab === "in" && (
            <>
              <p className="text-[11.5px] text-ink-2 font-medium leading-[1.5]">
                Comportamentos específicos injetados no system prompt. Seja detalhado.
              </p>
              <textarea
                defaultValue={`- Sempre me avise com 30, 15 e 7 dias de antecedência sobre qualquer prazo processual
- Quando citar um processo, sempre inclua o número completo e a vara
- Nunca dê parecer definitivo — termine com "consulte presencialmente o advogado"
- Quando houver contradição entre meus interesses e a lei, me avise claramente
- Traduza sempre o juridiquês para linguagem simples ao final de cada resposta`}
                className="w-full border border-hair rounded-md px-[13px] py-[11px] text-[12.5px] text-ink leading-[1.55] min-h-[120px] outline-none resize-y bg-card focus:border-accent"
              />
              <div className="text-[11px] text-ink-3 font-medium">
                Sugestões: "Me avise X dias antes" · "Cite o artigo de lei" · "Compare com precedentes"
              </div>
            </>
          )}

          {tab === "lg" && (
            <>
              <div className="text-[10px] font-bold text-ink-3 uppercase tracking-[.06em]">
                Log de treinamento
              </div>
              {[
                ["23/04/2026", "Documento carregado: Proc_0001234_Trabalhista.pdf"],
                ["22/04/2026", "Nova instrução: alertas 30/15/7 dias antes"],
                ["20/04/2026", "Livro adicionado: CPC Comentado — Theodoro Jr."],
                ["18/04/2026", "Nova especialidade: Direito Imobiliário"],
                ["15/04/2026", "Documento carregado: Contrato_Locacao_PalharesTech.pdf"],
                ["10/04/2026", "Vídeo adicionado: Direito para Empreendedores T.2"],
                ["01/04/2026", "Agente criado com especialidades base"],
              ].map(([date, text], i) => (
                <div
                  key={i}
                  className="flex items-start gap-[10px] py-2 border-b border-hair-2 last:border-b-0 text-[11.5px]"
                >
                  <div className="w-[6px] h-[6px] rounded-full bg-accent shrink-0 mt-[5px]" />
                  <div className="text-[10.5px] font-semibold text-ink-3 w-[76px] shrink-0 font-medium">
                    {date}
                  </div>
                  <div className="text-[11.5px] text-ink-2 leading-[1.5] font-medium">{text}</div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="flex justify-end gap-[6px] px-5 py-3 border-t border-hair shrink-0">
          <button
            onClick={onClose}
            className="px-[13px] py-[7px] rounded-md border border-hair bg-card text-[12.5px] font-semibold text-ink hover:bg-bg hover:border-ink-4 transition-colors"
          >
            Fechar
          </button>
          <button className="px-[13px] py-[7px] rounded-md bg-accent text-white border border-accent text-[12.5px] font-semibold hover:bg-accent-hover transition-colors">
            Salvar treinamento
          </button>
        </div>
      </div>
    </>
  )
}

function Book({ title, author, learn }: { title: string; author: string; learn: string }) {
  return (
    <div className="bg-bg border border-hair rounded-md p-3">
      <div className="text-[12.5px] font-bold text-ink tracking-[-.15px]">{title}</div>
      <div className="text-[10.5px] text-ink-3 mt-px font-medium">{author}</div>
      <div className="text-[11.5px] text-ink-2 mt-[6px] leading-[1.5] font-medium">{learn}</div>
    </div>
  )
}

function VideoItem({ title, channel }: { title: string; channel: string }) {
  return (
    <div className="flex items-start gap-[10px] px-3 py-[10px] bg-bg border border-hair rounded-md">
      <div className="w-10 h-7 rounded bg-card border border-hair flex items-center justify-center text-ink-2 shrink-0">
        <Icon name="chat" size={14} />
      </div>
      <div>
        <div className="text-[12.5px] font-semibold text-ink tracking-[-.1px]">{title}</div>
        <div className="text-[10.5px] text-ink-3 mt-px font-medium">{channel}</div>
      </div>
    </div>
  )
}
