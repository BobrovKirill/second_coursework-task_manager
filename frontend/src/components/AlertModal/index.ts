import { createContext, useContext, type ReactNode } from 'react'

export type AlertType = 'error' | 'warning' | 'info' | 'success'

export interface AlertOptions {
  title?: string
  message: string
  type?: AlertType
  duration?: number
}

export interface AlertModalContextValue {
  showAlertModal: (options: AlertOptions | string) => void
}

export interface AlertModalProviderProps {
  children: ReactNode
}

export const DEFAULT_DURATION = 2000

export const AlertModalContext = createContext<AlertModalContextValue | null>(null)

export function useAlertModal(): AlertModalContextValue {
  const ctx = useContext(AlertModalContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return ctx
}

export { default } from './AlertModal'
