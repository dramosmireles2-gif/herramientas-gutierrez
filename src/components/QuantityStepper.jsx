import { MinusIcon, PlusIcon } from './icons'

export default function QuantityStepper({ value, onChange, max, id = 'cantidad' }) {
  const clamp = (n) => Math.min(Math.max(1, n || 1), Math.max(1, max))
  return (
    <div className="inline-flex h-12 items-center rounded-lg bg-blanco ring-1 ring-titanio/20">
      <button
        type="button" onClick={() => onChange(clamp(value - 1))} disabled={value <= 1}
        className="flex h-full w-11 items-center justify-center text-titanio disabled:opacity-40" aria-label="Quitar uno"
      >
        <MinusIcon width={18} height={18} />
      </button>
      <label htmlFor={id} className="sr-only">Cantidad</label>
      <input
        id={id} type="number" inputMode="numeric" min={1} max={max} value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="price h-full w-12 border-0 bg-transparent text-center text-lg text-titanio [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button" onClick={() => onChange(clamp(value + 1))} disabled={value >= max}
        className="flex h-full w-11 items-center justify-center text-titanio disabled:opacity-40" aria-label="Agregar uno"
      >
        <PlusIcon width={18} height={18} />
      </button>
    </div>
  )
}
