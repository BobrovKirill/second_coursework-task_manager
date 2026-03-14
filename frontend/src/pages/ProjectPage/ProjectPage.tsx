import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useProject } from '../../hooks/useProject';
import { ROUTES } from '../../constants/routes';
import styles from './styles.module.css';

const ProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = Number(id);
  
  const { project, loading, error } = useProject(projectId);

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    if (newValue === 'board') {
      navigate(ROUTES.PROJECT_BOARD(projectId));
    } else {
      navigate(ROUTES.PROJECT_MEMBERS(projectId));
    }
  };

  const currentTab = location.pathname.includes('/members') ? 'members' : 'board';

  if (loading) {
    return (
      <Container maxWidth="xl" className={styles.container}>
        <Box className={styles.loadingContainer}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="xl" className={styles.container}>
        <Alert severity="error" className={styles.errorAlert}>
          Проект не найден или у вас нет доступа к нему
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Paper className={styles.projectHeader}>
        <Typography variant="h4" className={styles.projectName}>
          {project.name}
        </Typography>
        {project.description && (
          <Typography variant="body1" color="text.secondary">
            {project.description}
          </Typography>
        )}
      </Paper>

      <Box className={styles.tabsContainer}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab value="board" label="Доска" />
          <Tab value="members" label="Участники" />
        </Tabs>
      </Box>

      <Outlet context={{ project }} />
    </Container>
  );
};

export default ProjectPage;