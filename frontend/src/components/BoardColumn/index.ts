import type { BoardColumn } from '../../constants/board'
import type { Task } from '../../types/task'
import type { TaskCardMember } from '../TaskCard'

export interface BoardColumnProps {
  column: BoardColumn
  tasks: Task[]
  members?: TaskCardMember[]
}

export { default } from './BoardColumn'
