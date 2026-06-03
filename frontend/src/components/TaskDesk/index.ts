import type { ReactNode } from 'react'

export interface TaskDeskProps {
  title: string
  description: string | null
  error: string | null
  canDelete: boolean
  onDeleteTask: () => void
  extraContent?: ReactNode
}

export { default } from './TaskDesk'
