export interface TaskDeskProps {
  title: string
  description: string | null
  error: string | null
  canDelete: boolean
  onDeleteTask: () => void
}

export { default } from './TaskDesk'