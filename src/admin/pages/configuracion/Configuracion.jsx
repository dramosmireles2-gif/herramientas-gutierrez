import PaginaEsqueleto from '../../components/PaginaEsqueleto'
import SoloAdmin from '../../components/SoloAdmin'

export default function Configuracion() {
  return (
    <SoloAdmin titulo="Configuración">
      <PaginaEsqueleto
        titulo="Configuración"
        descripcion="Datos de la tienda, envíos y pagos."
        fase={4}
        contenido={[
          'Datos de la tienda',
          'Tarifas de envío por zona y peso, editables',
          'Pasarela de pago: Openpay (se conecta en la versión final)',
        ]}
      />
    </SoloAdmin>
  )
}
