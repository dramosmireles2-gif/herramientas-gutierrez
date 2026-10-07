import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { readJSON, writeJSON } from '../../lib/storage'
import { datosIniciales } from './datosIniciales'
import { ErrorMovimiento, aplicarMovimientos } from './movimientos'

// Cambiar la versión invalida lo guardado en navegadores que ya abrieron el demo.
// v2: se agregó la tabla de configuración (fase 4).
const CLAVE = 'hg-admin-demo-v2'
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const TABLAS_PROTEGIDAS = ['inventario', 'movimientos'] // solo cambian con registrarMovimiento

const sesionInicial = { usuario_id: 'u-admin', sucursal_filtro: 'todas', autenticado: false }

function cargar() {
  const guardado = readJSON(CLAVE, null)
  if (guardado?.datos?.productos && guardado?.datos?.configuracion && guardado?.sesion) return guardado
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
  // El encargado siempre ve solo su sucursal. Si el filtro apunta a una sucursal desactivada, se ven todas.
  const filtroActivo = estado.datos.sucursales.some((s) => s.id === estado.sesion.sucursal_filtro && s.activa)
  const sucursalFiltro = esAdmin ? (filtroActivo ? estado.sesion.sucursal_filtro : 'todas') : usuario.sucursal_id

  // Operaciones de catálogo y configuración: solo el administrador.
  const esAdminActual = () => {
    const { datos, sesion } = actual.current
    return datos.usuarios.find((u) => u.id === sesion.usuario_id)?.rol === 'admin'
  }
  const NO_ADMIN = { ok: false, error: 'Solo el administrador puede hacer este cambio.' }

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

  /** Edita una sucursal o el proveedor (dirección, horario, recoger, días de entrega, activa). */
  const guardarSucursal = useCallback((sucursal) => {
    if (!esAdminActual()) return NO_ADMIN
    const { datos } = actual.current
    const existente = datos.sucursales.find((s) => s.id === sucursal.id)
    if (!existente) return { ok: false, error: 'La sucursal no existe.' }
    if (!sucursal.nombre?.trim()) return { ok: false, error: 'Escribe el nombre.' }
    const esProveedor = existente.tipo === 'proveedor'
    const dias = Number(sucursal.dias_entrega)
    if (esProveedor && !(Number.isInteger(dias) && dias >= 1 && dias <= 60)) return { ok: false, error: 'Los días de entrega deben ser un número entero entre 1 y 60.' }
    if (!sucursal.activa && existente.tipo === 'sucursal' && datos.sucursales.filter((s) => s.tipo === 'sucursal' && s.activa).length === 1) {
      return { ok: false, error: 'Debe quedar al menos una sucursal activa.' }
    }
    const guardada = {
      ...existente,
      nombre: sucursal.nombre.trim(),
      direccion: sucursal.direccion?.trim() ?? '',
      telefono: sucursal.telefono?.trim() ?? '',
      horario: sucursal.horario?.trim() ?? '',
      permite_recoger: esProveedor ? false : Boolean(sucursal.permite_recoger),
      dias_entrega: esProveedor ? dias : null,
      activa: Boolean(sucursal.activa),
    }
    cambiar({ ...actual.current, datos: { ...datos, sucursales: datos.sucursales.map((s) => (s.id === guardada.id ? guardada : s)) } })
    return { ok: true, sucursal: guardada }
  }, [cambiar])

  /** Crea o edita un usuario (en el demo no se envía invitación). */
  const guardarUsuario = useCallback((u) => {
    if (!esAdminActual()) return NO_ADMIN
    const { datos, sesion } = actual.current
    const nombre = u.nombre?.trim() ?? ''
    const correo = u.correo?.trim().toLowerCase() ?? ''
    if (nombre.length < 3) return { ok: false, error: 'Escribe el nombre completo.' }
    if (!CORREO.test(correo)) return { ok: false, error: 'Escribe un correo válido.' }
    if (datos.usuarios.some((x) => x.id !== u.id && x.correo.toLowerCase() === correo)) return { ok: false, error: 'Ya hay un usuario con ese correo.' }
    if (!['admin', 'encargado'].includes(u.rol)) return { ok: false, error: 'Elige el rol.' }
    if (u.rol === 'encargado' && !datos.sucursales.some((s) => s.id === u.sucursal_id && s.tipo === 'sucursal')) return { ok: false, error: 'Elige la sucursal del encargado.' }
    const existente = datos.usuarios.find((x) => x.id === u.id)
    if (existente?.rol === 'admin' && u.rol !== 'admin') {
      if (existente.id === sesion.usuario_id) return { ok: false, error: 'No puedes quitarte el rol de administrador a ti mismo.' }
      if (datos.usuarios.filter((x) => x.rol === 'admin').length === 1) return { ok: false, error: 'Debe quedar al menos un administrador.' }
    }
    const guardado = { id: existente?.id ?? `u-${Date.now().toString(36)}`, nombre, correo, rol: u.rol, sucursal_id: u.rol === 'encargado' ? u.sucursal_id : null }
    const usuarios = existente ? datos.usuarios.map((x) => (x.id === guardado.id ? guardado : x)) : [...datos.usuarios, guardado]
    cambiar({ ...actual.current, datos: { ...datos, usuarios } })
    return { ok: true, usuario: guardado }
  }, [cambiar])

  const eliminarUsuario = useCallback((usuarioId) => {
    if (!esAdminActual()) return NO_ADMIN
    const { datos, sesion } = actual.current
    const u = datos.usuarios.find((x) => x.id === usuarioId)
    if (!u) return { ok: false, error: 'El usuario no existe.' }
    if (u.id === sesion.usuario_id) return { ok: false, error: 'No puedes eliminar tu propio usuario.' }
    if (u.rol === 'admin' && datos.usuarios.filter((x) => x.rol === 'admin').length === 1) return { ok: false, error: 'Debe quedar al menos un administrador.' }
    // El historial guarda el nombre, así que sus movimientos siguen visibles.
    cambiar({ ...actual.current, datos: { ...datos, usuarios: datos.usuarios.filter((x) => x.id !== usuarioId) } })
    return { ok: true }
  }, [cambiar])

  /** Guarda una parte de la configuración: { tienda } o { envios }. */
  const guardarConfiguracion = useCallback((parcial) => {
    if (!esAdminActual()) return NO_ADMIN
    const { datos } = actual.current
    if (parcial.envios) {
      const { gratis_desde, tarifas } = parcial.envios
      const valores = Object.values(tarifas ?? {}).flat()
      if (!Number.isInteger(gratis_desde) || gratis_desde < 0) return { ok: false, error: 'El monto de envío gratis no es válido.' }
      if (valores.some((v) => !Number.isInteger(v) || v < 0)) return { ok: false, error: 'Revisa las tarifas: deben ser montos de 0 o más.' }
    }
    if (parcial.tienda && !parcial.tienda.nombre?.trim()) return { ok: false, error: 'Escribe el nombre de la tienda.' }
    const configuracion = {
      ...datos.configuracion,
      ...(parcial.tienda ? { tienda: { ...datos.configuracion.tienda, ...parcial.tienda } } : {}),
      ...(parcial.envios ? { envios: { ...datos.configuracion.envios, ...parcial.envios } } : {}),
    }
    cambiar({ ...actual.current, datos: { ...datos, configuracion } })
    return { ok: true }
  }, [cambiar])

  /**
   * Aplica una importación de Excel ya validada (utils/importacion.js): crea o actualiza productos y
   * registra un ajuste por cada existencia que cambia. Todo o nada.
   * @param {object[]} resultados filas válidas de validarImportacion
   * @param {string} archivo nombre del archivo (va como referencia del ajuste)
   */
  const importarProductos = useCallback((resultados, archivo) => {
    if (!esAdminActual()) return NO_ADMIN
    const { datos, sesion } = actual.current
    const quien = datos.usuarios.find((u) => u.id === sesion.usuario_id)
    const ahora = new Date().toISOString()
    const productos = [...datos.productos]
    const inventario = [...datos.inventario]
    const ajustes = []
    let creados = 0
    let actualizados = 0

    resultados.forEach((r, i) => {
      let producto
      if (r.producto) {
        const idx = productos.findIndex((p) => p.id === r.producto.id)
        producto = { ...productos[idx], ...r.cambios, actualizado_en: ahora }
        productos[idx] = producto
        actualizados++
      } else {
        producto = {
          id: `p-i${Date.now().toString(36)}${i}`,
          sku: r.sku,
          descripcion: '',
          precio_oferta: null,
          imagenes: [],
          activo: true,
          ...r.cambios,
          creado_en: ahora,
          actualizado_en: ahora,
        }
        productos.push(producto)
        // Filas de inventario en 0 (igual que al crear desde la ficha; no es un cambio de cantidad).
        datos.sucursales
          .filter((s) => (producto.tipo === 'sobre_pedido' ? s.tipo === 'proveedor' : s.tipo === 'sucursal'))
          .forEach((s) => inventario.push({ producto_id: producto.id, sucursal_id: s.id, cantidad: 0, minimo: 0 }))
        creados++
      }
      for (const [sucursal_id, n] of Object.entries(r.existencias)) {
        const antes = inventario.find((f) => f.producto_id === producto.id && f.sucursal_id === sucursal_id)?.cantidad ?? 0
        if (n !== antes) ajustes.push({ producto_id: producto.id, sucursal_id, tipo: 'ajuste', cantidad: n - antes, motivo: 'Importación de Excel', referencia: archivo })
      }
    })

    try {
      const r = aplicarMovimientos({ ...datos, productos, inventario }, ajustes, { usuario: quien })
      cambiar({ ...actual.current, datos: r.estado })
      return { ok: true, creados, actualizados, ajustes: ajustes.length }
    } catch (e) {
      if (e instanceof ErrorMovimiento) return { ok: false, error: e.message }
      throw e
    }
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
    guardarSucursal,
    guardarUsuario,
    eliminarUsuario,
    guardarConfiguracion,
    importarProductos,
    cambiarUsuario,
    cambiarSucursalFiltro,
    iniciarSesion,
    cerrarSesion,
    reiniciarDemo,
  }), [estado.datos, estado.sesion.autenticado, usuario, esAdmin, sucursalFiltro, ejecutar, registrarMovimiento, guardarProducto, actualizarMinimo, guardarSucursal, guardarUsuario, eliminarUsuario, guardarConfiguracion, importarProductos, cambiarUsuario, cambiarSucursalFiltro, iniciarSesion, cerrarSesion, reiniciarDemo])

  return <AdminContext.Provider value={valor}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin debe usarse dentro de <AdminStoreProvider>')
  return ctx
}
