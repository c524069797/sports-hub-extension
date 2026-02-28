import type { Match } from '../types'
import type { Locale } from '../i18n'

/** 获取浏览器本地时区 */
function getLocalTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'Asia/Shanghai'
  }
}

export function formatMatchTime(isoString: string, locale: Locale = 'zh'): string {
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString

  const tz = getLocalTimeZone()
  const now = new Date()

  // 用本地时区的日期字符串来比较"今天/明天/昨天"
  const dateDayStr = date.toLocaleDateString('en-CA', { timeZone: tz }) // YYYY-MM-DD
  const nowDayStr = now.toLocaleDateString('en-CA', { timeZone: tz })
  const tomorrowDayStr = new Date(now.getTime() + 86400000).toLocaleDateString('en-CA', { timeZone: tz })
  const yesterdayDayStr = new Date(now.getTime() - 86400000).toLocaleDateString('en-CA', { timeZone: tz })

  const localeCode = locale === 'zh' ? 'zh-CN' : 'en-US'
  const timeStr = date.toLocaleTimeString(localeCode, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: locale === 'en',
    timeZone: tz,
  })

  if (locale === 'zh') {
    if (dateDayStr === nowDayStr) return `今天 ${timeStr}`
    if (dateDayStr === tomorrowDayStr) return `明天 ${timeStr}`
    if (dateDayStr === yesterdayDayStr) return `昨天 ${timeStr}`
  } else {
    if (dateDayStr === nowDayStr) return `Today ${timeStr}`
    if (dateDayStr === tomorrowDayStr) return `Tomorrow ${timeStr}`
    if (dateDayStr === yesterdayDayStr) return `Yesterday ${timeStr}`
  }

  const dateStr = date.toLocaleDateString(localeCode, {
    month: locale === 'zh' ? 'numeric' : 'short',
    day: 'numeric',
    timeZone: tz,
  })
  return `${dateStr} ${timeStr}`
}

export function formatFullDateTime(isoString: string, locale: Locale = 'zh'): string {
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString

  const localeCode = locale === 'zh' ? 'zh-CN' : 'en-US'
  return date.toLocaleString(localeCode, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: locale === 'en',
    timeZone: getLocalTimeZone(),
  })
}

export function getStatusText(match: Match, locale: Locale = 'zh'): string {
  if (match.extra?.statusText != null) return String(match.extra.statusText)

  switch (match.status) {
    case 'live':
      return locale === 'zh' ? '进行中' : 'Live'
    case 'finished':
      return locale === 'zh' ? '已结束' : 'Finished'
    case 'upcoming':
      return formatMatchTime(match.startTime, locale)
    default:
      return ''
  }
}

export function getStatusColor(status: Match['status']): string {
  switch (status) {
    case 'live':
      return '#ef4444'
    case 'finished':
      return '#6b7280'
    case 'upcoming':
      return '#3b82f6'
    default:
      return '#6b7280'
  }
}
