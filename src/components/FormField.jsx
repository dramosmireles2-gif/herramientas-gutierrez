/** Input con label visible, texto de ayuda y error accesible. */
export default function FormField({ id, label, error, hint, optional = false, className = '', ...input }) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-titanio">
        {label} {optional && <span className="font-normal text-gris">(opcional)</span>}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-12 w-full rounded-lg border bg-blanco px-3 text-base ${error ? 'border-agotado' : 'border-gris/40'}`}
        {...input}
      />
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-gris">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-agotado">{error}</p>}
    </div>
  )
}
