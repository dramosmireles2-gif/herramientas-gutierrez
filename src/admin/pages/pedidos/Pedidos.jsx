import PaginaEsqueleto from '../../components/PaginaEsqueleto'

export default function Pedidos() {
  return (
    <PaginaEsqueleto
      titulo="Pedidos"
      descripcion="Los pedidos de la tienda en línea, de nuevo a entregado."
      fase={3}
      contenido={[
        'Lista con filtros por estado, sucursal y método (envío / recoger)',
        'Flujo de estados: Nuevo → Preparando → Listo para recoger / Enviado → Entregado',
        'Al preparar se descuenta la existencia; al cancelar se regresa',
        'Productos sobre pedido con fecha estimada de entrega',
      ]}
    />
  )
}
