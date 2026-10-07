// Cotización de envío con la tabla de tarifas de Configuración (zona × rango de peso).

/**
 * @returns {{ tipo: 'gratis'|'tarifa'|'cotizar', monto?: number, rango?: number }}
 *  'cotizar' = pesa más que el último rango: se cotiza aparte con la paquetería.
 */
export function cotizarEnvio(envios, { zona, pesoKg, subtotal = 0 }) {
  if (subtotal >= envios.gratis_desde) return { tipo: 'gratis', monto: 0 }
  const rango = envios.rangos.findIndex((r) => pesoKg <= r.hasta_kg)
  if (rango === -1) return { tipo: 'cotizar' }
  return { tipo: 'tarifa', monto: envios.tarifas[zona]?.[rango] ?? 0, rango }
}

/** "Hasta 5 kg", "5 a 20 kg"… */
export const etiquetaRango = (rangos, i) => (i === 0 ? `Hasta ${rangos[0].hasta_kg} kg` : `${rangos[i - 1].hasta_kg} a ${rangos[i].hasta_kg} kg`)
