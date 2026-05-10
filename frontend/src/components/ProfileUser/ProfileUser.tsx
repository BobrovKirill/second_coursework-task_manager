import type { EmployeeType, User } from '../../types/user.ts'
import AnnouncementIcon from '@mui/icons-material/Announcement'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useAlertModal } from '../../components/AlertModal'
import { EMPLOYEE_TYPES, useUserStore } from '../../store/useUserStory'
import base from '../../styles/formBase.module.css'
import liquidGlass from '../../styles/liquidGlass.module.css'
import { getDescriptionRole } from '../../utils/roles.ts'
import { EMPLOYEE_TYPE_LABELS } from './index.ts'
import styles from './style.module.css'

function ProfileUser() {
  const { user, loading, updateUser, uploadAvatar, getRole } = useUserStore()
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
    if (!user)
      return
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

  function setField(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file)
      return
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

  const currentRole = getDescriptionRole(getRole())
  const initials = [form.firstName?.[0], form.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?'
  const fullName = [form.lastName, form.firstName, form.patronymic].filter(Boolean).join(' ') || 'Имя не указано'

  if (loading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <div className={`${liquidGlass.wrapper} ${styles.card}`}>
      <Typography variant="h6" className={styles.sectionTitle}>Профиль</Typography>

      <div className={styles.avatar}>
        <div className={styles.avatarWrapper}>
          <Avatar
            src={avatarPreview ?? undefined}
            sx={{ width: 80, height: 80, fontSize: '1.75rem', bgcolor: 'rgba(0,120,255,0.12)', color: 'rgba(0,120,255,0.8)' }}
          >
            {!avatarPreview && initials}
          </Avatar>
          <IconButton className={styles.avatarButton} onClick={() => fileInputRef.current?.click()} size="small">
            <PhotoCameraIcon fontSize="small" />
          </IconButton>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
        </div>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>{fullName}</Typography>
          <Typography variant="body2" color="text.secondary">{form.position || 'Должность не указана'}</Typography>
        </Box>
      </div>

      <div className={styles.fields}>
        <TextField label="Имя" value={form.firstName} onChange={setField('firstName')} fullWidth className={base.field} />
        <TextField label="Фамилия" value={form.lastName} onChange={setField('lastName')} fullWidth className={base.field} />
        <TextField label="Отчество" value={form.patronymic} onChange={setField('patronymic')} fullWidth className={base.field} />
        <TextField label="Дата рождения" type="date" value={form.birthDate} onChange={setField('birthDate')} fullWidth className={base.field} InputLabelProps={{ shrink: true }} />
        <TextField label="Должность" value={form.position} onChange={setField('position')} fullWidth className={base.field} />
        <TextField select label="Тип сотрудника" value={form.employeeType} onChange={setField('employeeType')} fullWidth className={base.field}>
          {EMPLOYEE_TYPES.map(type => (
            <MenuItem key={type} value={type}>{EMPLOYEE_TYPE_LABELS[type]}</MenuItem>
          ))}
        </TextField>
        <TextField label="Email" value={form.email} fullWidth className={`${base.field} ${styles.fullWidth}`} InputProps={{ readOnly: true }} />

        {currentRole.title && currentRole.descriptionList.length && (
          <TextField
            label="Роль и права"
            value={currentRole.title}
            fullWidth
            className={`${base.field} ${styles.fullWidth}`}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip
                    title={(
                      <>
                        <div>Права пользователя:</div>
                        <ol style={{ paddingLeft: '20px', margin: '6px 0 0 0' }}>
                          {currentRole.descriptionList.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ol>
                      </>
                    )}
                    arrow
                    placement="top"
                  >
                    <IconButton edge="end" size="small" sx={{ color: 'text.secondary' }}>
                      <AnnouncementIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        )}
      </div>

      <div className={styles.actions}>
        <Button variant="contained" onClick={handleSave} disabled={loading} className={base.submitButton}>
          {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Сохранить'}
        </Button>
      </div>
    </div>
  )
}

export default ProfileUser
