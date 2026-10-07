import PaginaEsqueleto from '../../components/PaginaEsqueleto'
import SoloAdmin from '../../components/SoloAdmin'

export default function ImportarExportar() {
  return (
    <SoloAdmin titulo="Importar / Exportar">
      <PaginaEsqueleto
        titulo="Importar / Exportar"
        descripcion="Carga y descarga tu catálogo e inventario en Excel."
        fase={4}
        contenido={[
          'Descargar plantilla de Excel con existencia por sucursal',
          'Importar con vista previa y validación fila por fila',
          'Exportar productos con existencias y movimientos filtrados',
        ]}
      />
    </SoloAdmin>
  )
}
