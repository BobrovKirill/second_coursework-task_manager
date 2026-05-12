import { useMemo } from 'react'
import type { BackgroundType } from '../types/project'
import defaultBg from '../assets/images/layout_bg.jpg'

interface ProjectBackgroundStyle {
  backgroundImage?: string
  backgroundColor?: string
  backgroundSize?: string
  backgroundPosition?: string
  backgroundRepeat?: string
}

export function useProjectBackground(
  backgroundType: BackgroundType = 'default',
  backgroundValue: string | null = null
): ProjectBackgroundStyle {
  return useMemo(() => {
    if (backgroundType === 'default' || backgroundType === 'image' && !backgroundValue) {
      return {
        backgroundImage: `url(${defaultBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    }

    if (backgroundType === 'color' && backgroundValue) {
      return {
        backgroundColor: backgroundValue,
      }
    }

    if (backgroundType === 'gradient' && backgroundValue) {
      const [color1, color2, angle] = backgroundValue.split('|')
      return {
        backgroundImage: `linear-gradient(${angle || 90}deg, ${color1}, ${color2})`,
      }
    }

    if (backgroundType === 'image') {
      return {
        backgroundImage: `url(${defaultBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    }

    return {
      backgroundImage: `url(${defaultBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }, [backgroundType, backgroundValue])
}