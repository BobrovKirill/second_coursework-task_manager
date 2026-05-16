import type { BoardColumn as ProjectBoardColumn } from '../types/boardColumn'
import type { TaskStatus } from '../types/task'

export interface BoardColumn {
  id: number | string
  status: TaskStatus
  title: string
  position: number
}

const DEFAULT_TASK_STATUSES = ['todo', 'in_progress', 'done'] as const

export const BOARD_COLUMNS: BoardColumn[] = [
  { id: 'todo', status: 'todo', title: 'Сделать', position: 1 },
  { id: 'in_progress', status: 'in_progress', title: 'Делается', position: 2 },
  { id: 'done', status: 'done', title: 'Сделано', position: 3 },
]

function getColumnStatus(column: ProjectBoardColumn, index: number): TaskStatus {
  return DEFAULT_TASK_STATUSES[index] ?? `column_${column.id}`
}

function getSortedColumns(columns: ProjectBoardColumn[]): ProjectBoardColumn[] {
  const sortedColumns: ProjectBoardColumn[] = []

  columns.forEach((column) => {
    const index = sortedColumns.findIndex(
      currentColumn => currentColumn.position > column.position,
    )

    if (index === -1) {
      sortedColumns.push(column)
      return
    }

    sortedColumns.splice(index, 0, column)
  })

  return sortedColumns
}

export function getTaskColumns(columns: ProjectBoardColumn[]): BoardColumn[] {
  if (columns.length === 0) {
    return BOARD_COLUMNS
  }

  return getSortedColumns(columns).map((column, index) => ({
    id: column.id,
    status: getColumnStatus(column, index),
    title: column.title,
    position: column.position,
  }))
}
