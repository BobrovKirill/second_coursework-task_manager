import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useRef } from 'react'
import styles from './styles.module.css'

interface BasicSettingsProps {
  name: string
  description: string
  iconUrl: string | null
  isUploadingIcon: boolean
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onIconUpload: (file: File) => Promise<void>
  onIconDelete: () => Promise<void>
}

function BasicSettings({
  name,
  description,
  iconUrl,
  isUploadingIcon,
  onNameChange,
  onDescriptionChange,
  onIconUpload,
  onIconDelete,
}: BasicSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file)
      return

    try {
      await onIconUpload(file)
    }
    finally {
      if (fileInputRef.current)
        fileInputRef.current.value = ''
    }
  }

  return (
    <Paper className={styles.section}>
      <Typography variant="h6" className={styles.sectionTitle}>
        Основные настройки
      </Typography>

      <Box className={styles.basicSettings}>
        <Box className={styles.iconPlaceholder}>
          {iconUrl
            ? (
                <Box className={styles.iconWrapper}>
                  <Box
                    component="img"
                    src={iconUrl}
                    alt="Project icon"
                    className={styles.iconImage}
                  />
                  <Box className={styles.iconOverlay}>
                    <IconButton
                      component="label"
                      size="small"
                      className={styles.iconUploadBtn}
                      disabled={isUploadingIcon}
                    >
                      <CloudUploadIcon fontSize="small" />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleFileChange}
                      />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={onIconDelete}
                      disabled={isUploadingIcon}
                      className={styles.iconDeleteBtn}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              )
            : (
                <Box className={styles.iconEmpty}>
                  {isUploadingIcon
                    ? (
                        <CircularProgress size={24} />
                      )
                    : (
                        <IconButton
                          component="label"
                          className={styles.iconUploadBtnSingle}
                        >
                          <CloudUploadIcon />
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleFileChange}
                          />
                        </IconButton>
                      )}
                </Box>
              )}
        </Box>

        <Box className={styles.basicFields}>
          <TextField
            fullWidth
            label="Название проекта"
            value={name}
            onChange={e => onNameChange(e.target.value)}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Описание"
            value={description}
            onChange={e => onDescriptionChange(e.target.value)}
          />
        </Box>
      </Box>
    </Paper>
  )
}

export default BasicSettings
