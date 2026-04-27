import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

export function FormField({
  label,
  children,
  hint,
  required,
}: {
  label: string
  children: ReactNode
  hint?: string
  required?: boolean
}) {
  return (
    <div className="mb-3">
      <label className="block text-[11px] font-bold text-ink-3 uppercase tracking-[.07em] mb-1.5">
        {label}
        {required && <span className="text-err ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10.5px] text-ink-3 mt-1">{hint}</p>}
    </div>
  )
}

const baseInputCls =
  "w-full bg-bg border border-hair rounded-md px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(baseInputCls, className)} />
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(baseInputCls, "appearance-none pr-8", className)}>
      {children}
    </select>
  )
}

export function PrimaryButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center gap-1.5 bg-accent text-white text-[12px] font-semibold px-4 py-2 rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
        className,
      )}
    />
  )
}

export function SecondaryButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center gap-1.5 bg-card border border-hair text-ink text-[12px] font-semibold px-4 py-2 rounded-md hover:border-ink-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
        className,
      )}
    />
  )
}
