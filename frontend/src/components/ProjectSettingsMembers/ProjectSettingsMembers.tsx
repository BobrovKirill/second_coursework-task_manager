import type { ProjectMember } from '../../types/project'
import type { ProjectSpecialty } from '../../types/projectSpecialty'
import BadgeIcon from '@mui/icons-material/Badge'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import styles from './styles.module.css'

interface MembersSettingsProps {
  members: ProjectMember[]
  loading: boolean
  specialties: ProjectSpecialty[]
  canAssignRole: boolean
  onAddMember: () => void
  onRemoveMember: (memberId: number) => void
  onAssignRole: (memberId: number) => void
  onAssignSpecialty: (memberId: number, specialtyId: number | null) => void
}

function MembersSettings({
  members,
  loading,
  specialties,
  canAssignRole,
  onAddMember,
  onRemoveMember,
  onAssignRole,
  onAssignSpecialty,
}: MembersSettingsProps) {
  const [specialtyMenuAnchor, setSpecialtyMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)

  const handleMemberSpecialtyClick = (event: React.MouseEvent<HTMLElement>, memberId: number) => {
    setSpecialtyMenuAnchor(event.currentTarget)
    setSelectedMemberId(memberId)
  }

  const handleMemberSpecialtySelect = (specialtyId: number | null) => {
    if (selectedMemberId !== null) {
      onAssignSpecialty(selectedMemberId, specialtyId)
    }
    setSpecialtyMenuAnchor(null)
    setSelectedMemberId(null)
  }

  const truncateUsername = (username: string, maxLength: number = 30) => {
    if (username.length <= maxLength)
      return username
    return `${username.substring(0, maxLength).trim()}...`
  }

  return (
    <>
      <Paper className={styles.section}>
        <Box className={styles.sectionHeader}>
          <Typography variant="h6" className={styles.sectionTitle}>
            Участники
          </Typography>
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={onAddMember}
            size="small"
          >
            Добавить участника
          </Button>
        </Box>

        {loading
          ? (
              <Box className={styles.loadingContainer}>
                <CircularProgress size={24} />
              </Box>
            )
          : (
              <Box className={styles.membersList}>
                {members.map((member) => {
                  const memberUser = member.user
                  const memberSpecialty = member.specialty

                  return (
                    <Box
                      key={memberUser.id}
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
                          title={memberUser.username}
                        >
                          {truncateUsername(memberUser.username)}
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
                        {member.role && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'primary.main',
                              fontSize: '0.7rem',
                              display: 'block',
                              mt: 0.25,
                              fontWeight: 500,
                            }}
                          >
                            {member.role}
                          </Typography>
                        )}
                      </Box>

                      <Box className={styles.memberActions}>
                        {canAssignRole && (
                          <Tooltip title="Роль" arrow>
                            <IconButton
                              size="small"
                              onClick={() => onAssignRole(memberUser.id)}
                              className={styles.actionButton}
                            >
                              <BadgeIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        <Tooltip title="Специальность" arrow>
                          <IconButton
                            size="small"
                            onClick={e => handleMemberSpecialtyClick(e, memberUser.id)}
                            className={styles.actionButton}
                          >
                            <WorkOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Удалить участника" arrow>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onRemoveMember(memberUser.id)}
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
                  <Box className={styles.emptyState}>
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
        <MenuItem onClick={() => handleMemberSpecialtySelect(null)}>
          <Typography color="text.secondary">Без специальности</Typography>
        </MenuItem>
        {specialties.map(specialty => (
          <MenuItem
            key={specialty.id}
            onClick={() => handleMemberSpecialtySelect(specialty.id)}
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
    </>
  )
}

export default MembersSettings
