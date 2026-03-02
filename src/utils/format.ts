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

/** 本地时区 HH:MM */
function toLocalTime(isoString: string, locale: Locale): string {
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString
  const tz = getLocalTimeZone()
  const localeCode = locale === 'zh' ? 'zh-CN' : 'en-US'
  return date.toLocaleTimeString(localeCode, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: locale === 'en',
    timeZone: tz,
  })
}

/** 根据 YYYY-MM-DD 日期 key 生成 "昨天/今天/明天" 或日期字符串 */
function dayLabel(dateKey: string, locale: Locale): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const todayKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const yd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  const yesterdayKey = `${yd.getFullYear()}-${pad(yd.getMonth() + 1)}-${pad(yd.getDate())}`
  const td = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const tomorrowKey = `${td.getFullYear()}-${pad(td.getMonth() + 1)}-${pad(td.getDate())}`

  if (locale === 'zh') {
    if (dateKey === todayKey) return '今天'
    if (dateKey === yesterdayKey) return '昨天'
    if (dateKey === tomorrowKey) return '明天'
  } else {
    if (dateKey === todayKey) return 'Today'
    if (dateKey === yesterdayKey) return 'Yesterday'
    if (dateKey === tomorrowKey) return 'Tomorrow'
  }

  const [y, m, d] = dateKey.split('-').map(Number)
  const localeCode = locale === 'zh' ? 'zh-CN' : 'en-US'
  return new Date(y, m - 1, d).toLocaleDateString(localeCode, {
    month: locale === 'zh' ? 'numeric' : 'short',
    day: 'numeric',
  })
}

/**
 * 格式化比赛时间
 * @param gameDate 可选，数据源标记的本地日期 key (YYYY-MM-DD)，用于跨时区场景（如 NBA）
 *   有 gameDate 时，日期标签从 gameDate 推算，时间仍为浏览器本地时区 HH:MM
 *   无 gameDate 时，日期和时间都从 startTime UTC 转本地时区
 */
export function formatMatchTime(isoString: string, locale: Locale = 'zh', gameDate?: string): string {
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString

  const timeStr = toLocalTime(isoString, locale)

  if (gameDate) {
    // 日期标签从 gameDate 来（与 Tab 一致）
    const label = dayLabel(gameDate, locale)
    return `${label} ${timeStr}`
  }

  // 无 gameDate 时，从 UTC startTime 转本地时区推算日期
  const tz = getLocalTimeZone()
  const now = new Date()
  const dateDayStr = date.toLocaleDateString('en-CA', { timeZone: tz })
  const nowDayStr = now.toLocaleDateString('en-CA', { timeZone: tz })
  const tomorrowDayStr = new Date(now.getTime() + 86400000).toLocaleDateString('en-CA', { timeZone: tz })
  const yesterdayDayStr = new Date(now.getTime() - 86400000).toLocaleDateString('en-CA', { timeZone: tz })

  if (locale === 'zh') {
    if (dateDayStr === nowDayStr) return `今天 ${timeStr}`
    if (dateDayStr === tomorrowDayStr) return `明天 ${timeStr}`
    if (dateDayStr === yesterdayDayStr) return `昨天 ${timeStr}`
  } else {
    if (dateDayStr === nowDayStr) return `Today ${timeStr}`
    if (dateDayStr === tomorrowDayStr) return `Tomorrow ${timeStr}`
    if (dateDayStr === yesterdayDayStr) return `Yesterday ${timeStr}`
  }

  const localeCode = locale === 'zh' ? 'zh-CN' : 'en-US'
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
  const gameDate = typeof match.extra?.gameDate === 'string' ? match.extra.gameDate as string : undefined

  switch (match.status) {
    case 'live':
      if (match.extra?.statusText != null) return String(match.extra.statusText)
      return locale === 'zh' ? '进行中' : 'Live'
    case 'finished':
      return locale === 'zh' ? '已结束' : 'Final'
    case 'upcoming':
      return formatMatchTime(match.startTime, locale, gameDate)
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
