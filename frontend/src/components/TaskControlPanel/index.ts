export interface TaskControlPanelProps {
  statusLabel: string
  taskTypeLabel: string
  priorityLabel: string
  deadlineLabel: string
  assigneeName: string
  onEditTask: () => void
  onBackToBoard: () => void
}

export { default } from './TaskControlPanel'