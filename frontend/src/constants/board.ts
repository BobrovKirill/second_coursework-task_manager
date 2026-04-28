import type { TaskStatus } from '../types/task'

export interface BoardColumn {
  status: TaskStatus
  title: string
  position: number
}

export const BOARD_COLUMNS: BoardColumn[] = [
  { status: 'backlog', title: 'Backlog', position: 1 },
  { status: 'todo', title: 'To Do', position: 2 },
  { status: 'in_progress', title: 'In Progress', position: 3 },
  { status: 'done', title: 'Done', position: 4 },
]
