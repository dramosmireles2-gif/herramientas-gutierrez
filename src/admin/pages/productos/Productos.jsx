import PaginaEsqueleto from '../../components/PaginaEsqueleto'

export default function Productos() {
  return (
    <PaginaEsqueleto
      titulo="Productos"
      descripcion="Catálogo con precios, fotos, medidas y existencias por sucursal."
      fase={2}
      contenido={[
        'Tabla con buscador (nombre, SKU, marca) y filtros por categoría, sucursal, tipo y estado',
        'Ficha para crear y editar: datos, precios, fotos, peso y medidas',
        'Existencias por sucursal con botón "Ajustar" e historial del producto',
      ]}
    />
  )
}
