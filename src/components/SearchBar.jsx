import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SearchIcon } from './icons'

export default function SearchBar({ id = 'buscar', className = '' }) {
  const [params] = useSearchParams()
  const urlQuery = params.get('q') ?? ''
  const [q, setQ] = useState(urlQuery)
  const navigate = useNavigate()

  // Mantiene el texto sincronizado con la búsqueda activa del catálogo.
  useEffect(() => setQ(urlQuery), [urlQuery])

  const onSubmit = (e) => {
    e.preventDefault()
    const term = q.trim()
    navigate(term ? `/catalogo?q=${encodeURIComponent(term)}` : '/catalogo')
  }

  return (
    <form role="search" onSubmit={onSubmit} className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">Buscar productos</label>
      <input
        id={id}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Busca generadores, compresores…"
        className="h-11 w-full rounded-lg border border-transparent bg-blanco pl-4 pr-12 text-base text-texto placeholder:text-gris"
      />
      <button
        type="submit"
        className="absolute right-1 top-1 flex h-9 w-10 items-center justify-center rounded-md bg-hielo text-cta-ink hover:bg-hielo-hover"
        aria-label="Buscar"
      >
        <SearchIcon width={20} height={20} />
      </button>
    </form>
  )
}
