import type { User } from '../../types/user.ts'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useAlertModal } from '../../components/AlertModal'
import { useUserStore } from '../../store/useUserStory'
import base from '../../styles/formBase.module.css'
import liquidGlass from '../../styles/liquidGlass.module.css'
import { getDescriptionRole } from '../../utils/roles.ts'
import styles from './style.module.css'

function ProfileUser() {
  const { user, loading, updateUser, uploadAvatar } = useUserStore()
  const { showAlertModal } = useAlertModal()
  const { getRole } = useUserStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    patronymic: '',
    birthDate: '',
    email: '',
  })

  const [avatar, setAvatar] = useState<string | null>(null)

  useEffect(() => {
    if (!user)
      return
    setForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      patronymic: user.patronymic ?? '',
      birthDate: user.birthDate ?? '',
      email: user.email ?? '',
    })
    setAvatar(user.avatar ?? null)
  }, [user])

  const currentRole = getDescriptionRole(getRole())

  function setField(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    setAvatar(URL.createObjectURL(file))

    try {
      const url = await uploadAvatar(file)
      setAvatar(url)
    }
    catch {
      showAlertModal({ title: 'Ошибка', message: 'Не удалось загрузить аватар' })
      setAvatar(user?.avatar ?? null)
    }
  }

  async function handleSave() {
    try {
      await updateUser({ ...form, avatar } as Partial<User>)
      showAlertModal({ title: 'Сохранено', message: 'Профиль обновлён', type: 'success' })
    }
    catch {
      showAlertModal({ title: 'Ошибка', message: 'Не удалось сохранить профиль' })
    }
  }

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
            src={avatar ?? undefined}
            sx={{ width: 80, height: 80, fontSize: '1.75rem', bgcolor: 'rgba(0,120,255,0.12)', color: 'rgba(0,120,255,0.8)' }}
          >
            {!avatar && initials}
          </Avatar>
          <IconButton className={styles.avatarButton} onClick={() => fileInputRef.current?.click()} size="small">
            <PhotoCameraIcon fontSize="small" />
          </IconButton>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
        </div>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>{fullName}</Typography>
          <Typography variant="body2" color="text.secondary">{currentRole.title || 'Должность не указана'}</Typography>
        </Box>
      </div>

      <div className={styles.fields}>
        <TextField label="Имя" value={form.firstName} onChange={setField('firstName')} fullWidth className={base.field} />
        <TextField label="Фамилия" value={form.lastName} onChange={setField('lastName')} fullWidth className={base.field} />
        <TextField label="Отчество" value={form.patronymic} onChange={setField('patronymic')} fullWidth className={base.field} />
        <TextField label="Дата рождения" type="date" value={form.birthDate} onChange={setField('birthDate')} fullWidth className={base.field} InputLabelProps={{ shrink: true }} />
        <TextField label="Email" value={form.email} fullWidth className={`${base.field} ${styles.fullWidth}`} InputProps={{ readOnly: true }} />
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
