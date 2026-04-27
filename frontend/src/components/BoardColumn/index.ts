export { default } from './BoardColumn'

export interface BoardColumnProps {
  column: BoardColumnType
  tasks: Task[]
  members: Member[]
  columns: BoardColumnType[]
  onChangeTaskColumn: (taskId: number, newColumnId: number) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: number) => void
}
