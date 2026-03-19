import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert
} from '@mui/material'
import { useState } from 'react'
import useApi from '../../hooks/useApi'

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

const CreateProjectModal = ({ open, onClose, onSuccess }: CreateProjectModalProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const api = useApi()

  const handleSubmit = async () => {
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    try {
      await api.post('/projects', {
        name: name.trim(),
        description: description.trim() || null
      })
      
      setName('')
      setDescription('')
      
      onClose()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать проект')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setName('')
      setDescription('')
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Создание нового проекта</DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <TextField
            autoFocus
            label="Название проекта"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            error={name.trim() === '' && name !== ''}
            helperText={name.trim() === '' && name !== '' ? 'Название не может быть пустым' : ''}
          />
          
          <TextField
            label="Описание"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            placeholder="Опишите проект (необязательно)"
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
        >
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!name.trim() || loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Создание...' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateProjectModal