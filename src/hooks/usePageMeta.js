import { useEffect } from 'react'
import { STORE_NAME } from '../lib/config'

const DEFAULT_DESCRIPTION =
  'Generadores, hidrolavadoras, compresores, podadoras y herramienta para construcción. Compra en línea o pide por WhatsApp y recoge en cualquiera de nuestras 5 sucursales del noreste.'

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Título y descripción por página (también Open Graph). */
export function usePageMeta(title, description = DEFAULT_DESCRIPTION) {
  useEffect(() => {
    const full = title ? `${title} · ${STORE_NAME}` : `${STORE_NAME} · Todo para la obra en 5 sucursales del noreste`
    document.title = full
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', full)
    setMeta('property', 'og:description', description)
  }, [title, description])
}
