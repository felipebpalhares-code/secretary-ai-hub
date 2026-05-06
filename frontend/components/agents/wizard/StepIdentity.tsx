"use client"
import { forwardRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ChevronRight } from "lucide-react"
import { listAgents } from "@/lib/agents-api"
import { useAgentWizard } from "@/stores/agentWizard"
import { WizardFooter } from "./WizardFooter"

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome muito curto")
    .max(60, "Nome muito longo"),
  role: z
    .string()
    .trim()
    .min(2, "Função muito curta")
    .max(80, "Função muito longa"),
})

type FormData = z.infer<typeof schema>

export function StepIdentity({ onCancel }: { onCancel: () => void }) {
  const { name, role, setIdentity, next } = useAgentWizard()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name, role },
    mode: "onSubmit",
  })

  // Foco automático no primeiro input
  useEffect(() => {
    document.getElementById("wizard-name")?.focus()
  }, [])

  const onValid = async (data: FormData) => {
    try {
      const list = await listAgents()
      const collision = list.some(
        (a) => a.name.trim().toLowerCase() === data.name.trim().toLowerCase(),
      )
      if (collision) {
        setError("name", { message: "Já existe um agente com esse nome" })
        return
      }
    } catch {
      // se /api/agents falhar, deixa avançar — backend valida no POST
    }
    setIdentity({ name: data.name.trim(), role: data.role.trim() })
    next()
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-loose">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-display text-text-primary">Como vamos chamar seu agente?</h1>
          <p className="text-body text-text-secondary mt-2">
            Dê um nome e defina a função. Você pode editar depois.
          </p>

          <div className="mt-loose flex flex-col gap-comfortable">
            <Field
              id="wizard-name"
              label="Nome"
              placeholder="Ex: Dr. Silva"
              error={errors.name?.message}
              {...register("name")}
            />
            <Field
              id="wizard-role"
              label="Função"
              placeholder="Ex: Advogado Pessoal"
              error={errors.role?.message}
              {...register("role")}
            />
          </div>
        </div>
      </div>

      <WizardFooter onBack={onCancel} backLabel="Cancelar">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-brand text-white rounded-default px-4 py-2 text-body-strong font-medium shadow-xs hover:bg-brand-hover transition disabled:opacity-50"
        >
          Continuar
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </WizardFooter>
    </form>
  )
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { id, label, error, placeholder, ...rest },
  ref,
) {
  return (
    <div>
      <label htmlFor={id} className="block text-small text-text-secondary mb-1">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        placeholder={placeholder}
        className={`w-full bg-bg-surface border rounded-default px-3 py-2 text-body text-text-primary placeholder:text-text-tertiary transition focus:outline-none focus:ring-2 ${
          error
            ? "border-danger focus:border-danger focus:ring-danger/10"
            : "border-default focus:border-brand focus:ring-brand/10"
        }`}
        {...rest}
      />
      {error && <p className="text-small text-danger mt-1">{error}</p>}
    </div>
  )
})
