import { useMemo, useState, type FormEvent } from "react";
import { Container } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { mockColumns, mockMembers } from "../../mocks/boardMock";
import { useTasksStore } from "../../store/tasks";
import type { Task } from '../../mocks/boardMock';
import TaskForm, { type TaskFormValues } from "../../components/TaskForm";

const CreateTaskPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const currentProjectId = Number(projectId ?? "1");
  const addTask = useTasksStore((state) => state.addTask);

  const sortedColumns = useMemo(
    () => [...mockColumns].sort((a, b) => a.position - b.position),
    []
  );

  const [form, setForm] = useState<TaskFormValues>({
    title: "",
    description: "",
    columnId: String(sortedColumns[0]?.id ?? 101),
    type: 'frontend',
    priorityId: "3",
    deadline: "",
    assigneeId: "",
  });

  const handleBackToBoard = () => {
    navigate(`/projects/${currentProjectId}/board`);
  };

  const handleFormChange = (field: keyof TaskFormValues, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = form.title.trim();
    if (!title) return;

    addTask({
      projectId: currentProjectId,
      columnId: Number(form.columnId),
      type: form.type as Task['type'],
      title,
      description: form.description.trim(),
      priorityId: Number(form.priorityId),
      deadline: form.deadline || null,
      assigneeIds: form.assigneeId ? [Number(form.assigneeId)] : [],
    });

    navigate(`/projects/${currentProjectId}/board`);
  };

  return (
    <Container
      maxWidth="md"
      sx={{
          py: 3,
          minHeight: "calc(100vh - 120px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
      }}
    >
      <TaskForm
        title="Создать задачу"
        description="Заполните поля и сохраните новую задачу."
        values={form}
        columns={sortedColumns}
        members={mockMembers}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        submitLabel="Создать задачу"
        onCancel={handleBackToBoard}
        cancelLabel="Отмена"
      />
    </Container>
  );
};

export default CreateTaskPage;