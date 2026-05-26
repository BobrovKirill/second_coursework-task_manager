export interface TaskControlPanelProps {
  statusLabel: string
  taskTypeLabel: string
  priorityLabel: string
  deadlineLabel: string
  assigneeName: string
  canEdit: boolean
  onEditTask: () => void
  onBackToBoard: () => void
}

export { default } from './TaskControlPanel'
