import { TASK_TYPE_OPTIONS } from '../../mocks/boardMock';
import { type FormEvent } from "react";
import {
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import styles from "./style.module.css";

export type TaskFormValues = {
  title: string;
  description: string;
  columnId: string;
  type: string;
  priorityId: string;
  deadline: string;
  assigneeId: string;
};

type TaskFormProps = {
  title: string;
  description?: string;
  values: TaskFormValues;
  columns: Array<{
    id: number;
    title: string;
  }>;
  members: Array<{
    id: number;
    name: string;
  }>;
  onChange: (field: keyof TaskFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  onCancel?: () => void;
  cancelLabel?: string;
};

const priorityOptions = [
  { value: "1", label: "Минимальный" },
  { value: "2", label: "Низкий" },
  { value: "3", label: "Средний" },
  { value: "4", label: "Высокий" },
  { value: "5", label: "Критический" },
];

const TaskForm = ({
  title,
  description,
  values,
  columns,
  members,
  onChange,
  onSubmit,
  submitLabel,
  onCancel,
  cancelLabel = "Отмена",
}: TaskFormProps) => {
  return (
    <Paper className={styles.root} elevation={0}>
      <Stack component="form" spacing={2} onSubmit={onSubmit}>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>

        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}

        <TextField
          label="Название"
          size="small"
          value={values.title}
          onChange={(e) => onChange("title", e.target.value)}
          required
        />

        <TextField
          className={styles.descriptionField}
          label="Описание"
          size="small"
          multiline
          minRows={2}
          maxRows={8}
          value={values.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Подробно опишите задачу"
        />

        <div className={styles.fieldsGrid}>
          <TextField
            select
            label="Статус"
            size="small"
            value={values.columnId}
            onChange={(e) => onChange("columnId", e.target.value)}
            className={styles.compactField}
            fullWidth
          >
            {columns.map((column) => (
              <MenuItem key={column.id} value={String(column.id)}>
                {column.title}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Тип"
            size="small"
            value={values.type}
            onChange={(e) => onChange("type", e.target.value)}
            className={styles.compactField}
            fullWidth
          >
            {TASK_TYPE_OPTIONS.map((taskType) => (
              <MenuItem key={taskType.value} value={taskType.value}>
                {taskType.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Приоритет"
            size="small"
            value={values.priorityId}
            onChange={(e) => onChange("priorityId", e.target.value)}
            className={styles.compactField}
            fullWidth
          >
            {priorityOptions.map((priority) => (
              <MenuItem key={priority.value} value={priority.value}>
                {priority.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Дедлайн"
            type="date"
            size="small"
            value={values.deadline}
            onChange={(e) => onChange("deadline", e.target.value)}
            InputLabelProps={{ shrink: true }}
            className={styles.compactField}
            fullWidth
          />

          <TextField
            select
            label="Исполнитель"
            size="small"
            value={values.assigneeId}
            onChange={(e) => onChange("assigneeId", e.target.value)}
            className={styles.compactField}
            fullWidth
          >
            <MenuItem value="">Не выбран</MenuItem>
            {members.map((member) => (
              <MenuItem key={member.id} value={String(member.id)}>
                {member.name}
              </MenuItem>
            ))}
          </TextField>
        </div>

        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained">
            {submitLabel}
          </Button>

          {onCancel && (
            <Button variant="outlined" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default TaskForm;