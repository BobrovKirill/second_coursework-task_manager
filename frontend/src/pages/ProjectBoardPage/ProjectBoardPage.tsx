import { useMemo, useState, useCallback, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import BoardColumn from "../../components/BoardColumn";
import TaskForm, { type TaskFormValues } from "../../components/TaskForm";
import { mockColumns, mockMembers, type Task } from "../../mocks/boardMock";
import { useTasksStore } from "../../store/tasks";

const ProjectBoardPage = () => {
  const { id, projectId } = useParams();
  const navigate = useNavigate();
  const currentProjectId = Number(projectId ?? id ?? 1);

  const handleGoToCreateTask = () => {
    navigate(`/projects/${currentProjectId}/tasks/create`);
  };

  const tasks = useTasksStore((state) => state.tasks);
  const updateTask = useTasksStore((state) => state.updateTask);
  const deleteTask = useTasksStore((state) => state.deleteTask);
  const moveTask = useTasksStore((state) => state.moveTask);

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const [form, setForm] = useState<TaskFormValues>({
    title: "",
    description: "",
    columnId: String(mockColumns[0]?.id ?? 101),
    type: 'frontend',
    priorityId: "3",
    deadline: "",
    assigneeId: "",
  });

  const sortedColumns = useMemo(
    () => [...mockColumns].sort((a, b) => a.position - b.position),
    []
  );

  const resetForm = useCallback(() => {
    setForm({
      title: "",
      description: "",
      columnId: String(sortedColumns[0]?.id ?? 101),
      type: 'frontend',
      priorityId: "3",
      deadline: "",
      assigneeId: "",
    });

    setEditingTaskId(null);
  }, [sortedColumns]);

  const handleFormChange = useCallback(
    (field: keyof TaskFormValues, value: string) => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleChangeTaskColumn = useCallback(
    (taskId: number, newColumnId: number) => {
      moveTask(taskId, newColumnId);
    },
    [moveTask]
  );

  const handleStartEdit = useCallback((task: Task) => {
    setEditingTaskId(task.id);

    setForm({
      title: task.title,
      description: task.description,
      columnId: String(task.columnId),
      type: task.type,
      priorityId: String(task.priorityId),
      deadline: task.deadline ?? "",
      assigneeId: task.assigneeIds[0] ? String(task.assigneeIds[0]) : "",
    });
  }, []);

  const handleDeleteTask = useCallback((taskId: number) => {
    deleteTask(taskId);

    if (editingTaskId === taskId) {
      resetForm();
    }
  }, [deleteTask, editingTaskId, resetForm]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (editingTaskId === null) {
        return;
      }

      const title = form.title.trim();
      if (!title) return;

      updateTask(editingTaskId, {
        columnId: Number(form.columnId),
        type: form.type as Task['type'],
        title,
        description: form.description.trim(),
        priorityId: Number(form.priorityId),
        deadline: form.deadline || null,
        assigneeIds: form.assigneeId ? [Number(form.assigneeId)] : [],
      });

      resetForm();
    };  

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Доска проекта
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        MVP-версия
      </Typography>

      {editingTaskId !== null ? (
        <Box sx={{ mb: 3 }}>
          <TaskForm
            title="Редактировать задачу"
            values={form}
            columns={sortedColumns}
            members={mockMembers}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            submitLabel="Сохранить изменения"
            onCancel={resetForm}
            cancelLabel="Отмена"
          />
        </Box>
      ) : (
        <Paper
          sx={{ p: 2, mb: 2, borderRadius: 2, border: "1px solid #e0e0e0" }}
          elevation={0}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6">
                Задачи проекта
              </Typography>

            </Box>

            <Button variant="contained" onClick={handleGoToCreateTask}>
              Создать задачу
            </Button>
          </Stack>
        </Paper>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.5,
          alignItems: "stretch",
        }}
      >
        {sortedColumns.map((column) => {
          const columnTasks = tasks.filter(
            (task) => task.projectId === currentProjectId && task.columnId === column.id
          );

          return (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
              members={mockMembers}
              columns={sortedColumns}
              onChangeTaskColumn={handleChangeTaskColumn}
              onEditTask={handleStartEdit}
              onDeleteTask={handleDeleteTask}
            />
          );
        })}
      </Box>
    </Container>
  );
};

export default ProjectBoardPage;