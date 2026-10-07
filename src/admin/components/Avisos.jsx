import { createContext, useCallback, useContext, useState } from 'react'
import { CheckIcon, XIcon } from '../../components/icons'

// Avisos breves ("Entrada registrada…") que confirman cada acción del demo.
const AvisosContext = createContext(() => {})

export function AvisosProvider({ children }) {
  const [avisos, setAvisos] = useState([])

  const quitar = useCallback((id) => setAvisos((a) => a.filter((x) => x.id !== id)), [])
  const avisar = useCallback((texto, tipo = 'ok') => {
    const id = Math.random().toString(36).slice(2)
    setAvisos((a) => [...a.slice(-2), { id, texto, tipo }])
    setTimeout(() => quitar(id), 4500)
  }, [quitar])

  return (
    <AvisosContext.Provider value={avisar}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {avisos.map((a) => (
          <div
            key={a.id}
            role={a.tipo === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${a.tipo === 'error' ? 'bg-agotado text-blanco' : 'bg-titanio text-blanco'}`}
          >
            {a.tipo !== 'error' && <CheckIcon width={18} height={18} className="mt-0.5 shrink-0 text-hielo" />}
            <p className="flex-1">{a.texto}</p>
            <button type="button" onClick={() => quitar(a.id)} className="-m-1 rounded p-1 opacity-80 hover:opacity-100" aria-label="Cerrar aviso">
              <XIcon width={16} height={16} />
            </button>
          </div>
        ))}
      </div>
    </AvisosContext.Provider>
  )
}

/** avisar(texto, 'ok' | 'error') */
export const useAvisos = () => useContext(AvisosContext)
