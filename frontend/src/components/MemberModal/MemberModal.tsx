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
import useApi from '../../hooks/useApi'
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

function MemberModal({ projectId, open, onClose, onAdded }: AddMemberModalProps) {
  const api = useApi()
  const { showAlertModal } = useAlertModal()
  const { getRole } = useUserStore()
  const { addMember } = useMembersStore()

  const [tab, setTab] = useState(0)
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [newMembers, setMewMembers] = useState<Record<number, any>>({})
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [addUserLoading, setAddUserLoading] = useState(false)

  const isAdmin = getRole() === 'admin'

  const [inviteEmail, setInviteEmail] = useState('')

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

  function updateForm(userId: number, field: 'role' | 'speciality', value: string) {
    setMewMembers(prev => ({ ...prev, [userId]: { ...prev[userId], [field]: value } }))
  }

  async function handleAdd(user) {
    try {
      setAddUserLoading(true)
      const form = newMembers[user.id]
      const newMember = await api.post(`/projects/${projectId}/members/${user.id}`, { role: form.role, specialty: form.specialty?.value || null })
      setResults(prev => prev.filter(u => u.id !== user.id))
      showAlertModal({ title: 'Пользователь', message: 'добавлен в команду проекта', type: 'success' })
      setEmail('')
      setEmail('')

      addMember(projectId, newMember)
      onAdded?.()
    }
    catch (error) {
      console.log(error)
      showAlertModal({ title: 'Ошибка', message: error.message })
    }
    finally {
      setAddUserLoading(false)
    }
  }

  function handleInvite() {
    // заглушка
    console.log('invite', inviteEmail)
  }

  function handleClose() {
    setResults([])
    setInviteEmail('')
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
                          onChange={role => updateForm(user.id, 'role', role)}
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
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleInvite}
              disabled={!inviteEmail}
              className={styles.submitButton}
            >
              Отправить приглашение
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default MemberModal
