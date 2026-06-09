import { useState, useRef, useEffect, type ChangeEvent } from 'react'
import { Box, TextField, Button, CircularProgress, Typography, Chip } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CloseIcon from '@mui/icons-material/Close'
import styles from './styles.module.css'

interface AttachedFile {
  file: File
  id: string
}

interface CommentFormProps {
  onSubmit: (text: string, files: File[]) => Promise<void> | void
  onCancel: () => void
  isSending: boolean
  placeholder?: string
  initialText?: string
}

function CommentForm({
  onSubmit,
  onCancel,
  isSending,
  placeholder = 'Написать комментарий...',
  initialText = '',
}: CommentFormProps) {
  const [text, setText] = useState(initialText)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const textFieldRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setText(initialText)
  }, [initialText])

  useEffect(() => {
    const timer = setTimeout(() => {
      textFieldRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async () => {
    if ((text.trim() || attachedFiles.length > 0) && !isSending) {
      const files = attachedFiles.map(f => f.file)
      await onSubmit(text.trim(), files)
      setText('')
      setAttachedFiles([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      void handleSubmit()
    }
  }

  const handleAddFiles = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = [...(event.currentTarget.files ?? [])]
    
    const newFiles = selectedFiles.map(file => ({
      file,
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
    }))
    
    setAttachedFiles(prev => [...prev, ...newFiles])
    event.currentTarget.value = ''
  }

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} Б`
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} КБ`
    return `${(size / 1024 / 1024).toFixed(1)} МБ`
  }

  const canSubmit = (text.trim() || attachedFiles.length > 0) && !isSending

  return (
    <Box className={styles.commentForm}>
      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        size="small"
        disabled={isSending}
        className={styles.formField}
        autoFocus
        inputRef={textFieldRef}
      />

      {attachedFiles.length > 0 && (
        <Box className={styles.attachedFiles}>
          {attachedFiles.map(file => (
            <Chip
              key={file.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AttachFileIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption" noWrap sx={{ maxWidth: 200 }}>
                    {file.file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(file.file.size)}
                  </Typography>
                </Box>
              }
              onDelete={() => handleRemoveFile(file.id)}
              deleteIcon={<CloseIcon sx={{ fontSize: 16 }} />}
              size="small"
              className={styles.fileChip}
            />
          ))}
        </Box>
      )}

      <Box className={styles.formActions}>
        <Box className={styles.formActionsLeft}>
          <input
            hidden
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,.doc,.docx,.xls,.xlsx"
            onChange={handleFileChange}
          />
          
          <Button
            size="small"
            variant="text"
            startIcon={<AttachFileIcon sx={{ fontSize: 16 }} />}
            onClick={handleAddFiles}
            disabled={isSending}
            className={styles.attachButton}
          >
            Прикрепить файл
          </Button>
        </Box>

        <Box className={styles.formActionsRight}>
          <Typography variant="caption" className={styles.formHint}>
            Ctrl + Enter для отправки
          </Typography>
          <Box className={styles.formButtons}>
            <Button
              size="small"
              variant="outlined"
              onClick={onCancel}
              disabled={isSending}
            >
              Отмена
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => void handleSubmit()}
              disabled={!canSubmit}
              startIcon={isSending ? <CircularProgress size={16} /> : <SendIcon />}
            >
              {isSending ? 'Отправка...' : 'Отправить'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CommentForm