import type { BoardColumn } from '../../constants/board'
import type { Task } from '../../types/task'

export { default } from './BoardColumn'

export interface BoardColumnProps {
  column: BoardColumn
  tasks: Task[]
}
