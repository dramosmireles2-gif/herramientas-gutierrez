import { getBranches } from '../services/branches'
import { useAsync } from './useAsync'

// Sucursal a la que van los mensajes de WhatsApp.
// Por ahora es la primera; en el paso 4 se reemplaza por la sucursal elegida en BranchContext.
export function useContactBranch() {
  const { data } = useAsync(getBranches, [])
  return data?.[0] ?? null
}
