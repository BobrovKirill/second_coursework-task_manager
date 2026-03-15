import {
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
  Avatar,
  IconButton,
} from '@mui/material'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import { useEffect, useRef, useState } from 'react'
import {
  EMPLOYEE_TYPES,
  useUserStore,
} from '../../store/useUserStory'
import { useAlertModal } from '../../components/AlertModal'
import base from '../../styles/formBase.module.css'
import styles from './style.module.css'
import type {EmployeeType, User} from "../../types/user.ts";
import {EMPLOYEE_TYPE_LABELS} from "./index.ts";
import liquidGlass from '../../styles/liquidGlass.module.css'

function ProfilePage() {
  const { user, loading, updateUser, uploadAvatar } = useUserStore()
  const { showAlertModal } = useAlertModal()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    patronymic: '',
    birthDate: '',
    position: '',
    employeeType: '' as EmployeeType | '',
    email: '',
  })

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      patronymic: user.patronymic ?? '',
      birthDate: user.birthDate ?? '',
      position: user.position ?? '',
      employeeType: user.employeeType ?? '',
      email: user.email ?? '',
    })
    setAvatarPreview(user.avatar ?? null)
  }, [user])

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Локальный превью
    setAvatarPreview(URL.createObjectURL(file))

    try {
      await uploadAvatar(file)
      showAlertModal({ title: 'Готово', message: 'Аватар обновлён', type: 'success' })
    }
    catch {
      showAlertModal({ title: 'Ошибка', message: 'Не удалось загрузить аватар' })
      setAvatarPreview(user?.avatar ?? null)
    }
  }

  async function handleSave() {
    try {
      await updateUser(form as Partial<User>)
      showAlertModal({ title: 'Сохранено', message: 'Профиль обновлён', type: 'success' })
    }
    catch {
      showAlertModal({ title: 'Ошибка', message: 'Не удалось сохранить профиль' })
    }
  }

  const initials = [form.firstName?.[0], form.lastName?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?'

  const fullName = [form.lastName, form.firstName, form.patronymic]
    .filter(Boolean)
    .join(' ') || 'Имя не указано'

  if (loading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <div className={styles.root}>
      <div className={`${liquidGlass.wrapper} ${styles.card}`}>
        <Typography variant="h6" className={styles.sectionTitle}>
          Профиль
        </Typography>

        {/* Аватар */}
        <div className={styles.avatar}>
          <div className={styles.avatarWrapper}>
            <Avatar
              src={avatarPreview ?? undefined}
              sx={{ width: 80, height: 80, fontSize: '1.75rem', bgcolor: 'rgba(0,120,255,0.12)', color: 'rgba(0,120,255,0.8)' }}
            >
              {!avatarPreview && initials}
            </Avatar>
            <IconButton
              className={styles.avatarButton}
              onClick={() => fileInputRef.current?.click()}
              size="small"
            >
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </div>

          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {form.position || 'Должность не указана'}
            </Typography>
          </Box>
        </div>

        <div className={styles.fields}>
          <TextField
            label="Имя"
            value={form.firstName}
            onChange={set('firstName')}
            fullWidth
            className={base.field}
          />
          <TextField
            label="Фамилия"
            value={form.lastName}
            onChange={set('lastName')}
            fullWidth
            className={base.field}
          />
          <TextField
            label="Отчество"
            value={form.patronymic}
            onChange={set('patronymic')}
            fullWidth
            className={base.field}
          />
          <TextField
            label="Дата рождения"
            type="date"
            value={form.birthDate}
            onChange={set('birthDate')}
            fullWidth
            className={base.field}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Должность"
            value={form.position}
            onChange={set('position')}
            fullWidth
            className={base.field}
          />
          <TextField
            select
            label="Тип сотрудника"
            value={form.employeeType}
            onChange={set('employeeType')}
            fullWidth
            className={base.field}
          >
            {EMPLOYEE_TYPES.map(type => (
              <MenuItem key={type} value={type}>
                {EMPLOYEE_TYPE_LABELS[type]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Email"
            value={form.email}
            fullWidth
            disabled
            className={`${base.field} ${styles.fullWidth}`}
          />
        </div>

        <div className={styles.actions}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            className={base.submitButton}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Сохранить'}
          </Button>
        </div>
      </div>

      <div className={`${liquidGlass.wrapper} ${styles.card}`}>
        <Typography variant="h6" className={styles.sectionTitle}>
          Мои проекты
        </Typography>
        <div className={styles.projectChips}>
          {user?.projects?.length
            ? user.projects.map(project => (
              <Chip key={project.id} label={project.name} variant="outlined" />
            ))
            : (
              <Typography variant="body2" color="text.secondary">
                Нет проектов
              </Typography>
            )}
        </div>
      </div>

      <div className={`${liquidGlass.wrapper} ${styles.card}`}>
        <Typography variant="h6" className={styles.sectionTitle}>
          Мои задачи
        </Typography>
        <div className={styles.projectChips}>
          {user?.projects?.length
            // TODO передалать на user.projects на user.tasks когда Ксюша закончит свою часть
            ? user.projects.map(project => (
              <Chip key={project.id} label={project.name} variant="outlined" />
            ))
            : (
              <Typography variant="body2" color="text.secondary">
                Нет задач
              </Typography>
            )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage