import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAdmin } from '../../store/AdminStore'
import { TIPOS_MOVIMIENTO } from '../../store/movimientos'
import Encabezado from '../../components/Encabezado'
import SelectorProducto from '../../components/SelectorProducto'
import TablaMovimientos from '../../components/TablaMovimientos'
import { FiltroFecha, FiltroSelect, escribirFiltro, leerFiltros } from '../../components/Filtros'
import { IconoExcel } from '../../components/iconos'
import { useAvisos } from '../../components/Avisos'
import { exportarMovimientos } from '../../utils/exportaciones'

// Fecha local (YYYY-MM-DD) de un ISO, para comparar con los <input type="date">.
const diaLocal = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Historial (kardex): responde "¿quién movió esto y cuándo?". La sucursal viene del selector superior. */
export default function Movimientos() {
  const { datos, sucursalFiltro } = useAdmin()
  const avisar = useAvisos()
  const [params, setParams] = useSearchParams()
  const f = leerFiltros(params, ['desde', 'hasta', 'producto', 'tipo', 'usuario'])
  const filtrar = (clave) => (valor) => escribirFiltro(params, setParams, clave, valor)
  const hayFiltros = Object.values(f).some(Boolean)

  const movimientos = useMemo(() => datos.movimientos.filter((m) => {
    const dia = diaLocal(m.fecha)
    return (sucursalFiltro === 'todas' || m.sucursal_id === sucursalFiltro) &&
      (!f.desde || dia >= f.desde) &&
      (!f.hasta || dia <= f.hasta) &&
      (!f.producto || m.producto_id === f.producto) &&
      (!f.tipo || m.tipo === f.tipo) &&
      (!f.usuario || m.usuario === f.usuario)
  }), [datos.movimientos, sucursalFiltro, f.desde, f.hasta, f.producto, f.tipo, f.usuario])

  const usuarios = [...new Set(datos.movimientos.map((m) => m.usuario))].sort((a, b) => a.localeCompare(b, 'es'))
  const alcance = sucursalFiltro === 'todas' ? 'todas las sucursales' : datos.sucursales.find((s) => s.id === sucursalFiltro)?.nombre

  return (
    <>
      <Encabezado
        titulo="Movimientos"
        descripcion={`Cada cambio de existencia queda registrado con fecha, usuario y motivo. Mostrando ${alcance}.`}
        acciones={
          <button
            type="button"
            onClick={async () => {
              try {
                await exportarMovimientos(datos, movimientos)
                avisar(`${movimientos.length} movimientos exportados a Excel.`)
              } catch {
                avisar('No se pudo generar el archivo.', 'error')
              }
            }}
            disabled={!movimientos.length}
            className="btn bg-blanco text-titanio ring-1 ring-titanio/15 hover:bg-fondo"
          >
            <IconoExcel width={20} height={20} /> Exportar a Excel
          </button>
        }
      />

      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <FiltroFecha id="mov-desde" etiqueta="Desde" valor={f.desde} onCambiar={filtrar('desde')} />
        <FiltroFecha id="mov-hasta" etiqueta="Hasta" valor={f.hasta} onCambiar={filtrar('hasta')} />
        <div className="lg:col-span-1">
          <label htmlFor="mov-filtro-producto" className="mb-1 block text-xs font-semibold text-gris">Producto</label>
          <SelectorProducto id="mov-filtro-producto" valor={f.producto} onCambiar={filtrar('producto')} vacio="Todos los productos" />
        </div>
        <div>
          <span className="mb-1 block text-xs font-semibold text-gris" aria-hidden="true">Tipo</span>
          <FiltroSelect id="mov-tipo" etiqueta="Tipo de movimiento" valor={f.tipo} onCambiar={filtrar('tipo')}
            opciones={[{ valor: '', etiqueta: 'Todos los tipos' }, ...Object.entries(TIPOS_MOVIMIENTO).map(([valor, t]) => ({ valor, etiqueta: t.etiqueta }))]} />
        </div>
        <div>
          <span className="mb-1 block text-xs font-semibold text-gris" aria-hidden="true">Usuario</span>
          <FiltroSelect id="mov-usuario" etiqueta="Usuario" valor={f.usuario} onCambiar={filtrar('usuario')}
            opciones={[{ valor: '', etiqueta: 'Todos los usuarios' }, ...usuarios.map((u) => ({ valor: u, etiqueta: u }))]} />
        </div>
      </div>
      <div className="mb-3 flex items-center gap-3 text-sm text-gris" aria-live="polite">
        <span>{movimientos.length} {movimientos.length === 1 ? 'movimiento' : 'movimientos'}</span>
        {hayFiltros && (
          <button type="button" onClick={() => setParams(new URLSearchParams(), { replace: true })} className="font-bold text-hielo-texto hover:underline">
            Limpiar filtros
          </button>
        )}
      </div>

      <TablaMovimientos key={params.toString() + sucursalFiltro} movimientos={movimientos} />
    </>
  )
}
