import {
  IconoConfiguracion, IconoDashboard, IconoExcel, IconoInventario, IconoMovimientos,
  IconoPedidos, IconoProductos, IconoSucursales, IconoTraspasos, IconoUsuarios,
} from '../components/iconos'

// Menú del panel. soloAdmin: el encargado de sucursal no lo ve ni puede entrar.
// Rutas relativas a /admin (HashRouter: /#/admin/productos).
export const NAVEGACION = [
  { ruta: '', etiqueta: 'Dashboard', Icono: IconoDashboard },
  { ruta: 'productos', etiqueta: 'Productos', Icono: IconoProductos },
  { ruta: 'inventario', etiqueta: 'Inventario', Icono: IconoInventario },
  { ruta: 'movimientos', etiqueta: 'Movimientos', Icono: IconoMovimientos },
  { ruta: 'traspasos', etiqueta: 'Traspasos', Icono: IconoTraspasos },
  { ruta: 'pedidos', etiqueta: 'Pedidos', Icono: IconoPedidos },
  { ruta: 'importar-exportar', etiqueta: 'Importar / Exportar', Icono: IconoExcel, soloAdmin: true },
  { ruta: 'sucursales', etiqueta: 'Sucursales', Icono: IconoSucursales },
  { ruta: 'usuarios', etiqueta: 'Usuarios', Icono: IconoUsuarios, soloAdmin: true },
  { ruta: 'configuracion', etiqueta: 'Configuración', Icono: IconoConfiguracion, soloAdmin: true },
]

export const navegacionPara = (esAdmin) => NAVEGACION.filter((n) => esAdmin || !n.soloAdmin)
