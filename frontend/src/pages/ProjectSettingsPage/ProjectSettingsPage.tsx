import type { BoardColumnUpdate } from '../../types/boardColumn'
import type { BackgroundType, ProjectMember } from '../../types/project'
import type { ProjectSpecialty } from '../../types/projectSpecialty'
import LockIcon from '@mui/icons-material/Lock'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  createTheme,
  ThemeProvider,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAlertModal } from '../../components/AlertModal'
import BasicSettings from '../../components/ProjectSettingsBasic'
import BoardSettings from '../../components/ProjectSettingsBoard'
import CustomizationSettings from '../../components/ProjectSettingsCustomization'
import MembersSettings from '../../components/ProjectSettingsMembers'
import SpecialtiesSettings from '../../components/ProjectSettingsSpecialties'
import { useBoardColumns } from '../../hooks/useBoardColumn'
import { useProject } from '../../hooks/useProject'
import { useProjectImages } from '../../hooks/useProjectImages'
import { useProjectMembers } from '../../hooks/useProjectMembers'
import { useProjectSpecialties } from '../../hooks/useProjectSpecialties'
import { useUserStore } from '../../store/useUserStory'
import styles from './styles.module.css'

interface EditableColumn {
  id?: number
  title: string
  position: number
}

interface EditableSpecialty extends ProjectSpecialty {}

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

  const { showAlertModal } = useAlertModal()
  const { uploadIcon, uploadBackground, deleteIcon, deleteBackground } = useProjectImages(projectId)

  const { getPermissions } = useUserStore()
  const permissions = useMemo(() => {
    const perms = getPermissions()
    return Array.isArray(perms) ? perms : []
  }, [getPermissions])

  const hasFullAccess = permissions.includes('manage_members') && permissions.includes('assign_role')
  const hasMembersAccess = permissions.includes('manage_members')
  const canAssignRole = permissions.includes('assign_role')

  const hasAnyAccess = hasFullAccess || hasMembersAccess

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const [localIconUrl, setLocalIconUrl] = useState<string | null>(null)
  const [isUploadingIcon, setIsUploadingIcon] = useState(false)

  const [editableColumns, setEditableColumns] = useState<EditableColumn[]>([])

  const [localSpecialties, setLocalSpecialties] = useState<EditableSpecialty[]>([])
  const [deletedSpecialtyIds, setDeletedSpecialtyIds] = useState<number[]>([])

  const [localMembers, setLocalMembers] = useState<ProjectMember[]>([])
  const [removedMemberIds, setRemovedMemberIds] = useState<number[]>([])
  const [specialtyAssignments, setSpecialtyAssignments] = useState<Record<number, number | null>>({})

  const [fontColor, setFontColor] = useState('#000000')
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('default')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [gradientColor1, setGradientColor1] = useState('#ffffff')
  const [gradientColor2, setGradientColor2] = useState('#000000')
  const [gradientAngle, setGradientAngle] = useState('90')
  const [localBackgroundImageUrl, setLocalBackgroundImageUrl] = useState<string | null>(null)
  const [isUploadingBackground, setIsUploadingBackground] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (project) {
      setName(project.name)
      setDescription(project.description || '')
      setFontColor(project.font_color || '#000000')
      setBackgroundType(project.background_type || 'default')
      setLocalIconUrl(project.icon_url || null)

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
        else if (project.background_type === 'image') {
          setLocalBackgroundImageUrl(project.background_value)
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

  useEffect(() => {
    setLocalSpecialties([...specialties])
  }, [specialties])

  useEffect(() => {
    setLocalMembers([...members])
  }, [members])

  const handleColumnsChange = (columns: EditableColumn[]) => {
    setEditableColumns(columns)
  }

  const handleIconUpload = useCallback(async (file: File) => {
    try {
      setIsUploadingIcon(true)
      const url = await uploadIcon(file)
      setLocalIconUrl(url)
      showAlertModal({ title: 'Готово', message: 'Иконка загружена', type: 'success' })
    }
    catch {
      showAlertModal({ title: 'Ошибка', message: 'Не удалось загрузить иконку' })
    }
    finally {
      setIsUploadingIcon(false)
    }
  }, [uploadIcon, showAlertModal])

  const handleIconDelete = useCallback(async () => {
    try {
      await deleteIcon()
      setLocalIconUrl(null)
      showAlertModal({ title: 'Готово', message: 'Иконка удалена', type: 'success' })
    }
    catch {
      showAlertModal({ title: 'Ошибка', message: 'Не удалось удалить иконку' })
    }
  }, [deleteIcon, showAlertModal])

  const handleBackgroundImageUpload = useCallback(async (file: File) => {
    try {
      setIsUploadingBackground(true)
      const url = await uploadBackground(file)
      setLocalBackgroundImageUrl(url)
      setBackgroundType('image')
      showAlertModal({ title: 'Готово', message: 'Фоновое изображение загружено', type: 'success' })
    }
    catch {
      showAlertModal({ title: 'Ошибка', message: 'Не удалось загрузить изображение' })
    }
    finally {
      setIsUploadingBackground(false)
    }
  }, [uploadBackground, showAlertModal])

  const handleBackgroundImageDelete = useCallback(async () => {
    try {
      await deleteBackground()
      setLocalBackgroundImageUrl(null)
      setBackgroundType('default')
      showAlertModal({ title: 'Готово', message: 'Фоновое изображение удалено', type: 'success' })
    }
    catch {
      showAlertModal({ title: 'Ошибка', message: 'Не удалось удалить изображение' })
    }
  }, [deleteBackground, showAlertModal])

  const handleSpecialtyNameChange = (specialtyId: number, newName: string) => {
    setLocalSpecialties(prev =>
      prev.map(s => (s.id === specialtyId ? { ...s, name: newName } : s)),
    )
  }

  const handleSpecialtyColorChange = (specialtyId: number, newColor: string) => {
    setLocalSpecialties(prev =>
      prev.map(s => (s.id === specialtyId ? { ...s, hex_color: newColor } : s)),
    )
  }

  const handleAddSpecialty = () => {
    const tempId = Date.now()
    setLocalSpecialties(prev => [
      ...prev,
      {
        id: tempId,
        project_id: projectId,
        name: 'Новая специальность',
        hex_color: '#1976d2',
        _isNew: true,
        _tempId: tempId,
      } as any,
    ])
  }

  const handleDeleteSpecialty = (specialtyId: number) => {
    setDeletedSpecialtyIds(prev => [...prev, specialtyId])
    setLocalSpecialties(prev => prev.filter(s => s.id !== specialtyId))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      if (hasFullAccess) {
        let backgroundValue: string | null = null

        if (backgroundType === 'color') {
          backgroundValue = backgroundColor
        }
        else if (backgroundType === 'gradient') {
          backgroundValue = `${gradientColor1}|${gradientColor2}|${gradientAngle}`
        }
        else if (backgroundType === 'image') {
          backgroundValue = localBackgroundImageUrl
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
      }

      if (hasMembersAccess) {
        for (const specialty of localSpecialties) {
          const isNew = (specialty as any)._isNew

          if (isNew) {
            await createSpecialty({
              name: specialty.name,
              hex_color: specialty.hex_color,
            })
          }
          else if (!deletedSpecialtyIds.includes(specialty.id)) {
            await updateSpecialty(specialty.id, {
              name: specialty.name,
              hex_color: specialty.hex_color,
            })
          }
        }

        for (const specialtyId of deletedSpecialtyIds) {
          if (specialties.some(s => s.id === specialtyId)) {
            await deleteSpecialty(specialtyId)
          }
        }

        for (const memberId of removedMemberIds) {
          await removeMember(memberId)
        }

        for (const [memberId, specialtyId] of Object.entries(specialtyAssignments)) {
          await assignSpecialty(Number(memberId), specialtyId)
        }
      }

      setSaveSuccess(true)
      setTimeout(() => {
        window.location.href = `/projects/${projectId}/board`
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

  if (!hasAnyAccess) {
    return (
      <ThemeProvider theme={defaultTheme}>
        <Box className={styles.container}>
          <Box className={styles.errorContainer}>
            <Alert
              severity="error"
              className={styles.errorAlert}
              icon={<LockIcon />}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                Доступ запрещен
              </Typography>
              <Typography variant="body1">
                Вы не имеете доступа к настройкам данного проекта
              </Typography>
            </Alert>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={async () => navigate(`/projects/${projectId}/board`)}
              >
                Вернуться к доске проекта
              </Button>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
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
        {hasFullAccess && (
          <>
            <BasicSettings
              name={name}
              description={description}
              iconUrl={localIconUrl}
              isUploadingIcon={isUploadingIcon}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              onIconUpload={handleIconUpload}
              onIconDelete={handleIconDelete}
            />

            <BoardSettings
              columns={editableColumns}
              onColumnsChange={handleColumnsChange}
            />
          </>
        )}

        {hasMembersAccess && (
          <>
            <MembersSettings
              projectId={projectId}
              canAssignRole={true}
              onAddMember={() => {}}
              onAssignRole={() => {}}
            />

            <SpecialtiesSettings
              specialties={localSpecialties}
              onSpecialtyNameChange={handleSpecialtyNameChange}
              onSpecialtyColorChange={handleSpecialtyColorChange}
              onAddSpecialty={handleAddSpecialty}
              onDeleteSpecialty={handleDeleteSpecialty}
            />
          </>
        )}

        {hasFullAccess && (
          <>
            <CustomizationSettings
              fontColor={fontColor}
              backgroundType={backgroundType}
              backgroundColor={backgroundColor}
              gradientColor1={gradientColor1}
              gradientColor2={gradientColor2}
              gradientAngle={gradientAngle}
              backgroundImageUrl={localBackgroundImageUrl}
              isUploadingBackground={isUploadingBackground}
              onFontColorChange={setFontColor}
              onBackgroundTypeChange={setBackgroundType}
              onBackgroundColorChange={setBackgroundColor}
              onGradientColor1Change={setGradientColor1}
              onGradientColor2Change={setGradientColor2}
              onGradientAngleChange={setGradientAngle}
              onBackgroundImageUpload={handleBackgroundImageUpload}
              onBackgroundImageDelete={handleBackgroundImageDelete}
            />
          </>
        )}

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
      </Box>
    </ThemeProvider>
  )
}

export default ProjectSettingsPage
