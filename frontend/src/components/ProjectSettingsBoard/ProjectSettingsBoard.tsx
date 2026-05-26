import AddIcon from '@mui/icons-material/Add'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import styles from './styles.module.css'

interface EditableColumn {
  id?: number
  title: string
  position: number
}

interface BoardSettingsProps {
  columns: EditableColumn[]
  onColumnsChange: (columns: EditableColumn[]) => void
}

function BoardSettings({ columns, onColumnsChange }: BoardSettingsProps) {
  const [deleteColumnIndex, setDeleteColumnIndex] = useState<number | null>(null)

  const handleAddColumn = () => {
    const updated = [...columns]
    updated.push({
      title: 'Новая колонка',
      position: updated.length,
    })
    updated.forEach((col, i) => {
      col.position = i
    })
    onColumnsChange(updated)
  }

  const handleColumnTitleChange = (index: number, newTitle: string) => {
    const updated = [...columns]
    updated[index] = { ...updated[index], title: newTitle }
    onColumnsChange(updated)
  }

  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0)
      || (direction === 'down' && index === columns.length - 1)
    ) {
      return
    }

    const updated = [...columns]
    const swapIndex = direction === 'up' ? index - 1 : index + 1

    const currentColumn = { ...updated[index] }
    const swapColumn = { ...updated[swapIndex] }

    updated[index] = swapColumn
    updated[swapIndex] = currentColumn

    updated.forEach((col, i) => {
      col.position = i
    })

    onColumnsChange(updated)
  }

  const handleDeleteColumn = (index: number) => {
    setDeleteColumnIndex(index)
  }

  const confirmDeleteColumn = () => {
    if (deleteColumnIndex !== null) {
      const updated = columns.filter((_, i) => i !== deleteColumnIndex)
      onColumnsChange(updated)
      setDeleteColumnIndex(null)
    }
  }

  return (
    <>
      <Paper className={styles.section}>
        <Box className={styles.sectionHeader}>
          <Typography variant="h6" className={styles.sectionTitle}>
            Настройки доски
          </Typography>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddColumn}
            disabled={columns.length >= 16}
            size="small"
          >
            Добавить колонку
          </Button>
        </Box>

        <Box className={styles.columnsList}>
          {columns.map((column, index) => (
            <Box key={index} className={styles.columnItem}>
              <TextField
                fullWidth
                size="small"
                value={column.title}
                onChange={e => handleColumnTitleChange(index, e.target.value)}
                variant="outlined"
                className={styles.columnTitle}
              />

              <Box className={styles.columnActions}>
                <IconButton
                  size="small"
                  onClick={() => handleMoveColumn(index, 'up')}
                  disabled={index === 0}
                  className={styles.actionButton}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => handleMoveColumn(index, 'down')}
                  disabled={index === columns.length - 1}
                  className={styles.actionButton}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteColumn(index)}
                  disabled={columns.length <= 1}
                  className={styles.actionButton}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      <Dialog
        open={deleteColumnIndex !== null}
        onClose={() => setDeleteColumnIndex(null)}
      >
        <DialogTitle>Удалить колонку?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить эту колонку? Все задачи в этой колонке также будут удалены.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteColumnIndex(null)}>Отмена</Button>
          <Button onClick={confirmDeleteColumn} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default BoardSettings
