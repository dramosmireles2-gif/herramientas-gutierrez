import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getBranches } from '../services/branches'
import { readJSON, writeJSON } from '../lib/storage'

const STORAGE_KEY = 'hg-branch'
const BranchContext = createContext(null)

/** Sucursal elegida: define el WhatsApp destino y el punto de recolección. */
export function BranchProvider({ children }) {
  const [branches, setBranches] = useState([])
  const [branchId, setBranchId] = useState(() => readJSON(STORAGE_KEY, null))
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    getBranches().then((list) => {
      setBranches(list)
      // Se pide al entrar si no hay una elegida (o la guardada ya no existe).
      if (!list.some((b) => b.id === readJSON(STORAGE_KEY, null))) setPickerOpen(true)
    })
  }, [])

  const selectBranch = useCallback((id) => {
    setBranchId(id)
    writeJSON(STORAGE_KEY, id)
    setPickerOpen(false)
  }, [])

  const openPicker = useCallback(() => setPickerOpen(true), [])
  const closePicker = useCallback(() => setPickerOpen(false), [])

  const value = useMemo(() => ({
    branches,
    branch: branches.find((b) => b.id === branchId) ?? null,
    selectBranch,
    pickerOpen,
    openPicker,
    closePicker,
  }), [branches, branchId, selectBranch, pickerOpen, openPicker, closePicker])

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>
}

export function useBranch() {
  const ctx = useContext(BranchContext)
  if (!ctx) throw new Error('useBranch debe usarse dentro de <BranchProvider>')
  return ctx
}
