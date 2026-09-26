import { useState } from 'react'
import { TagIcon } from './icons'

/** Imagen cuadrada con fondo blanco; si falta o falla, placeholder neutro color fondo. */
export default function ProductImage({ src, alt, eager = false, className = '' }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={`flex aspect-square items-center justify-center bg-fondo text-gris ${className}`} role="img" aria-label={alt}>
        <TagIcon width={40} height={40} />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      width={800}
      height={800}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`aspect-square w-full bg-blanco object-contain ${className}`}
    />
  )
}
