import type { BoardColumnUpdate } from '../../types/boardColumn'
import type { BackgroundType } from '../../types/project'
import AddIcon from '@mui/icons-material/Add'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import BadgeIcon from '@mui/icons-material/Badge'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  createTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Select,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBoardColumns } from '../../hooks/useBoardColumn'
import { useProject } from '../../hooks/useProject'
import { useProjectMembers } from '../../hooks/useProjectMembers'
import { useProjectSpecialties } from '../../hooks/useProjectSpecialties'
import styles from './styles.module.css'

interface EditableColumn {
  id?: number
  title: string
  position: number
}

const defaultTheme = createTheme({
  palette: {
    mode: 'light',
    text: {
      primary: '#0f172a',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
  },
})

function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const navigate = useNavigate()

  const { project, loading, error, updateProject, updateColumns } = useProject(projectId)
  const { columns: boardColumns, loading: columnsLoading, refresh: refreshColumns } = useBoardColumns(projectId)
  const { members, loading: membersLoading, removeMember, assignSpecialty } = useProjectMembers(projectId)
  const {
    specialties,
    loading: specialtiesLoading,
    createSpecialty,
    deleteSpecialty,
    updateSpecialty,
  } = useProjectSpecialties(projectId)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const [editableColumns, setEditableColumns] = useState<EditableColumn[]>([])
  const [deleteColumnIndex, setDeleteColumnIndex] = useState<number | null>(null)

  const [deleteSpecialtyId, setDeleteSpecialtyId] = useState<number | null>(null)

  const [specialtyMenuAnchor, setSpecialtyMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)

  const [fontColor, setFontColor] = useState('#000000')
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('default')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [gradientColor1, setGradientColor1] = useState('#ffffff')
  const [gradientColor2, setGradientColor2] = useState('#000000')
  const [gradientAngle, setGradientAngle] = useState('90')

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (project) {
      setName(project.name)
      setDescription(project.description || '')
      setFontColor(project.font_color || '#000000')
      setBackgroundType(project.background_type || 'default')

      if (project.background_value) {
        if (project.background_type === 'color') {
          setBackgroundColor(project.background_value)
        }
        else if (project.background_type === 'gradient') {
          const [c1, c2, angle] = project.background_value.split('|')
          if (c1)
            setGradientColor1(c1)
          if (c2)
            setGradientColor2(c2)
          if (angle)
            setGradientAngle(angle)
        }
      }
    }
  }, [project])

  useEffect(() => {
    if (boardColumns.length > 0) {
      setEditableColumns(
        boardColumns.map(col => ({
          id: col.id,
          title: col.title,
          position: col.position,
        })),
      )
    }
  }, [boardColumns])

  const handleAddColumn = () => {
    const updated = [...editableColumns]
    updated.push({
      title: 'Новая колонка',
      position: updated.length,
    })
    updated.forEach((col, i) => {
      col.position = i
    })
    setEditableColumns(updated)
  }

  const handleColumnTitleChange = (index: number, newTitle: string) => {
    const updated = [...editableColumns]
    updated[index] = { ...updated[index], title: newTitle }
    setEditableColumns(updated)
  }

  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0)
      || (direction === 'down' && index === editableColumns.length - 1)
    ) {
      return
    }

    const updated = [...editableColumns]
    const swapIndex = direction === 'up' ? index - 1 : index + 1

    const currentColumn = { ...updated[index] }
    const swapColumn = { ...updated[swapIndex] }

    updated[index] = swapColumn
    updated[swapIndex] = currentColumn

    updated.forEach((col, i) => {
      col.position = i
    })

    setEditableColumns(updated)
  }

  const handleDeleteColumn = (index: number) => {
    setDeleteColumnIndex(index)
  }

  const confirmDeleteColumn = () => {
    if (deleteColumnIndex !== null) {
      const updated = editableColumns.filter((_, i) => i !== deleteColumnIndex)
      setEditableColumns(updated)
      setDeleteColumnIndex(null)
    }
  }

  const handleAddSpecialty = async () => {
    try {
      await createSpecialty({
        name: 'Новая специальность',
        hex_color: '#1976d2',
      })
    }
    catch (err) {
      console.error('Ошибка создания специальности:', err)
    }
  }

  const handleSpecialtyNameChange = async (specialtyId: number, newName: string) => {
    await updateSpecialty(specialtyId, { name: newName })
  }

  const handleSpecialtyColorChange = async (specialtyId: number, newColor: string) => {
    await updateSpecialty(specialtyId, { hex_color: newColor })
  }

  const handleDeleteSpecialty = (specialtyId: number) => {
    setDeleteSpecialtyId(specialtyId)
  }

  const confirmDeleteSpecialty = async () => {
    if (deleteSpecialtyId !== null) {
      await deleteSpecialty(deleteSpecialtyId)
      setDeleteSpecialtyId(null)
    }
  }

  const handleAddMember = () => {
    // Реализовать добавление участника
    console.log('Добавление участника')
  }

  const handleMemberRole = (memberId: number) => {
    // Реализовать назначение роли
    console.log('Назначение роли участнику', memberId)
  }

  const handleMemberSpecialtyClick = (event: React.MouseEvent<HTMLElement>, memberId: number) => {
    setSpecialtyMenuAnchor(event.currentTarget)
    setSelectedMemberId(memberId)
  }

  const handleMemberSpecialtySelect = async (specialtyId: number | null) => {
    if (selectedMemberId !== null) {
      await assignSpecialty(selectedMemberId, specialtyId)
    }
    setSpecialtyMenuAnchor(null)
    setSelectedMemberId(null)
  }

  const handleRemoveMember = async (memberId: number) => {
    try {
      await removeMember(memberId)
    }
    catch (err) {
      console.error('Ошибка удаления участника:', err)
    }
  }

  const truncateUsername = (username: string, maxLength: number = 30) => {
    if (username.length <= maxLength)
      return username
    return `${username.substring(0, maxLength).trim()}...`
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      let backgroundValue: string | null = null

      if (backgroundType === 'color') {
        backgroundValue = backgroundColor
      }
      else if (backgroundType === 'gradient') {
        backgroundValue = `${gradientColor1}|${gradientColor2}|${gradientAngle}`
      }

      await updateProject({
        name: name.trim(),
        description: description.trim() || undefined,
        font_color: fontColor,
        background_type: backgroundType,
        background_value: backgroundValue,
      })

      const normalizedColumns = editableColumns.map((col, index) => ({
        ...col,
        position: index,
      }))

      const columnsData: BoardColumnUpdate[] = normalizedColumns.map(col => ({
        id: col.id,
        title: col.title,
        position: col.position,
      }))

      await updateColumns(columnsData)
      await refreshColumns()

      setSaveSuccess(true)
      setTimeout(() => {
        navigate(`/projects/${projectId}/board`)
      }, 1500)
    }
    catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Ошибка сохранения настроек')
    }
    finally {
      setIsSaving(false)
    }
  }

  if (loading || columnsLoading || specialtiesLoading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !project) {
    return (
      <Box className={styles.errorContainer}>
        <Alert severity="error" className={styles.errorAlert}>
          {error?.message || 'Проект не найден или у вас нет доступа к нему'}
        </Alert>
      </Box>
    )
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box className={styles.container}>

        <Paper className={styles.section}>
          <Typography variant="h6" className={styles.sectionTitle}>
            Основные настройки
          </Typography>

          <Box className={styles.basicSettings}>
            <Box className={styles.iconPlaceholder}>
              <Typography variant="body2" color="text.secondary">
                Иконка
              </Typography>
            </Box>

            <Box className={styles.basicFields}>
              <TextField
                fullWidth
                label="Название проекта"
                value={name}
                onChange={e => setName(e.target.value)}
                className={styles.field}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Описание"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className={styles.textArea}
              />
            </Box>
          </Box>
        </Paper>

        <Paper className={styles.section}>
          <Box className={styles.sectionHeader}>
            <Typography variant="h6" className={styles.sectionTitle}>
              Настройки доски
            </Typography>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddColumn}
              disabled={editableColumns.length >= 16}
              size="small"
            >
              Добавить колонку
            </Button>
          </Box>

          <Box className={styles.columnsList}>
            {editableColumns.map((column, index) => (
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
                    disabled={index === editableColumns.length - 1}
                    className={styles.actionButton}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteColumn(index)}
                    disabled={editableColumns.length <= 1}
                    className={styles.actionButton}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper className={styles.section}>
          <Box className={styles.sectionHeader}>
            <Typography variant="h6" className={styles.sectionTitle}>
              Специальности
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddSpecialty}
              size="small"
            >
              Добавить специальность
            </Button>
          </Box>

          <Box className={styles.columnsList}>
            {specialties.map(specialty => (
              <Box key={specialty.id} className={styles.columnItem}>
                <Box
                  className={styles.specialtyColorIndicator}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: specialty.hex_color,
                    border: '2px solid rgba(0,0,0,0.2)',
                    flexShrink: 0,
                    marginRight: 1,
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  value={specialty.name}
                  onChange={async e => handleSpecialtyNameChange(specialty.id, e.target.value)}
                  variant="outlined"
                  className={styles.columnTitle}
                />

                <Box className={styles.columnActions}>
                  <input
                    type="color"
                    value={specialty.hex_color}
                    onChange={async e => handleSpecialtyColorChange(specialty.id, e.target.value)}
                    style={{
                      width: 36,
                      height: 36,
                      padding: 2,
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      background: 'transparent',
                    }}
                  />

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
              <Box className={styles.emptyMembers}>
                <Typography variant="body2" color="text.secondary">
                  Нет специальностей
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        <Paper className={styles.section}>
          <Box className={styles.sectionHeader}>
            <Typography variant="h6" className={styles.sectionTitle}>
              Участники
            </Typography>
            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={handleAddMember}
              size="small"
            >
              Добавить участника
            </Button>
          </Box>

          {membersLoading
            ? (
                <Box className={styles.loadingContainer}>
                  <CircularProgress size={24} />
                </Box>
              )
            : (
                <Box className={styles.membersList}>
                  {members.map((member) => {
                    const memberSpecialty = specialties.find(s => s.id === member.specialty_id)

                    return (
                      <Box
                        key={member.id}
                        className={styles.memberItem}
                        sx={{
                          minHeight: 60,
                          borderLeft: memberSpecialty
                            ? `4px solid ${memberSpecialty.hex_color}`
                            : '4px solid transparent',
                          padding: '12px 16px',
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            className={styles.memberName}
                            title={member.username}
                          >
                            {truncateUsername(member.username)}
                          </Typography>
                          {memberSpecialty && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.75rem',
                                display: 'block',
                                mt: 0.25,
                              }}
                            >
                              {memberSpecialty.name}
                            </Typography>
                          )}
                        </Box>

                        <Box className={styles.memberActions}>
                          <Tooltip title="Роль" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleMemberRole(member.id)}
                              className={styles.actionButton}
                            >
                              <BadgeIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Специальность" arrow>
                            <IconButton
                              size="small"
                              onClick={e => handleMemberSpecialtyClick(e, member.id)}
                              className={styles.actionButton}
                            >
                              <WorkOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Удалить участника" arrow>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={async () => handleRemoveMember(member.id)}
                              className={styles.actionButton}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    )
                  })}
                  {members.length === 0 && (
                    <Box className={styles.emptyMembers}>
                      <Typography variant="body2" color="text.secondary">
                        Нет участников
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
        </Paper>

        <Menu
          anchorEl={specialtyMenuAnchor}
          open={Boolean(specialtyMenuAnchor)}
          onClose={() => {
            setSpecialtyMenuAnchor(null)
            setSelectedMemberId(null)
          }}
        >
          <MenuItem onClick={async () => handleMemberSpecialtySelect(null)}>
            <Typography color="text.secondary">Без специальности</Typography>
          </MenuItem>
          {specialties.map(specialty => (
            <MenuItem
              key={specialty.id}
              onClick={async () => handleMemberSpecialtySelect(specialty.id)}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: specialty.hex_color,
                  marginRight: 1,
                  border: '1px solid rgba(0,0,0,0.2)',
                }}
              />
              {specialty.name}
            </MenuItem>
          ))}
        </Menu>

        <Paper className={styles.section}>
          <Typography variant="h6" className={styles.sectionTitle}>
            Кастомизация
          </Typography>

          <Box className={styles.customizationGroup}>
            <Typography variant="subtitle1" className={styles.subtitle}>
              Цвет шрифта
            </Typography>
            <TextField
              type="color"
              value={fontColor}
              onChange={e => setFontColor(e.target.value)}
              className={styles.colorPicker}
            />
          </Box>

          <Divider className={styles.divider} />

          <Box className={styles.customizationGroup}>
            <Typography variant="subtitle1" className={styles.subtitle}>
              Тип фона
            </Typography>

            <FormControl fullWidth className={styles.selectField}>
              <Select
                value={backgroundType}
                onChange={e => setBackgroundType(e.target.value as BackgroundType)}
              >
                <MenuItem value="default">По умолчанию</MenuItem>
                <MenuItem value="color">Цвет</MenuItem>
                <MenuItem value="gradient">Градиент</MenuItem>
                <MenuItem value="image">Изображение</MenuItem>
              </Select>
            </FormControl>

            {backgroundType === 'color' && (
              <Box className={styles.backgroundConfig}>
                <Typography variant="body2" className={styles.configLabel}>
                  Выберите цвет фона
                </Typography>
                <TextField
                  type="color"
                  value={backgroundColor}
                  onChange={e => setBackgroundColor(e.target.value)}
                  className={styles.largeColorPicker}
                />
                <TextField
                  label="HEX"
                  value={backgroundColor}
                  onChange={e => setBackgroundColor(e.target.value)}
                  size="small"
                  className={styles.hexInput}
                />
              </Box>
            )}

            {backgroundType === 'gradient' && (
              <Box className={styles.backgroundConfig}>
                <Box className={styles.gradientColors}>
                  <Box className={styles.gradientColorField}>
                    <Typography variant="body2" className={styles.configLabel}>
                      Цвет 1
                    </Typography>
                    <TextField
                      type="color"
                      value={gradientColor1}
                      onChange={e => setGradientColor1(e.target.value)}
                      className={styles.colorPicker}
                    />
                  </Box>
                  <Box className={styles.gradientColorField}>
                    <Typography variant="body2" className={styles.configLabel}>
                      Цвет 2
                    </Typography>
                    <TextField
                      type="color"
                      value={gradientColor2}
                      onChange={e => setGradientColor2(e.target.value)}
                      className={styles.colorPicker}
                    />
                  </Box>
                </Box>
                <TextField
                  label="Угол градиента (градусы)"
                  type="number"
                  value={gradientAngle}
                  onChange={e => setGradientAngle(e.target.value)}
                  inputProps={{ min: 0, max: 360 }}
                  size="small"
                  className={styles.gradientAngle}
                />
              </Box>
            )}

            {backgroundType === 'image' && (
              <Box className={styles.imagePlaceholder}>
                <Typography variant="body2" color="text.secondary">
                  Загрузка изображений будет доступна позже
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        <Box className={styles.saveSection}>
          {saveError && (
            <Alert severity="error" className={styles.saveAlert}>
              {saveError}
            </Alert>
          )}
          {saveSuccess && (
            <Alert severity="success" className={styles.saveAlert}>
              Настройки успешно сохранены
            </Alert>
          )}
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            startIcon={isSaving ? <CircularProgress size={20} /> : null}
            className={styles.saveButton}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Box>

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
      </Box>
    </ThemeProvider>
  )
}

export default ProjectSettingsPage
