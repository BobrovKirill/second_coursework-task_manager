import { Paper, Typography, Box } from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import type { Project } from '../../types/project';

const Board = () => {
  const { project } = useOutletContext<{ project: Project }>();
  
  return (
    <Paper>
      <Typography variant="h6" color="text.secondary">
        Канбан доска проекта "{project.name}"
      </Typography>
      
      <Typography color="text.secondary">
        Модуль доски находится в разработке
      </Typography>
      
      <Box>
        <Typography variant="body2" color="text.secondary">
          Здесь будет канбан доска с задачами
        </Typography>
      </Box>
    </Paper>
  );
};

export default Board;