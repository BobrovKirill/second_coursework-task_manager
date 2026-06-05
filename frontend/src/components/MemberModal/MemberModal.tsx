import type { User } from '../../types/user.ts'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import useApi, { type ApiErrorResponse } from '../../hooks/useApi'
import { useMembersStore } from '../../store/useMemberStore.ts'
import { useUserStore } from '../../store/useUserStory.ts'
import liquidGlass from '../../styles/liquidGlass.module.css'
import { useAlertModal } from '../AlertModal'
import FieldRole from '../FiedRole/FieldRole.tsx'
import FiledSpecialty from '../FiledSpecialty/FiledSpecialty.tsx'
import styles from './style.module.css'

interface AddMemberModalProps {
  projectId: number
  open: boolean
  onClose: () => void
  onAdded?: () => void
}

interface SpecialtyFormValue {
  value: string | number
  hexColor: string | null
}

interface InviteForm {
  email: string
  role: string
  specialty: SpecialtyFormValue
}

const EMPTY_SPECIALTY: SpecialtyFormValue = { value: '', hexColor: null }
const DEFAULT_INVITE_FORM: InviteForm = {
  email: '',
  role: 'executor',
  specialty: EMPTY_SPECIALTY,
}

function MemberModal({ projectId, open, onClose, onAdded }: AddMemberModalProps) {
  const api = useApi()
  const { showAlertModal } = useAlertModal()
  const { getRole } = useUserStore()
  const { addMember, fetchMembers } = useMembersStore()

  const [tab, setTab] = useState(0)
  const [results, setResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)
  const [newMembers, setMewMembers] = useState<Record<number, any>>({})
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [addUserLoading, setAddUserLoading] = useState(false)

  const isAdmin = getRole() === 'admin'

  const [inviteForm, setInviteForm] = useState<InviteForm>(DEFAULT_INVITE_FORM)
  const [inviteErrors, setInviteErrors] = useState<{ email?: string, role?: string }>({})
  const [inviteLoading, setInviteLoading] = useState(false)

  const getRoleValue = (role: unknown) => {
    if (typeof role === 'string') {
      return role
    }

    if (role && typeof role === 'object' && 'name' in role) {
      return String(role.name)
    }

    return ''
  }

  const getSpecialtyValue = (specialty: SpecialtyFormValue) => {
    if (!specialty.value) {
      return null
    }

    return Number(specialty.value)
  }

  async function handleSearch() {
    setSearching(true)
    try {
      const params = new URLSearchParams()
      params.append('project_id', projectId.toString())

      if (email) {
        params.append('email', email)
      }

      if (fullName) {
        params.append('full_name', fullName)
      }

      const data = await api.get(`/users/search?${params.toString()}`)
      setResults(data)
    }
    finally {
      setSearching(false)
    }
  }

  function updateForm(userId: number, field: 'role' | 'specialty', value: string | SpecialtyFormValue) {
    setMewMembers(prev => ({ ...prev, [userId]: { ...prev[userId], [field]: value } }))
  }

  async function handleAdd(user: User) {
    try {
      setAddUserLoading(true)
      const form = newMembers[user.id] || { role: 'executor', specialty: EMPTY_SPECIALTY }
      const newMember = await api.post(`/projects/${projectId}/members/${user.id}`, {
        role: form.role,
        specialty: getSpecialtyValue(form.specialty),
      })
      setResults(prev => prev.filter(u => u.id !== user.id))
      showAlertModal({ title: 'Пользователь', message: 'добавлен в команду проекта', type: 'success' })
      setEmail('')
      setEmail('')

      addMember(projectId, newMember)
      onAdded?.()
    }
    catch (error: ApiErrorResponse | unknown) {
      const message = (error as ApiErrorResponse)?.message || 'Не удалось добавить пользователя'
      showAlertModal({ title: 'Ошибка', message })
    }
    finally {
      setAddUserLoading(false)
    }
  }

  const updateInviteForm = (field: keyof InviteForm, value: string | SpecialtyFormValue) => {
    setInviteForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleInvite() {
    const errors: { email?: string, role?: string } = {}

    if (!inviteForm.email) {
      errors.email = 'Введите email'
    }
    else if (!/\S[^\s@]*@\S+\.\S+/.test(inviteForm.email)) {
      errors.email = 'Некорректный email'
    }

    if (!inviteForm.role) {
      errors.role = 'Выберите роль'
    }

    setInviteErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    setInviteLoading(true)
    try {
      const response = await api.post(`/projects/${projectId}/invitations`, {
        email: inviteForm.email,
        role: inviteForm.role,
        specialty: getSpecialtyValue(inviteForm.specialty),
      })

      showAlertModal({
        title: 'Приглашение',
        message: response.message || 'Приглашение отправлено',
        type: 'success',
      })
      setInviteForm(DEFAULT_INVITE_FORM)
      setInviteErrors({})
      void fetchMembers(projectId)
    }
    catch (error: ApiErrorResponse | unknown) {
      const message = (error as ApiErrorResponse)?.message || 'Не удалось отправить приглашение'
      showAlertModal({ title: 'Ошибка', message })
    }
    finally {
      setInviteLoading(false)
    }
  }

  function handleClose() {
    setResults([])
    setInviteForm(DEFAULT_INVITE_FORM)
    setInviteErrors({})
    setTab(0)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        className: liquidGlass.wrapper,
        sx: { background: 'transparent', zIndex: 9999 },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(4px)',
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Добавить участника
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Поиск" />
          <Tab label="Пригласить по email" />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
              <TextField
                label="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="ФИО (полное или частично)"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                fullWidth
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={searching || (!email && !fullName)}
                startIcon={searching ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SearchIcon />}
              >
                Найти
              </Button>
            </Box>

            {!searching && results.length === 0 && (email || fullName) && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Пользователи не найдены
              </Typography>
            )}

            {results.map((user: User) => {
              return (
                <Box key={user.id} sx={{ marginTop: '24px', opacity: addUserLoading ? '0.5' : '1' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1.5 }}>
                    <Avatar
                      src={user.avatar ?? undefined}
                      sx={{ width: 40, height: 40, bgcolor: 'rgba(0,120,255,0.12)', color: 'rgba(0,120,255,0.8)' }}
                    >
                      {user.firstName?.[0] ?? user.username[0].toUpperCase()}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2">
                        {[user.lastName, user.firstName, user.patronymic].filter(Boolean).join(' ') || user.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{user.email}</Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <FieldRole
                          value={newMembers?.[user.id]?.role || ''}
                          readOnly={!isAdmin}
                          onChange={role => updateForm(user.id, 'role', getRoleValue(role))}
                        />

                        <FiledSpecialty
                          projectId={projectId}
                          data={newMembers?.[user.id]?.specialty || { value: '', hexColor: null }}
                          readOnly={!isAdmin}
                          onChange={specialty => updateForm(user.id, 'specialty', specialty)}
                        />

                        <Button
                          color="success"
                          variant="contained"
                          disabled={addUserLoading || searching}
                          onClick={async () => handleAdd(user)}
                          sx={{ width: '100%', marginTop: '8px' }}
                        >
                          {searching
                            ? <CircularProgress size={20} />
                            : 'Добавить в проект'}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                  <Divider />
                </Box>
              )
            })}
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              value={inviteForm.email}
              onChange={e => updateInviteForm('email', e.target.value)}
              error={!!inviteErrors.email}
              helperText={inviteErrors.email}
              fullWidth
            />

            <FieldRole
              value={inviteForm.role}
              readOnly={!isAdmin}
              onChange={role => updateInviteForm('role', getRoleValue(role))}
            />
            {inviteErrors.role && (
              <Typography variant="caption" color="error">
                {inviteErrors.role}
              </Typography>
            )}

            <FiledSpecialty
              projectId={projectId}
              data={inviteForm.specialty}
              readOnly={!isAdmin}
              onChange={specialty => updateInviteForm('specialty', specialty)}
            />

            <Button
              variant="contained"
              onClick={handleInvite}
              disabled={inviteLoading || !inviteForm.email}
              className={styles.submitButton}
            >
              {inviteLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Отправить приглашение'}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default MemberModal
