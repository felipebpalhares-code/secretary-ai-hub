"use client"
import { useCallback, useEffect, useState } from "react"
import { Icon } from "@/components/Icon"
import { Badge } from "@/components/ui/Badge"
import {
  listGoals,
  deleteGoal,
  getPreferences,
  type Goal,
  type GoalCategory,
  type Preferences,
} from "@/lib/api"
import {
  AddBtn,
  DeleteBtn,
  EditBtn,
  EmptyState,
  ErrorBanner,
  LoadingPlaceholder,
  SectionHdr,
  confirmDelete,
} from "./_shared"
import { EditGoalModal } from "./EditGoalModal"
import { EditPreferencesModal } from "./EditPreferencesModal"

const CURRENT_YEAR = new Date().getFullYear()

const DAY_LABEL: Record<string, string> = {
  seg: "Seg", ter: "Ter", qua: "Qua", qui: "Qui",
  sex: "Sex", sab: "Sáb", dom: "Dom",
}

function GoalRow({
  goal,
  onEdit,
  onDelete,
}: {
  goal: Goal
  onEdit: () => void
  onDelete: () => void
}) {
  const variant: "green" | "amber" | "indigo" =
    goal.is_done ? "green" : goal.progress >= 50 ? "indigo" : "amber"
  const label = goal.is_done ? "Concluída" : `${goal.progress}%`
  return (
    <div className="flex items-start gap-[10px] px-3 py-[10px] rounded-md bg-bg border border-hair mb-[6px]">
      <div className="flex-1">
        <div className="text-[12.5px] font-medium text-ink tracking-[-.05px]">{goal.description}</div>
        <div className="h-[3px] bg-hair rounded-full overflow-hidden mt-[6px]">
          <div className="h-full bg-accent rounded-full" style={{ width: `${goal.progress}%` }} />
        </div>
      </div>
      <Badge variant={variant}>{label}</Badge>
      <button onClick={onEdit} className="text-ink-3 hover:text-accent p-1 rounded">
        <Icon name="edit" size={13} />
      </button>
      <button onClick={onDelete} className="text-ink-3 hover:text-err p-1 rounded">
        <Icon name="close" size={13} />
      </button>
    </div>
  )
}

