import PaginaEsqueleto from '../../components/PaginaEsqueleto'

export default function Movimientos() {
  return (
    <PaginaEsqueleto
      titulo="Movimientos"
      descripcion="Quién movió qué, cuándo y por qué: el historial completo del inventario."
      fase={2}
      contenido={[
        'Fecha, producto, sucursal, tipo, cantidad, existencia antes → después, motivo y usuario',
        'Filtros por fechas, sucursal, producto, tipo y usuario',
        'Exportar a Excel el resultado filtrado',
      ]}
    />
  )
}
