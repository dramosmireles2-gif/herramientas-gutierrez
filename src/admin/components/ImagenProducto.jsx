import { useState } from 'react'
import { CategoryIcon } from '../../components/icons'
import { iconoCategoria, urlImagen, urlMiniatura } from '../utils/imagenes'

/** Foto de producto con placeholder (ícono de la categoría) si no hay foto o falla. */
export default function ImagenProducto({ producto, src = producto?.imagenes?.[0], miniatura = true, className = '' }) {
  const [fallo, setFallo] = useState(false)
  const url = miniatura ? urlMiniatura(src) : urlImagen(src)

  if (!url || fallo) {
    return (
      <span className={`flex aspect-square items-center justify-center rounded-lg bg-fondo text-gris ${className}`} role="img" aria-label={`${producto?.nombre ?? 'Producto'} (sin foto)`}>
        <CategoryIcon name={iconoCategoria(producto?.categoria_id)} width="45%" height="45%" strokeWidth={1.5} />
      </span>
    )
  }
  return (
    <img
      src={url}
      alt={producto?.nombre ?? ''}
      width={400}
      height={400}
      loading="lazy"
      decoding="async"
      onError={() => setFallo(true)}
      className={`aspect-square rounded-lg bg-blanco object-contain ring-1 ring-titanio/10 ${className}`}
    />
  )
}
