// Shared date utilities
export const parseIsoDate = (v) => {
  if (!v) return new Date()
  if (v instanceof Date) return v
  try {
    const s = String(v)
    // already has 'Z' or timezone offset like +08:00 or -07:00
    if (s.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(s)) {
      return new Date(s)
    }

    // common non-ISO format from some backends: "YYYY-MM-DD HH:MM:SS"
    // convert to ISO by replacing space with 'T' and append 'Z' (treat as UTC)
    // also handle millisecond precision
    const spaceDateMatch = s.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/)
    if (spaceDateMatch) {
      return new Date(s.replace(' ', 'T') + 'Z')
    }

    // If string contains 'T' but no timezone, assume UTC
    if (s.includes('T')) {
      return new Date(s + 'Z')
    }

    // Fallback: try Date constructor
    return new Date(s)
  } catch {
    return new Date(v)
  }
}

export const formatTime = (timestamp) => {
  const date = parseIsoDate(timestamp)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

export default { parseIsoDate, formatTime }
