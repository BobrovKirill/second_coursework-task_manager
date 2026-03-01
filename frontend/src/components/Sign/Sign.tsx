import type { ReactNode } from 'react';
import { Paper, Box } from '@mui/material';
import styles from './style.module.css';

interface SignModalProps {
  children: ReactNode;
}

const Sign = ({ children }: SignModalProps) => {
  return (
    <Paper elevation={0} className={styles.modal}>
      <Box className={styles.content}>
        {children}
      </Box>
    </Paper>
  );
};

export default Sign;
