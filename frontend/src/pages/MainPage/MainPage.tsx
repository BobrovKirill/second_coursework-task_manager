import { Container, Typography, Box } from '@mui/material';

const MainPage = () => {
  return (
    <Container>
      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Главная страница
        </Typography>
        <Typography variant="body1">
          Добро пожаловать!
        </Typography>
      </Box>
    </Container>
  );
};

export default MainPage;