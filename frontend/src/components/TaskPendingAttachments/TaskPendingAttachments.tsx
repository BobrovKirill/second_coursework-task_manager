import type { ChangeEvent, DragEvent } from 'react'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useRef, useState } from 'react'

interface TaskPendingAttachmentsProps {
  files: File[]
  disabled?: boolean
  onAddFiles: (files: File[]) => void
  onRemoveFile: (fileIndex: number) => void
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} Б`
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} КБ`
  }

  return `${(size / 1024 / 1024).toFixed(1)} МБ`
}

function TaskPendingAttachments({
  files,
  disabled = false,
  onAddFiles,
  onRemoveFile,
}: TaskPendingAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleChooseFile = () => {
    fileInputRef.current?.click()
  }

  const handleAddFiles = (selectedFiles: File[]) => {
    if (disabled || selectedFiles.length === 0) {
      return
    }

    onAddFiles(selectedFiles)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    if (disabled) {
      return
    }

    setIsDragActive(true)
  }

  const handleDragLeave = () => {
    setIsDragActive(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragActive(false)

    const selectedFiles = [...event.dataTransfer.files]
    handleAddFiles(selectedFiles)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = [...(event.currentTarget.files ?? [])]

    if (selectedFiles.length === 0) {
      return
    }

    handleAddFiles(selectedFiles)
    event.currentTarget.value = ''
  }

  return (
    <Paper
      elevation={0}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        width: '100%',
        p: 3,
        borderRadius: 4,
        border: isDragActive
          ? '1px dashed rgba(25, 118, 210, 0.75)'
          : '1px solid rgba(255, 255, 255, 0.55)',
        background: isDragActive
          ? 'rgba(25, 118, 210, 0.08)'
          : 'rgba(255, 255, 255, 0.72)',
        boxShadow: '0 10px 28px rgba(31, 38, 135, 0.12)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="h6">
            Вложения
          </Typography>

          <input
            hidden
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,.doc,.docx,.xls,.xlsx"
            onChange={handleFileChange}
          />

          <Button
            type="button"
            size="small"
            variant="contained"
            startIcon={<AttachFileIcon />}
            onClick={handleChooseFile}
            disabled={disabled}
          >
            Добавить файл
          </Button>
        </Box>

        {files.length === 0 && (
          <Typography color="text.secondary">
            Пока нет файлов. Вы можете добавить их, перетащив в эту область или выбрав через кнопку "Добавить файл".
          </Typography>
        )}

        {files.length > 0 && (
          <Stack spacing={1}>
            {files.map((file, index) => (
              <Box
                key={`${file.name}-${file.size}-${file.lastModified}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid rgba(148, 163, 184, 0.35)',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                  <Typography
                    fontWeight={600}
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {formatFileSize(file.size)}
                  </Typography>
                </Stack>

                <Button
                  type="button"
                  color="error"
                  variant="outlined"
                  size="small"
                  onClick={() => onRemoveFile(index)}
                  disabled={disabled}
                >
                  Убрать
                </Button>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}

export default TaskPendingAttachments
