// Entrada del panel administrativo (demo). Se monta en la ruta /admin de la tienda y
// se carga aparte (lazy), así que no agrega peso a la tienda.
// Ruteo: la tienda usa HashRouter → /#/admin/productos; recargar nunca da 404 en GitHub Pages.
import { Link, Route, Routes } from 'react-router-dom'
import { AdminStoreProvider } from './store/AdminStore'
import AdminLayout from './layout/AdminLayout'
import Encabezado from './components/Encabezado'
import Login from './pages/login/Login'
import Dashboard from './pages/dashboard/Dashboard'
import Productos from './pages/productos/Productos'
import Inventario from './pages/inventario/Inventario'
import Movimientos from './pages/movimientos/Movimientos'
import Traspasos from './pages/traspasos/Traspasos'
import Pedidos from './pages/pedidos/Pedidos'
import ImportarExportar from './pages/importar-exportar/ImportarExportar'
import Sucursales from './pages/sucursales/Sucursales'
import Usuarios from './pages/usuarios/Usuarios'
import Configuracion from './pages/configuracion/Configuracion'
import './styles/admin.css'

function NoEncontrada() {
  return (
    <>
      <Encabezado titulo="Pantalla no encontrada" descripcion="Esta sección del panel no existe." />
      <Link to="/admin" className="btn-primary">Ir al dashboard</Link>
    </>
  )
}

export default function AdminApp() {
  return (
    <AdminStoreProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<Productos />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="movimientos" element={<Movimientos />} />
          <Route path="traspasos" element={<Traspasos />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="importar-exportar" element={<ImportarExportar />} />
          <Route path="sucursales" element={<Sucursales />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="*" element={<NoEncontrada />} />
        </Route>
      </Routes>
    </AdminStoreProvider>
  )
}
