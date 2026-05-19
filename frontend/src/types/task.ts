export type TaskStatus = string

export type TaskType = 'frontend' | 'backend' | 'design' | 'research'

export interface Task {
  id: number
  projectId: number
  creatorId: number
  assigneeId: number | null
  title: string
  description: string | null
  status: TaskStatus
  priority: number
  taskType: TaskType | null
  deadline: string | null
  createdAt: string
  updatedAt: string
}
