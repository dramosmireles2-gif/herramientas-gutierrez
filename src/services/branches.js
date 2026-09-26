// Sucursales. Igual que catalog.js: la UI nunca importa el JSON directo.
import branchesData from '../data/branches.json'

export async function getBranches() {
  return branchesData
}

export async function getBranch(idOrSlug) {
  return branchesData.find((b) => b.id === idOrSlug || b.slug === idOrSlug) ?? null
}
