import { create } from "zustand";
import { mockTasks, type Task } from "../../mocks/boardMock";

export type CreateTaskData = Omit<Task, "id">;

export type UpdateTaskData = Partial<Omit<Task, "id" | "projectId">>;

type TasksStore = {
  tasks: Task[];
  addTask: (taskData: CreateTaskData) => void;
  updateTask: (taskId: number, taskData: UpdateTaskData) => void;
  deleteTask: (taskId: number) => void;
  moveTask: (taskId: number, newColumnId: number) => void;
};

const getNextTaskId = (tasks: Task[]) => {
  if (!tasks.length) {
    return 1;
  }

  return Math.max(...tasks.map((task) => task.id)) + 1;
};

export const useTasksStore = create<TasksStore>((set) => ({
  tasks: mockTasks,

  addTask: (taskData) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          id: getNextTaskId(state.tasks),
          ...taskData,
        },
      ],
    })),

  updateTask: (taskId, taskData) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...taskData,
            }
          : task
      ),
    })),

  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    })),

  moveTask: (taskId, newColumnId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              columnId: newColumnId,
            }
          : task
      ),
    })),
}));