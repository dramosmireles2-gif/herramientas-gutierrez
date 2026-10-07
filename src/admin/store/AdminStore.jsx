import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { readJSON, writeJSON } from '../../lib/storage'
import { datosIniciales } from './datosIniciales'
import { ErrorMovimiento, aplicarMovimientos } from './movimientos'

// Cambiar la versión invalida lo guardado en navegadores que ya abrieron el demo.
const CLAVE = 'hg-admin-demo-v1'
const TABLAS_PROTEGIDAS = ['inventario', 'movimientos'] // solo cambian con registrarMovimiento

const sesionInicial = { usuario_id: 'u-admin', sucursal_filtro: 'todas' }

function cargar() {
  const guardado = readJSON(CLAVE, null)
  if (guardado?.datos?.productos && guardado?.sesion) return guardado
  return { datos: datosIniciales(), sesion: sesionInicial }
}

const AdminContext = createContext(null)

export function AdminStoreProvider({ children }) {
  const [estado, setEstado] = useState(cargar)
  // Copia sincrónica del estado: permite validar y responder ok/error en el mismo clic.
  const actual = useRef(estado)
  const cambiar = useCallback((siguiente) => {
    actual.current = siguiente
    setEstado(siguiente)
  }, [])

  useEffect(() => writeJSON(CLAVE, estado), [estado])

  const usuario = estado.datos.usuarios.find((u) => u.id === estado.sesion.usuario_id) ?? estado.datos.usuarios[0]
  const esAdmin = usuario.rol === 'admin'
  // El encargado siempre ve solo su sucursal.
  const sucursalFiltro = esAdmin ? estado.sesion.sucursal_filtro : usuario.sucursal_id

  /**
   * Cambio atómico: registra movimientos de inventario y, opcionalmente, actualiza otras tablas
   * (pedidos, traspasos…) en el mismo paso. Si algo falla no cambia nada.
   * @param {{movimientos?: object[], cambios?: (datos) => object}} operacion
   * @returns {{ok: true, movimientos: object[]} | {ok: false, error: string}}
   */
  const ejecutar = useCallback(({ movimientos = [], cambios } = {}) => {
    const { datos, sesion } = actual.current
    const quien = datos.usuarios.find((u) => u.id === sesion.usuario_id)
    try {
      let siguiente = datos
      let registrados = []
      if (movimientos.length) {
        const r = aplicarMovimientos(datos, movimientos, { usuario: quien })
        siguiente = r.estado
        registrados = r.movimientos
      }
      if (cambios) {
        const parcial = cambios(siguiente) ?? {}
        const prohibidas = Object.keys(parcial).filter((t) => TABLAS_PROTEGIDAS.includes(t))
        if (prohibidas.length) throw new Error(`Las existencias solo cambian con registrarMovimiento (${prohibidas.join(', ')}).`)
        siguiente = { ...siguiente, ...parcial }
      }
      cambiar({ ...actual.current, datos: siguiente })
      return { ok: true, movimientos: registrados }
    } catch (e) {
      if (e instanceof ErrorMovimiento) return { ok: false, error: e.message }
      throw e
    }
  }, [cambiar])

  /** Registra un movimiento de inventario. Ver aplicarMovimientos para el formato. */
  const registrarMovimiento = useCallback((movimiento) => ejecutar({ movimientos: [movimiento] }), [ejecutar])

  const cambiarUsuario = useCallback((usuarioId) => {
    const u = actual.current.datos.usuarios.find((x) => x.id === usuarioId)
    if (!u) return
    cambiar({ ...actual.current, sesion: { usuario_id: u.id, sucursal_filtro: u.rol === 'admin' ? 'todas' : u.sucursal_id } })
  }, [cambiar])

  const cambiarSucursalFiltro = useCallback((sucursalId) => {
    cambiar({ ...actual.current, sesion: { ...actual.current.sesion, sucursal_filtro: sucursalId } })
  }, [cambiar])

  /** Regresa todo a los datos originales del demo. */
  const reiniciarDemo = useCallback(() => {
    cambiar({ datos: datosIniciales(), sesion: { ...actual.current.sesion } })
  }, [cambiar])

  const valor = useMemo(() => ({
    datos: estado.datos,
    usuario,
    esAdmin,
    sucursalFiltro,
    ejecutar,
    registrarMovimiento,
    cambiarUsuario,
    cambiarSucursalFiltro,
    reiniciarDemo,
  }), [estado.datos, usuario, esAdmin, sucursalFiltro, ejecutar, registrarMovimiento, cambiarUsuario, cambiarSucursalFiltro, reiniciarDemo])

  return <AdminContext.Provider value={valor}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin debe usarse dentro de <AdminStoreProvider>')
  return ctx
}
