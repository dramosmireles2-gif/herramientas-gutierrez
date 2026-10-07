import { useState } from 'react'
import { useAdmin } from '../store/AdminStore'
import Confirmar from '../components/Confirmar'
import { IconoReiniciar } from '../components/iconos'

/** Banda superior discreta: avisa que son datos de ejemplo y permite volver al estado original. */
export default function BandaDemo() {
  const { reiniciarDemo } = useAdmin()
  const [confirmando, setConfirmando] = useState(false)

  return (
    <div className="flex items-center justify-between gap-3 bg-hielo/15 px-4 py-1.5 text-xs text-titanio">
      <p><strong className="font-bold">Versión demo</strong> — datos de ejemplo</p>
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="flex items-center gap-1.5 rounded px-2 py-1 font-semibold text-hielo-texto hover:bg-blanco/60"
      >
        <IconoReiniciar width={14} height={14} /> Reiniciar demo
      </button>
      <Confirmar
        abierto={confirmando}
        titulo="¿Reiniciar el demo?"
        mensaje="Se borran los cambios que hiciste (entradas, ajustes, traspasos, pedidos) y todo regresa a los datos de ejemplo originales."
        textoConfirmar="Sí, reiniciar"
        onConfirmar={() => {
          reiniciarDemo()
          setConfirmando(false)
        }}
        onCancelar={() => setConfirmando(false)}
      />
    </div>
  )
}
