import type { Task } from '../../types/task'

export { default } from './TaskCard'

export const PRIORITY_MAP: Record<number, string> = {
  1: 'Минимальный',
  2: 'Низкий',
  3: 'Средний',
  4: 'Высокий',
  5: 'Критический',
}

export const TASK_TYPE_LABELS: Record<string, string> = {
  frontend: 'Фронтенд',
  backend: 'Бэкенд',
  design: 'Дизайн',
  research: 'Исследование',
}

export interface TaskCardProps {
  task: Task
}