export function ObjetivosTab() {
  const [goals, setGoals] = useState<Goal[] | null>(null)
  const [prefs, setPrefs] = useState<Preferences | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [goalModal, setGoalModal] = useState<{ open: boolean; initial: Goal | null; defaultCategory: GoalCategory }>({
    open: false, initial: null, defaultCategory: "pessoal",
  })
  const [prefModal, setPrefModal] = useState(false)

  const reload = useCallback(async () => {
    setError(null)
    try {
      const [g, p] = await Promise.all([listGoals(), getPreferences()])
      setGoals(g)
      setPrefs(p)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Falha ao carregar objetivos")
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  if (goals === null || prefs === null) return <LoadingPlaceholder />
  if (error) return <ErrorBanner message={error} />

  const personal = goals.filter((g) => g.category === "pessoal" && g.year === CURRENT_YEAR)
  const business = goals.filter((g) => g.category === "empresarial" && g.year === CURRENT_YEAR)
  const days = (prefs.work_days ?? "").split(",").map((d) => d.trim()).filter(Boolean)

  return (
    <>
      <div>
        <SectionHdr
          title={`Metas pessoais ${CURRENT_YEAR}`}
          action={
            <AddBtn label="Nova meta"
              onClick={() => setGoalModal({ open: true, initial: null, defaultCategory: "pessoal" })} />
          }
        />
        {personal.length === 0 ? (
          <EmptyState icon="target" title="Sem metas pessoais ainda" subtitle={`Defina o que quer alcançar em ${CURRENT_YEAR}.`} />
        ) : (
          <div className="bg-card border border-hair rounded-lg p-4">
            {personal.map((g) => (
              <GoalRow
                key={g.id}
                goal={g}
                onEdit={() => setGoalModal({ open: true, initial: g, defaultCategory: "pessoal" })}
                onDelete={async () => {
                  if (!confirmDelete(g.description)) return
                  await deleteGoal(g.id); await reload()
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionHdr
          title={`Metas empresariais ${CURRENT_YEAR}`}
          action={
            <AddBtn label="Nova meta"
              onClick={() => setGoalModal({ open: true, initial: null, defaultCategory: "empresarial" })} />
          }
        />
        {business.length === 0 ? (
          <EmptyState icon="building" title="Sem metas empresariais ainda" subtitle={`Faturamento, expansão, contratações em ${CURRENT_YEAR}.`} />
        ) : (
          <div className="bg-card border border-hair rounded-lg p-4">
            {business.map((g) => (
              <GoalRow
                key={g.id}
                goal={g}
                onEdit={() => setGoalModal({ open: true, initial: g, defaultCategory: "empresarial" })}
                onDelete={async () => {
                  if (!confirmDelete(g.description)) return
                  await deleteGoal(g.id); await reload()
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionHdr title="Como prefere ser tratado" action={<EditBtn onClick={() => setPrefModal(true)} />} />
        <div className="bg-card border border-hair rounded-lg p-4">
          <div className="bg-bg border border-hair rounded-md p-4 text-[12.5px] text-ink-2 leading-[1.65] font-medium">
            <div className="mb-2">
              Tratamento: <strong className="text-ink">{prefs.how_to_address || "—"}</strong>
            </div>
            {prefs.communication_style ? (
              prefs.communication_style
            ) : (
              <span className="text-ink-3 italic">Sem estilo de comunicação definido. Clique em &ldquo;Editar&rdquo; pra registrar suas preferências.</span>
            )}
            {prefs.emergency_contact && (
              <div className="mt-2 text-[11.5px] text-ink-3">
                Contato de urgência: <span className="mono">{prefs.emergency_contact}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <SectionHdr title="Disponibilidade" />
        <div className="bg-card border border-hair rounded-lg p-4">
          {prefs.work_hours_start && prefs.work_hours_end && days.length > 0 ? (
            <div className="grid grid-cols-7 gap-[5px] text-center">
              {(["seg", "ter", "qua", "qui", "sex", "sab", "dom"] as const).map((d) => {
                const on = days.includes(d)
                return (
                  <div key={d}>
                    <div className="text-[10px] font-bold text-ink-3 uppercase">{DAY_LABEL[d]}</div>
                    <div
                      className={`rounded-md py-1.5 text-[10.5px] font-semibold mt-1 border ${
                        on
                          ? "bg-accent-soft text-accent border-indigo-200"
                          : "bg-hair-2 text-ink-3 border-hair"
                      }`}
                    >
                      {on ? `${prefs.work_hours_start}–${prefs.work_hours_end}` : "Folga"}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-[11.5px] text-ink-3 italic font-medium">
              Defina seu horário de trabalho clicando em &ldquo;Editar&rdquo; acima.
            </div>
          )}
        </div>
      </div>

      <div>
        <SectionHdr title="Prioridades de vida" />
        {prefs.life_priorities.length === 0 ? (
          <EmptyState
            icon="target"
            title="Sem prioridades definidas"
            subtitle="Quando há conflitos, os agentes consultam essa ordem para sugerir trade-offs."
            action={<EditBtn onClick={() => setPrefModal(true)} />}
          />
        ) : (
          <ol className="border border-hair rounded-md overflow-hidden bg-card">
            {prefs.life_priorities.map((p, i) => (
              <li
                key={`${p}-${i}`}
                className="flex items-center gap-3 px-4 py-3 border-b border-hair-2 last:border-b-0 text-[12.5px]"
              >
                <span className="w-6 h-6 rounded-full bg-accent-soft text-accent border border-indigo-200 flex items-center justify-center text-[11px] font-bold">
                  {i + 1}
                </span>
                <span className="flex-1 font-bold text-ink">{p}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <EditGoalModal
        open={goalModal.open}
        onClose={() => setGoalModal({ open: false, initial: null, defaultCategory: "pessoal" })}
        initial={goalModal.initial}
        defaultCategory={goalModal.defaultCategory}
        defaultYear={CURRENT_YEAR}
        onSaved={reload}
      />
      <EditPreferencesModal open={prefModal} onClose={() => setPrefModal(false)} onSaved={reload} />
    </>
  )
}
