import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../../store/AdminStore'
import { useAvisos } from '../../components/Avisos'
import Confirmar from '../../components/Confirmar'
import Encabezado from '../../components/Encabezado'
import Insignia from '../../components/Insignia'
import { PlusIcon } from '../../../components/icons'
import { formatoFechaHora } from '../../utils/formato'

const ESTADOS = {
  enviado: { texto: 'En tránsito', tono: 'info' },
  recibido: { texto: 'Recibido', tono: 'neutro' },
  cancelado: { texto: 'Cancelado', tono: 'oscuro' },
}

export default function Traspasos() {
  const { datos, esAdmin, usuario, sucursalFiltro, ejecutar } = useAdmin()
  const avisar = useAvisos()
  const [cancelando, setCancelando] = useState(null)

  const nombre = (id) => datos.sucursales.find((s) => s.id === id)?.nombre ?? id
  const producto = (id) => datos.productos.find((p) => p.id === id)
  const lista = datos.traspasos
    .filter((t) => sucursalFiltro === 'todas' || t.origen_id === sucursalFiltro || t.destino_id === sucursalFiltro)
    .sort((a, b) => (a.estado === 'enviado') !== (b.estado === 'enviado') ? (a.estado === 'enviado' ? -1 : 1) : b.fecha_envio.localeCompare(a.fecha_envio))

  // Recibir: suma en el destino (traspaso_entrada) y marca el traspaso como recibido, todo junto.
  const recibir = (t) => {
    const r = ejecutar({
      movimientos: t.items.map((it) => ({ producto_id: it.producto_id, sucursal_id: t.destino_id, tipo: 'traspaso_entrada', cantidad: it.cantidad, referencia: t.folio })),
      cambios: (d) => ({ traspasos: d.traspasos.map((x) => (x.id === t.id ? { ...x, estado: 'recibido', fecha_recepcion: new Date().toISOString() } : x)) }),
    })
    r.ok ? avisar(`${t.folio} recibido en ${nombre(t.destino_id)}: ${t.items.reduce((n, i) => n + i.cantidad, 0)} piezas sumadas.`) : avisar(r.error, 'error')
  }

  // Cancelar uno en tránsito: la mercancía regresa al origen.
  const cancelar = (t) => {
    const r = ejecutar({
      movimientos: t.items.map((it) => ({ producto_id: it.producto_id, sucursal_id: t.origen_id, tipo: 'traspaso_entrada', cantidad: it.cantidad, motivo: 'Traspaso cancelado', referencia: t.folio })),
      cambios: (d) => ({ traspasos: d.traspasos.map((x) => (x.id === t.id ? { ...x, estado: 'cancelado' } : x)) }),
    })
    setCancelando(null)
    r.ok ? avisar(`${t.folio} cancelado: la mercancía regresó a ${nombre(t.origen_id)}.`) : avisar(r.error, 'error')
  }

  const puedeRecibir = (t) => t.estado === 'enviado' && (esAdmin || usuario.sucursal_id === t.destino_id)
  const puedeCancelar = (t) => t.estado === 'enviado' && (esAdmin || usuario.sucursal_id === t.origen_id)

  return (
    <>
      <Encabezado
        titulo="Traspasos"
        descripcion="Al enviar se descuenta del origen y queda en tránsito; al recibir se suma en el destino."
        acciones={<Link to="/admin/traspasos/nuevo" className="btn-primary"><PlusIcon width={20} height={20} /> Nuevo traspaso</Link>}
      />

      {lista.length === 0 ? (
        <p className="rounded-xl bg-blanco p-8 text-center text-gris shadow-sm ring-1 ring-titanio/5">No hay traspasos para esta sucursal.</p>
      ) : (
        <ul className="space-y-3">
          {lista.map((t) => {
            const e = ESTADOS[t.estado]
            const piezas = t.items.reduce((n, i) => n + i.cantidad, 0)
            return (
              <li key={t.id} className={`rounded-xl bg-blanco p-4 shadow-sm ring-1 sm:p-5 ${t.estado === 'enviado' ? 'ring-hielo/60' : 'ring-titanio/5'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="price text-xl text-titanio">{t.folio}</span>
                      <Insignia tono={e.tono}>{e.texto}</Insignia>
                    </div>
                    <p className="mt-1 font-semibold">{nombre(t.origen_id)} <span className="text-hielo-texto" aria-hidden="true">→</span><span className="sr-only">hacia</span> {nombre(t.destino_id)}</p>
                    <p className="text-xs text-gris">
                      Enviado {formatoFechaHora(t.fecha_envio)} por {t.usuario}
                      {t.fecha_recepcion && ` · Recibido ${formatoFechaHora(t.fecha_recepcion)}`}
                    </p>
                  </div>
                  <div className="flex w-full gap-2 sm:w-auto">
                    {puedeCancelar(t) && (
                      <button type="button" onClick={() => setCancelando(t)} className="btn h-11 flex-1 text-sm text-agotado ring-1 ring-agotado/30 hover:bg-agotado/10 sm:flex-none">Cancelar</button>
                    )}
                    {puedeRecibir(t) && (
                      <button type="button" onClick={() => recibir(t)} className="btn-primary h-11 flex-1 text-sm sm:flex-none">Recibir en {nombre(t.destino_id)}</button>
                    )}
                  </div>
                </div>
                <details className="mt-3 border-t border-fondo pt-2">
                  <summary className="cursor-pointer py-1 text-sm font-semibold text-hielo-texto">{t.items.length} {t.items.length === 1 ? 'producto' : 'productos'} · {piezas} {piezas === 1 ? 'pieza' : 'piezas'}</summary>
                  <ul className="mt-2 space-y-1 text-sm">
                    {t.items.map((it) => (
                      <li key={it.producto_id} className="flex justify-between gap-3">
                        <Link to={`/admin/productos/${it.producto_id}`} className="hover:underline">{producto(it.producto_id)?.nombre}</Link>
                        <span className="price shrink-0 text-base">{it.cantidad}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            )
          })}
        </ul>
      )}

      <Confirmar
        abierto={Boolean(cancelando)}
        titulo={`¿Cancelar ${cancelando?.folio ?? ''}?`}
        mensaje={cancelando ? `La mercancía en tránsito regresa a ${nombre(cancelando.origen_id)} y queda registrado en movimientos.` : ''}
        textoConfirmar="Sí, cancelar traspaso"
        peligro
        onConfirmar={() => cancelar(cancelando)}
        onCancelar={() => setCancelando(null)}
      />
    </>
  )
}
