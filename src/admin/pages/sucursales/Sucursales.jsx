import PaginaEsqueleto from '../../components/PaginaEsqueleto'

export default function Sucursales() {
  return (
    <PaginaEsqueleto
      titulo="Sucursales"
      descripcion="Las 5 sucursales y el proveedor de Monterrey."
      fase={4}
      contenido={[
        'Ficha de cada ubicación: dirección, teléfono y horario',
        'Si permite recoger en tienda y días de entrega del proveedor',
        'Activar o desactivar ubicaciones',
      ]}
    />
  )
}
