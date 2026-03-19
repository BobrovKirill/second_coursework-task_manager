import { Outlet, useParams} from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useProject } from '../../hooks/useProject';
import styles from './styles.module.css';

const ProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  
  const { project, loading, error } = useProject(projectId);

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
      <Outlet context={{ project }} />
    </Container>
  );
};

export default ProjectPage;