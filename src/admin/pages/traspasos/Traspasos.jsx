import PaginaEsqueleto from '../../components/PaginaEsqueleto'

export default function Traspasos() {
  return (
    <PaginaEsqueleto
      titulo="Traspasos"
      descripcion="Mueve mercancía entre sucursales sin perder la pista."
      fase={2}
      contenido={[
        'Crear traspaso: origen, destino y productos (valida existencia en el origen)',
        'Enviar: descuenta del origen y queda "En tránsito"',
        'Recibir: suma en el destino y queda "Recibido"',
      ]}
    />
  )
}
