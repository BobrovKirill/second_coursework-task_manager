export function formatCommentDate(dateString: string): string {
  if (!dateString) return 'Дата не указана'
  
  try {
    const utcDateString = dateString.endsWith('Z') || dateString.includes('+') 
      ? dateString 
      : dateString + 'Z'
    
    const date = new Date(utcDateString)
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString)
      return 'Некорректная дата'
    }
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'только что'
    if (diffMins < 60) return `${diffMins} мин. назад`
    if (diffHours < 24) return `${diffHours} ч. назад`
    if (diffDays < 7) return `${diffDays} дн. назад`

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    if (date.getFullYear() === now.getFullYear()) {
      return `${day}.${month} в ${hours}:${minutes}`
    }

    return `${day}.${month}.${year} в ${hours}:${minutes}`
  } catch (error) {
    console.error('Error formatting date:', dateString, error)
    return 'Некорректная дата'
  }
}

export function formatFullDate(dateString: string): string {
  if (!dateString) return ''
  
  try {
    const utcDateString = dateString.endsWith('Z') || dateString.includes('+') 
      ? dateString 
      : dateString + 'Z'
    
    const date = new Date(utcDateString)
    
    if (isNaN(date.getTime())) return ''
    
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${day}.${month}.${year} в ${hours}:${minutes}`
  } catch {
    return ''
  }
}