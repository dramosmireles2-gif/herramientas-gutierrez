import PaginaEsqueleto from '../../components/PaginaEsqueleto'
import SoloAdmin from '../../components/SoloAdmin'

export default function Usuarios() {
  return (
    <SoloAdmin titulo="Usuarios">
      <PaginaEsqueleto
        titulo="Usuarios"
        descripcion="Quién entra al panel y qué puede hacer."
        fase={4}
        contenido={[
          'Lista de usuarios con rol y sucursal asignada',
          'Crear y editar usuarios (administrador o encargado de sucursal)',
        ]}
      />
    </SoloAdmin>
  )
}
