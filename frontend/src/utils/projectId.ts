export function getStoredLastProjectId(): number | null {
  try {
    const stored = localStorage.getItem('lastProjectId')
    if (stored) {
      const id = Number.parseInt(stored, 10)
      if (!isNaN(id)) {
        document.cookie = `lastProjectId=${id}; path=/; max-age=604800; samesite=strict`
        return id
      }
    }

    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'lastProjectId' && value) {
        const id = Number.parseInt(value, 10)
        if (!isNaN(id)) {
          return id
        }
      }
    }
  }
  catch (e) {
    console.error('Failed to read lastProjectId:', e)
  }
  return null
}

export function saveLastProjectId(projectId: number | null) {
  try {
    if (projectId) {
      localStorage.setItem('lastProjectId', projectId.toString())
      document.cookie = `lastProjectId=${projectId}; path=/; max-age=604800; samesite=strict; secure`
    }
    else {
      localStorage.removeItem('lastProjectId')
      document.cookie = 'lastProjectId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }
  catch (e) {
    console.error('Failed to save lastProjectId:', e)
  }
}

export function deleteLastProjectId() {
  try {
    localStorage.removeItem('lastProjectId')
    document.cookie = 'lastProjectId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict; secure'
  }
  catch (e) {
    console.error('Failed to remove lastProjectId:', e)
  }
}
