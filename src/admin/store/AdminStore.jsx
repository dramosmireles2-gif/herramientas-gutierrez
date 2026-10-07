import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { readJSON, writeJSON } from '../../lib/storage'
import { datosIniciales } from './datosIniciales'
import { ErrorMovimiento, aplicarMovimientos } from './movimientos'

// Cambiar la versión invalida lo guardado en navegadores que ya abrieron el demo.
const CLAVE = 'hg-admin-demo-v1'
const TABLAS_PROTEGIDAS = ['inventario', 'movimientos'] // solo cambian con registrarMovimiento

const sesionInicial = { usuario_id: 'u-admin', sucursal_filtro: 'todas', autenticado: false }

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
    cambiar({
      ...actual.current,
      sesion: { ...actual.current.sesion, usuario_id: u.id, sucursal_filtro: u.rol === 'admin' ? 'todas' : u.sucursal_id },
    })
  }, [cambiar])

  /** Login simulado: cualquier dato entra con el usuario elegido. */
  const iniciarSesion = useCallback((usuarioId) => {
    const u = actual.current.datos.usuarios.find((x) => x.id === usuarioId)
    if (!u) return
    cambiar({ ...actual.current, sesion: { usuario_id: u.id, sucursal_filtro: u.rol === 'admin' ? 'todas' : u.sucursal_id, autenticado: true } })
  }, [cambiar])

  const cerrarSesion = useCallback(() => {
    cambiar({ ...actual.current, sesion: { ...actual.current.sesion, autenticado: false } })
  }, [cambiar])

  /**
   * Crea o actualiza un producto. Al crear uno inventariado le agrega una fila de inventario
   * en 0 por sucursal (no es un movimiento: no cambia ninguna cantidad existente).
   * El encargado no puede cambiar precios ni crear productos.
   * @returns {{ok: true, producto: object} | {ok: false, error: string}}
   */
  const guardarProducto = useCallback((producto) => {
    const { datos, sesion } = actual.current
    const quien = datos.usuarios.find((u) => u.id === sesion.usuario_id)
    const existente = datos.productos.find((p) => p.id === producto.id)
    if (quien.rol !== 'admin') {
      if (!existente) return { ok: false, error: 'Solo el administrador puede crear productos.' }
      if (existente.precio !== producto.precio || existente.precio_oferta !== producto.precio_oferta) {
        return { ok: false, error: 'Solo el administrador puede cambiar precios.' }
      }
    }
    const sku = producto.sku.trim().toUpperCase()
    if (datos.productos.some((p) => p.id !== producto.id && p.sku.toUpperCase() === sku)) {
      return { ok: false, error: `Ya existe un producto con el SKU ${sku}.` }
    }
    const ahora = new Date().toISOString()
    const guardado = existente
      ? { ...existente, ...producto, sku, actualizado_en: ahora }
      : { ...producto, id: `p-n${Date.now().toString(36)}`, sku, creado_en: ahora, actualizado_en: ahora }

    let inventario = datos.inventario
    const ubicaciones = datos.sucursales.filter((s) => (guardado.tipo === 'sobre_pedido' ? s.tipo === 'proveedor' : s.tipo === 'sucursal'))
    const faltantes = ubicaciones.filter((s) => !inventario.some((f) => f.producto_id === guardado.id && f.sucursal_id === s.id))
    if (faltantes.length) {
      inventario = [...inventario, ...faltantes.map((s) => ({ producto_id: guardado.id, sucursal_id: s.id, cantidad: 0, minimo: 0 }))]
    }
    const productos = existente ? datos.productos.map((p) => (p.id === guardado.id ? guardado : p)) : [...datos.productos, guardado]
    cambiar({ ...actual.current, datos: { ...datos, productos, inventario } })
    return { ok: true, producto: guardado }
  }, [cambiar])

  /** Cambia el mínimo de existencia (configuración de la fila; la cantidad no se toca). */
  const actualizarMinimo = useCallback((productoId, sucursalId, minimo) => {
    const { datos, sesion } = actual.current
    const quien = datos.usuarios.find((u) => u.id === sesion.usuario_id)
    if (quien.rol === 'encargado' && quien.sucursal_id !== sucursalId) return { ok: false, error: 'Solo puedes cambiar tu sucursal.' }
    const valor = Math.max(0, Math.floor(Number(minimo) || 0))
    const inventario = datos.inventario.map((f) =>
      f.producto_id === productoId && f.sucursal_id === sucursalId ? { ...f, minimo: valor } : f,
    )
    cambiar({ ...actual.current, datos: { ...datos, inventario } })
    return { ok: true }
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
    autenticado: Boolean(estado.sesion.autenticado),
    sucursalFiltro,
    ejecutar,
    registrarMovimiento,
    guardarProducto,
    actualizarMinimo,
    cambiarUsuario,
    cambiarSucursalFiltro,
    iniciarSesion,
    cerrarSesion,
    reiniciarDemo,
  }), [estado.datos, estado.sesion.autenticado, usuario, esAdmin, sucursalFiltro, ejecutar, registrarMovimiento, guardarProducto, actualizarMinimo, cambiarUsuario, cambiarSucursalFiltro, iniciarSesion, cerrarSesion, reiniciarDemo])

  return <AdminContext.Provider value={valor}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin debe usarse dentro de <AdminStoreProvider>')
  return ctx
}
