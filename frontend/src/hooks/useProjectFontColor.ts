import { createTheme } from '@mui/material'
import { useMemo } from 'react'

export function useProjectFontColor(fontColor: string = '#000000') {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          text: {
            primary: fontColor,
            secondary: `${fontColor}99`,
          },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
      }),
    [fontColor],
  )

  return theme
}
