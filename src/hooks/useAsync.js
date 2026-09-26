import { useEffect, useState } from 'react'

/** Ejecuta una función async de los servicios y guarda el resultado. deps igual que useEffect. */
export function useAsync(fn, deps) {
  const [state, setState] = useState({ data: undefined, loading: true })

  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true }))
    fn().then((data) => {
      if (alive) setState({ data, loading: false })
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
