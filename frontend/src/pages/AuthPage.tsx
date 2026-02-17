import { Box, Container, Typography } from '@mui/material';

export const AuthPage = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4">
          Авторизация
        </Typography>

        <Typography sx={{ mt: 2 }}>
          Форма авторизации
        </Typography>
      </Box>
    </Container>
  );
};