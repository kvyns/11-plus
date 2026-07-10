import { createContext, useContext } from 'react'

export const AppContext = createContext()

export function useAppStore() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppStore must be used within AppProvider')
  }
  return context
}
