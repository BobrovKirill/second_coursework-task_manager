export { default } from "./TaskCard";

import type { BoardColumn, Member, Task } from '../../mocks/boardMock';

export const PRIORITY_MAP: Record<number, string> = {
  1: "Минимальный",
  2: "Низкий",
  3: "Средний",
  4: "Высокий",
  5: "Критический",
};

export type TaskCardProps = {
  task: Task;
  members: Member[];
  columns: BoardColumn[];
  onChangeTaskColumn: (taskId: number, newColumnId: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
};