/** Limpia texto del usuario: sin caracteres de control ni etiquetas, espacios normalizados y largo máximo. */
export const sanitize = (s = '', max = 300) =>
  String(s ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)

export const onlyDigits = (s = '') => String(s ?? '').replace(/\D/g, '')
