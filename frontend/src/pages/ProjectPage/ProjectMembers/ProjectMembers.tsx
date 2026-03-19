import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Avatar,
  Chip,
} from '@mui/material';
import { PersonAdd, Person } from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';
import { useProjectMembers } from '../../../hooks/useProjectMembers';
import { useUserStore } from '../../../store/useUserStory';
import type { Project } from '../../../types/project';
import { useEffect } from 'react';
import styles from './styles.module.css';

const ProjectMembers = () => {
  const { id } = useParams<{ id: string }>();
  const { project } = useOutletContext<{ project: Project }>();
  const projectId = Number(id);

  const { user: currentUser, loading: loadingUser, fetchUser } = useUserStore();
  
  const { members, loading, addMember, removeMember } = useProjectMembers(projectId);
  
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    memberId: number;
  } | null>(null);

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      fetchUser();
    }
  }, [currentUser, fetchUser]);

  const isOwner = project?.owner_id === currentUser?.id;

  if (loadingUser) {
    return <div>Загрузка информации о пользователе...</div>;
  }

  const handleContextMenu = (event: React.MouseEvent, memberId: number) => {
    event.preventDefault();
    
    if (isOwner && memberId !== project?.owner_id) {
      setContextMenu({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4,
        memberId,
      });
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleRemoveMember = async () => {
    if (!contextMenu) return;
    
    try {
      await removeMember(contextMenu.memberId);
      handleCloseContextMenu();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleAddMember = async () => {
    if (!userId) return;
    
    setIsInviting(true);
    setInviteError('');
    
    try {
      await addMember(parseInt(userId));
      setInviteDialogOpen(false);
      setUserId('');
    } catch (error: any) {
      setInviteError(
        error?.message || 'Не удалось добавить участника.'
      );
    } finally {
      setIsInviting(false);
    }
  };

  if (loading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h5" className={styles.title}>
          Участники проекта
        </Typography>
        
        {isOwner && (
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setInviteDialogOpen(true)}
            className={styles.addButton}
          >
            Добавить участника
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        {members.map((member) => (
          <Grid
            key={member.id}
            size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}
          >
            <Card 
              onContextMenu={(e) => handleContextMenu(e, member.id)}
              className={`${styles.memberCard} ${isOwner && member.id !== project?.owner_id ? styles.interactive : ''}`}
            >
              <CardContent className={styles.memberCardContent}>
                {member.id === project?.owner_id && (
                  <Chip
                    label="Владелец"
                    size="small"
                    color="primary"
                    className={styles.ownerChip}
                  />
                )}
                
                <Avatar 
                  className={styles.avatar}
                  sx={{ 
                    bgcolor: member.id === project?.owner_id ? 'primary.main' : 'grey.400'
                  }}
                >
                  <Person />
                </Avatar>
                
                <Typography variant="h6" className={styles.username} noWrap>
                  {member.username}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" noWrap>
                  {member.email}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem 
          onClick={handleRemoveMember}
          className={styles.deleteMenuItem}
        >
          Удалить из проекта
        </MenuItem>
      </Menu>

      <Dialog 
        open={inviteDialogOpen} 
        onClose={() => setInviteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        classes={{ paper: styles.dialog }}
      >
        <DialogTitle className={styles.dialogTitle}>
          Добавить участника
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <Typography variant="body2" color="text.secondary" className={styles.dialogHint}>
            Введите ID пользователя, которого хотите добавить в проект
          </Typography>
          
          <TextField
            autoFocus
            label="ID пользователя"
            type="number"
            fullWidth
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={isInviting}
            error={!!inviteError}
            helperText={inviteError}
            inputProps={{ min: 1 }}
            className={styles.userIdField}
          />
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button 
            onClick={() => setInviteDialogOpen(false)}
            disabled={isInviting}
            className={styles.cancelButton}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleAddMember}
            variant="contained"
            disabled={!userId || isInviting}
            className={styles.submitButton}
          >
            {isInviting ? 'Добавление...' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectMembers;