// localStorage puede no existir o lanzar error (modo privado, datos bloqueados): la app sigue sin él.
export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    if (value == null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // sin persistencia; el estado en memoria sigue funcionando
  }
}
