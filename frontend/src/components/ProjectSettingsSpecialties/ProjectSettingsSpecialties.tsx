import type { ProjectSpecialty } from '../../types/projectSpecialty'
import AddIcon from '@mui/icons-material/Add'
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
import { useRef, useState } from 'react'
import styles from './styles.module.css'

interface SpecialtiesSettingsProps {
  specialties: ProjectSpecialty[]
  onSpecialtyNameChange: (specialtyId: number, newName: string) => void
  onSpecialtyColorChange: (specialtyId: number, newColor: string) => void
  onAddSpecialty: () => void
  onDeleteSpecialty: (specialtyId: number) => void
}

function SpecialtiesSettings({
  specialties,
  onSpecialtyNameChange,
  onSpecialtyColorChange,
  onAddSpecialty,
  onDeleteSpecialty,
}: SpecialtiesSettingsProps) {
  const [deleteSpecialtyId, setDeleteSpecialtyId] = useState<number | null>(null)
  const colorInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const handleColorIndicatorClick = (specialtyId: number) => {
    colorInputRefs.current[specialtyId]?.click()
  }

  const handleDeleteSpecialty = (specialtyId: number) => {
    setDeleteSpecialtyId(specialtyId)
  }

  const confirmDeleteSpecialty = () => {
    if (deleteSpecialtyId !== null) {
      onDeleteSpecialty(deleteSpecialtyId)
      setDeleteSpecialtyId(null)
    }
  }

  return (
    <>
      <Paper className={styles.section}>
        <Box className={styles.sectionHeader}>
          <Typography variant="h6" className={styles.sectionTitle}>
            Специальности
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAddSpecialty}
            size="small"
          >
            Добавить специальность
          </Button>
        </Box>

        <Box className={styles.columnsList}>
          {specialties.map(specialty => (
            <Box key={specialty.id} className={styles.columnItem}>
              <Box
                component="button"
                className={styles.specialtyColorButton}
                onClick={() => handleColorIndicatorClick(specialty.id)}
                aria-label={`Выбрать цвет для ${specialty.name}`}
                sx={{
                  backgroundColor: specialty.hex_color,
                }}
              />

              <input
                ref={(el) => { colorInputRefs.current[specialty.id] = el }}
                type="color"
                value={specialty.hex_color}
                onChange={e => onSpecialtyColorChange(specialty.id, e.target.value)}
                className={styles.hiddenColorInput}
              />

              <TextField
                fullWidth
                size="small"
                value={specialty.name}
                onChange={e => onSpecialtyNameChange(specialty.id, e.target.value)}
                variant="outlined"
                className={styles.columnTitle}
              />

              <Box className={styles.columnActions}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteSpecialty(specialty.id)}
                  className={styles.actionButton}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
          {specialties.length === 0 && (
            <Box className={styles.emptyState}>
              <Typography variant="body2" color="text.secondary">
                Нет специальностей
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Dialog
        open={deleteSpecialtyId !== null}
        onClose={() => setDeleteSpecialtyId(null)}
      >
        <DialogTitle>Удалить специальность?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить эту специальность? У участников, которым она назначена, специальность будет сброшена.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSpecialtyId(null)}>Отмена</Button>
          <Button onClick={confirmDeleteSpecialty} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SpecialtiesSettings
