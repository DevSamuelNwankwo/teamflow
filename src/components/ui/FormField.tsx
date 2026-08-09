import { useId, type ReactNode } from 'react'
import { cloneElement, isValidElement } from 'react'

interface FormFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  /** Typically a single form control (Input/Select/Textarea), which receives id/aria-*
   *  automatically. Composite controls (e.g. a custom picker) are rendered as-is. */
  children: ReactNode
}

/** Consistent label + control + error/hint wiring (id/aria-invalid/aria-describedby) for every
 *  form field in the app — used by project, task, and auth forms alike. */
export function FormField({ label, error, hint, required, children }: FormFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  const control = isValidElement<Record<string, unknown>>(children)
    ? cloneElement(children, {
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': error ? errorId : hint ? hintId : undefined,
      })
    : children

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-status-red-text"> *</span>}
      </label>
      {control as ReactNode}
      {error ? (
        <p id={errorId} className="text-sm text-status-red-text" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm text-text-tertiary">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
