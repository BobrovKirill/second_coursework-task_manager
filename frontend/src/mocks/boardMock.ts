export type Member = {
  id: number;
  name: string;
  email: string;
};

export type BoardColumn = {
  id: number;
  projectId: number;
  title: string;
  position: number;
};

export type Task = {
  id: number;
  projectId: number;
  columnId: number;
  type: TaskType;
  title: string;
  description: string;
  priorityId: number;
  deadline: string | null;
  assigneeIds: number[];
};

export const mockMembers: Member[] = [
  { id: 1, name: "Григорий", email: "gr@example.com" },
  { id: 2, name: "Дмитрий", email: "dm@example.com" },
  { id: 3, name: "Валерий", email: "val@example.com" },
];

export const mockColumns: BoardColumn[] = [
  { id: 101, projectId: 1, title: "Backlog", position: 1 },
  { id: 102, projectId: 1, title: "To Do", position: 2 },
  { id: 103, projectId: 1, title: "In Progress", position: 3 },
  { id: 104, projectId: 1, title: "Done", position: 4 },
];

export type TaskType = 'frontend' | 'backend' | 'design' | 'research';

export const TASK_TYPE_OPTIONS = [
  { value: 'frontend', label: 'Фронтенд' },
  { value: 'backend', label: 'Бэкенд' },
  { value: 'design', label: 'Дизайн' },
  { value: 'research', label: 'Исследование' },
] as const;

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  frontend: 'Фронтенд',
  backend: 'Бэкенд',
  design: 'Дизайн',
  research: 'Исследование',
};

export const mockTasks: Task[] = [
  {
    id: 1001,
    projectId: 1,
    columnId: 101,
    type: 'frontend',
    title: "Сделать каркас доски",
    description: "Создать страницу и вывести колонки",
    priorityId: 2,
    deadline: "2026-03-01",
    assigneeIds: [1],
  },
  {
    id: 1002,
    projectId: 1,
    columnId: 102,
    type: 'frontend',
    title: "Добавить создание задачи",
    description: "Форма + локальный state",
    priorityId: 3,
    deadline: "2026-03-03",
    assigneeIds: [1, 2],
  },
  {
    id: 1003,
    projectId: 1,
    columnId: 103,
    type: 'backend',
    title: "Подготовить API-контракт",
    description: "Список эндпоинтов для бэка",
    priorityId: 1,
    deadline: "2026-03-02",
    assigneeIds: [3],
  },
];