import type { ChangeEvent, DragEvent } from 'react'
import type { TaskAttachment } from '../../types/taskAttachment'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import ImageIcon from '@mui/icons-material/Image'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useRef, useState } from 'react'

interface TaskAttachmentsProps {
  attachments: TaskAttachment[]
  loading?: boolean
  uploading?: boolean
  deletingAttachmentId?: number | null
  error?: string | null
  canManage?: boolean
  onUpload?: (file: File) => Promise<void>
  onDelete?: (attachmentId: number) => Promise<void>
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

function isImage(contentType: string) {
  return contentType.startsWith('image/')
}

function TaskAttachments({
  attachments,
  loading = false,
  uploading = false,
  deletingAttachmentId = null,
  error = null,
  canManage = false,
  onUpload,
  onDelete,
}: TaskAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null)
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState<number | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleChooseFile = () => {
    fileInputRef.current?.click()
  }

  const handleUploadFiles = (selectedFiles: File[]) => {
    if (!canManage || uploading || onUpload === undefined || selectedFiles.length === 0) {
      return
    }

    const upload = onUpload

    void (async () => {
      for (const file of selectedFiles) {
        await upload(file)
      }
    })()
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    if (!canManage || uploading || onUpload === undefined) {
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
    handleUploadFiles(selectedFiles)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = [...(event.currentTarget.files ?? [])]
    const input = event.currentTarget

    handleUploadFiles(selectedFiles)
    input.value = ''
  }

  const handleClosePreview = () => {
    setPreviewAttachment(null)
  }

  const handleDownload = async (attachment: TaskAttachment) => {
    setDownloadingAttachmentId(attachment.id)

    try {
      const response = await fetch(attachment.fileUrl)

      if (!response.ok) {
        throw new Error('Не удалось скачать файл')
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = objectUrl
      link.download = attachment.originalName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    }
    catch {
      window.open(attachment.fileUrl, '_blank', 'noopener,noreferrer')
    }
    finally {
      setDownloadingAttachmentId(null)
    }
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

          {canManage && onUpload !== undefined && (
            <>
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
                startIcon={uploading ? <CircularProgress size={16} /> : <AttachFileIcon />}
                onClick={handleChooseFile}
                disabled={uploading}
              >
                {uploading ? 'Загрузка...' : 'Добавить файл'}
              </Button>
            </>
          )}
        </Box>

        {canManage && onUpload !== undefined && (
          <Typography variant="body2" color="text.secondary">
            Можно добавить файлы кнопкой или перетащить их в этот блок.
          </Typography>
        )}

        {loading && (
          <Box>
            <CircularProgress size={24} />
          </Box>
        )}

        {error !== null && (
          <Typography color="error">
            {error}
          </Typography>
        )}

        {!loading && attachments.length === 0 && (
          <Typography color="text.secondary">
            Вложений пока нет
          </Typography>
        )}

        {attachments.length > 0 && (
          <Stack spacing={2}>
            {attachments.map(attachment => (
              <Box
                key={attachment.id}
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid rgba(148, 163, 184, 0.35)',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                {isImage(attachment.contentType)
                  ? (
                      <Box
                        component="img"
                        src={attachment.fileUrl}
                        alt={attachment.originalName}
                        sx={{
                          width: 72,
                          height: 72,
                          objectFit: 'cover',
                          borderRadius: 2,
                        }}
                      />
                    )
                  : (
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 2,
                          backgroundColor: 'rgba(15, 23, 42, 0.06)',
                        }}
                      >
                        <AttachFileIcon />
                      </Box>
                    )}

                <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isImage(attachment.contentType)
                      ? <ImageIcon fontSize="small" />
                      : <AttachFileIcon fontSize="small" />}

                    <Typography
                      fontWeight={600}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {attachment.originalName}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    {formatFileSize(attachment.size)}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1}>
                  {isImage(attachment.contentType) && (
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      onClick={() => setPreviewAttachment(attachment)}
                    >
                      Посмотреть
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      void handleDownload(attachment)
                    }}
                    disabled={downloadingAttachmentId === attachment.id}
                  >
                    {downloadingAttachmentId === attachment.id ? 'Скачивание...' : 'Скачать'}
                  </Button>

                  {canManage && onDelete !== undefined && (
                    <Button
                      type="button"
                      color="error"
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        void onDelete(attachment.id)
                      }}
                      disabled={deletingAttachmentId === attachment.id}
                    >
                      {deletingAttachmentId === attachment.id ? 'Удаление...' : 'Удалить'}
                    </Button>
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>

      <Dialog
        open={previewAttachment !== null}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewAttachment?.originalName}
        </DialogTitle>

        <DialogContent>
          {previewAttachment !== null && (
            <Box
              component="img"
              src={previewAttachment.fileUrl}
              alt={previewAttachment.originalName}
              sx={{
                width: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: 2,
              }}
            />
          )}
        </DialogContent>

        <DialogActions>
          {previewAttachment !== null && (
            <Button
              type="button"
              onClick={() => {
                void handleDownload(previewAttachment)
              }}
              disabled={downloadingAttachmentId === previewAttachment.id}
            >
              {downloadingAttachmentId === previewAttachment.id ? 'Скачивание...' : 'Скачать'}
            </Button>
          )}

          <Button type="button" onClick={handleClosePreview}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default TaskAttachments
