import type { BackgroundType } from '../../types/project'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  Box,
  Button,
  Divider,
  FormControl,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useRef } from 'react'
import styles from './styles.module.css'

interface CustomizationSettingsProps {
  fontColor: string
  backgroundType: BackgroundType
  backgroundColor: string
  gradientColor1: string
  gradientColor2: string
  gradientAngle: string
  backgroundImageUrl: string | null
  isUploadingBackground: boolean
  onFontColorChange: (value: string) => void
  onBackgroundTypeChange: (value: BackgroundType) => void
  onBackgroundColorChange: (value: string) => void
  onGradientColor1Change: (value: string) => void
  onGradientColor2Change: (value: string) => void
  onGradientAngleChange: (value: string) => void
  onBackgroundImageUpload: (file: File) => Promise<void>
  onBackgroundImageDelete: () => Promise<void>
}

function CustomizationSettings({
  fontColor,
  backgroundType,
  backgroundColor,
  gradientColor1,
  gradientColor2,
  gradientAngle,
  backgroundImageUrl,
  isUploadingBackground,
  onFontColorChange,
  onBackgroundTypeChange,
  onBackgroundColorChange,
  onGradientColor1Change,
  onGradientColor2Change,
  onGradientAngleChange,
  onBackgroundImageUpload,
  onBackgroundImageDelete,
}: CustomizationSettingsProps) {
  const backgroundInputRef = useRef<HTMLInputElement>(null)

  const handleBackgroundFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file)
      return

    try {
      await onBackgroundImageUpload(file)
    }
    finally {
      if (backgroundInputRef.current)
        backgroundInputRef.current.value = ''
    }
  }

  return (
    <Paper className={styles.section}>
      <Typography variant="h6" className={styles.sectionTitle}>
        Кастомизация
      </Typography>

      <Box className={styles.customizationGroup}>
        <Typography variant="subtitle1" className={styles.subtitle}>
          Цвет шрифта
        </Typography>
        <TextField
          type="color"
          value={fontColor}
          onChange={e => onFontColorChange(e.target.value)}
          className={styles.colorPicker}
        />
      </Box>

      <Divider className={styles.divider} />

      <Box className={styles.customizationGroup}>
        <Typography variant="subtitle1" className={styles.subtitle}>
          Тип фона
        </Typography>

        <FormControl fullWidth className={styles.selectField}>
          <Select
            value={backgroundType}
            onChange={e => onBackgroundTypeChange(e.target.value as BackgroundType)}
          >
            <MenuItem value="default">По умолчанию</MenuItem>
            <MenuItem value="color">Цвет</MenuItem>
            <MenuItem value="gradient">Градиент</MenuItem>
            <MenuItem value="image">Изображение</MenuItem>
          </Select>
        </FormControl>

        {backgroundType === 'color' && (
          <Box className={styles.backgroundConfig}>
            <Typography variant="body2" className={styles.configLabel}>
              Выберите цвет фона
            </Typography>
            <TextField
              type="color"
              value={backgroundColor}
              onChange={e => onBackgroundColorChange(e.target.value)}
              className={styles.largeColorPicker}
            />
            <TextField
              label="HEX"
              value={backgroundColor}
              onChange={e => onBackgroundColorChange(e.target.value)}
              size="small"
              className={styles.hexInput}
            />
          </Box>
        )}

        {backgroundType === 'gradient' && (
          <Box className={styles.backgroundConfig}>
            <Box className={styles.gradientColors}>
              <Box className={styles.gradientColorField}>
                <Typography variant="body2" className={styles.configLabel}>
                  Цвет 1
                </Typography>
                <TextField
                  type="color"
                  value={gradientColor1}
                  onChange={e => onGradientColor1Change(e.target.value)}
                  className={styles.colorPicker}
                />
              </Box>
              <Box className={styles.gradientColorField}>
                <Typography variant="body2" className={styles.configLabel}>
                  Цвет 2
                </Typography>
                <TextField
                  type="color"
                  value={gradientColor2}
                  onChange={e => onGradientColor2Change(e.target.value)}
                  className={styles.colorPicker}
                />
              </Box>
            </Box>
            <TextField
              label="Угол градиента (градусы)"
              type="number"
              value={gradientAngle}
              onChange={e => onGradientAngleChange(e.target.value)}
              inputProps={{ min: 0, max: 360 }}
              size="small"
              className={styles.gradientAngle}
            />
          </Box>
        )}

        {backgroundType === 'image' && (
          <Box className={styles.backgroundConfig}>
            {backgroundImageUrl
              ? (
                  <Box className={styles.bgPreviewContainer}>
                    <Box
                      component="img"
                      src={backgroundImageUrl}
                      alt="Background preview"
                      className={styles.bgPreview}
                    />
                    <Box className={styles.bgActions}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        disabled={isUploadingBackground}
                        size="small"
                      >
                        {isUploadingBackground ? 'Загрузка...' : 'Заменить'}
                        <input
                          ref={backgroundInputRef}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleBackgroundFileChange}
                        />
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={onBackgroundImageDelete}
                        disabled={isUploadingBackground}
                        size="small"
                      >
                        Удалить
                      </Button>
                    </Box>
                  </Box>
                )
              : (
                  <Box className={styles.bgUploadPlaceholder}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Изображение не загружено. Будет использован фон по умолчанию.
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      disabled={isUploadingBackground}
                    >
                      {isUploadingBackground ? 'Загрузка...' : 'Загрузить изображение'}
                      <input
                        ref={backgroundInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleBackgroundFileChange}
                      />
                    </Button>
                  </Box>
                )}
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default CustomizationSettings
