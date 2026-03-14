import type { SignModalProps } from './index.ts'
import { Box, Paper } from '@mui/material'
import styles from './style.module.css'
import liquidGlass from '../../styles/liquidGlass.module.css'

function Sign({ children }: SignModalProps) {
  return (
    <Paper elevation={0} className={`${styles.modal} ${liquidGlass.wrapper}`}>
      <Box className={styles.content}>
        {children}
      </Box>
    </Paper>
  )
}

export default Sign
