import PaginaEsqueleto from '../../components/PaginaEsqueleto'

export default function Inventario() {
  return (
    <PaginaEsqueleto
      titulo="Inventario"
      descripcion="Existencias de cada producto en cada sucursal, en una sola tabla."
      fase={2}
      contenido={[
        'Matriz producto × sucursal: rojo bajo el mínimo, gris en cero',
        'Registrar entrada de mercancía con referencia de factura o proveedor',
        'Ajuste de inventario con motivo obligatorio',
        'Filtro "Solo existencia baja" para saber qué resurtir',
      ]}
    />
  )
}
