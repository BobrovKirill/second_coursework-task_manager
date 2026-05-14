import type { TaskStatus } from '../types/task'

export interface BoardColumn {
  status: TaskStatus
  title: string
  position: number
}

export const BOARD_COLUMNS: BoardColumn[] = [
  { status: 'todo', title: 'Сделать', position: 1 },
  { status: 'in_progress', title: 'Делается', position: 2 },
  { status: 'done', title: 'Сделано', position: 3 },
]
