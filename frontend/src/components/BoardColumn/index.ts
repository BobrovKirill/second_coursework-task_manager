import type { BoardColumn } from '../../constants/board'
import type { Task } from '../../types/task'
import type { TaskCardMember } from '../TaskCard'

export interface BoardColumnProps {
  column: BoardColumn
  tasks: Task[]
  members?: TaskCardMember[]
  onTaskStatusChange: (taskId: number, status: string) => Promise<void> | void
  canMoveTask?: (task: Task) => boolean
}

export { default } from './BoardColumn'
