import type { EmployeeType } from '../../types/user.ts'

export const EMPLOYEE_TYPE_LABELS: Record<EmployeeType, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  design: 'Дизайн',
  qa: 'QA',
  devops: 'DevOps',
  manager: 'Менеджер',
}
