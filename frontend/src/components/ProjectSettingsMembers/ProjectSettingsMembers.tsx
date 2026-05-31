import type { MembersSettingsProps } from '../../pages/ProjectSettingsPage'
import type { ProjectMember } from '../../types/project'
import type { MemberType } from '../../utils/members.ts'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import useApi from '../../hooks/useApi.ts'
import { useMembersStore } from '../../store/useMemberStore.ts'
import { useSpecialtiesStore } from '../../store/useSpecialtyStore.ts'
import { useUserStore } from '../../store/useUserStory.ts'
import liquidGlass from '../../styles/liquidGlass.module.css'
import FieldRole from '../FiedRole/FieldRole.tsx'
import FiledSpecialty from '../FiledSpecialty/FiledSpecialty.tsx'
import MemberModal from '../MemberModal/MemberModal.tsx'
import styles from './styles.module.css'

function MembersSettings({ projectId }: MembersSettingsProps) {
  const { getMembers, fetchMembers, loading: membersLoading, addMember, updateMember, deleteMember } = useMembersStore()
  const { getSpecialties, fetchSpecialties } = useSpecialtiesStore()
  const api = useApi()
  const { user, getRole } = useUserStore()

  const members = getMembers(projectId)
  const specialties = getSpecialties(projectId)

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)

  const isAdmin = getRole() === 'admin'

  useEffect(() => {
    if (members.length === 0) {
      void fetchMembers(projectId)
    }

    if (specialties.length === 0) {
      void fetchSpecialties(projectId)
    }
  }, [projectId])

  async function handleRemoveMember(memberId: number) {
    try {
      await api.delete(`/projects/${projectId}/members/${memberId}`)
      void deleteMember(projectId, memberId)
    }
    catch (e) {
      console.error(e)
    }
  }

  const truncateUsername = (username: string, maxLength = 30) => {
    if (username.length <= maxLength)
      return username
    return `${username.substring(0, maxLength).trim()}...`
  }

  async function handleUser(userId: number, field: 'role' | 'speciality', data: string) {
    const value = field === 'role' ? data : data.value

    try {
      const updated: MemberType = await api.put(`/projects/${projectId}/members/${userId}/${field}`, { [field]: value || null })
      await updateMember(projectId, updated)
    }
    catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      <Accordion className={liquidGlass.card} sx={{ marginBottom: '24px', padding: '24px 24px 32px' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          id="panel1-header"
        >
          <Typography variant="h6" className={styles.sectionTitle}>
            Участников на проекте -
            {' '}
            {members.length ? `${members.length} ` : ''}
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Box className={styles.sectionHeader}>
            <Button variant="outlined" startIcon={<PersonAddIcon />} onClick={() => setIsAddMemberOpen(true)} size="small">
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
                  {members.length === 0
                    ? (
                        <Box className={styles.emptyState}>
                          <Typography variant="body2" color="text.secondary">Нет участников</Typography>
                        </Box>
                      )
                    : members.map((item: ProjectMember) => {
                        const memberUser = item.member
                        const memberSpecialty = item.specialty

                        return (
                          <Box
                            key={memberUser.id}
                            className={styles.memberItem}
                            sx={{
                              borderLeft: memberSpecialty
                                ? `4px solid ${memberSpecialty.hex_color}`
                                : '4px solid transparent',
                            }}
                          >
                            <Typography className={styles.memberName} title={memberUser?.username || ''}>
                              {truncateUsername(memberUser?.username)}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                                <FieldRole
                                  value={item?.role || ''}
                                  readOnly={!isAdmin}
                                  onChange={async role => handleUser(memberUser.id, 'role', role)}
                                />

                                <FiledSpecialty
                                  projectId={projectId}
                                  data={{ value: memberSpecialty?.id } || { value: '' }}
                                  readOnly={!isAdmin}
                                  onChange={async specialty => handleUser(memberUser.id, 'specialty', specialty)}
                                />
                              </Box>

                              <Box className={styles.Avatar}>
                                <Avatar
                                  src={memberUser.avatar ?? undefined}
                                  sx={{ width: 100, height: 100, bgcolor: 'rgba(0,120,255,0.12)', color: 'rgba(0,120,255,0.8)' }}
                                />
                              </Box>
                            </Box>

                            {(isAdmin && (memberUser.id !== user.id)) && (
                              <Button size="small" color="error" className={styles.deleteButton} onClick={async () => handleRemoveMember(memberUser.id)}>
                                Удалить из проекта
                              </Button>
                            )}
                          </Box>

                        )
                      })}
                </Box>
              )}
        </AccordionDetails>
      </Accordion>

      <MemberModal
        projectId={projectId}
        open={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAdded={() => {}}
      />
    </>
  )
}

export default MembersSettings
