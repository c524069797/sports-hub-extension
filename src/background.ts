import { fetchAllMatches } from './services/api'
import { getSettings, getFavorites, getNotifiedMatchIds, addNotifiedMatchId, clearOldNotifiedIds, getCachedMatches } from './services/storage'
import { zhTranslations } from './i18n/zh'
import { enTranslations } from './i18n/en'
import type { Match, SportType, FavoriteItem } from './types'

// 定时刷新数据
const ALARM_NAME = 'sports-hub-refresh'

async function setupAlarm() {
  const settings = await getSettings()
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: settings.refreshInterval,
  })
}

function isFollowedMatch(match: Match, favorites: FavoriteItem[]): boolean {
  // Check if this specific match is favorited
  const matchFavorited = favorites.some(
    (f) => f.type === 'match' && f.id === match.id && f.sportType === match.sportType
  )
  if (matchFavorited) return true

  // Check if either team is favorited
  const teamFavorited = favorites.some(
    (f) =>
      f.type === 'team' &&
      f.sportType === match.sportType &&
      (f.name === match.homeTeam || f.name === match.awayTeam)
  )
  return teamFavorited
}

async function checkAndNotifyFinishedMatches(): Promise<void> {
  const settings = await getSettings()
  if (!settings.enableNotifications) return

  const favorites = await getFavorites()
  if (favorites.length === 0) return

  const notifiedIds = await getNotifiedMatchIds()
  const notifiedSet = new Set(notifiedIds)

  const translations = settings.language === 'zh' ? zhTranslations : enTranslations

  const sportTypes: SportType[] = ['nba', 'football', 'esports']
  const allMatches: Match[] = []

  for (const sport of sportTypes) {
    const matches = await getCachedMatches(sport)
    allMatches.push(...matches)
  }

  const allMatchIds = allMatches.map((m) => m.id)

  for (const match of allMatches) {
    if (match.status !== 'finished') continue
    if (notifiedSet.has(match.id)) continue
    if (!isFollowedMatch(match, favorites)) continue

    const message = translations.settings.matchFinishedBody
      .replace('{home}', match.homeTeam)
      .replace('{away}', match.awayTeam)
      .replace('{homeScore}', String(match.homeScore ?? 0))
      .replace('{awayScore}', String(match.awayScore ?? 0))

    chrome.notifications.create(`match-finished-${match.id}`, {
      type: 'basic',
      iconUrl: 'images/icon-128.png',
      title: translations.settings.matchFinished,
      message,
    })

    await addNotifiedMatchId(match.id)
  }

  // Clean up old notified IDs that are no longer in current data
  await clearOldNotifiedIds(allMatchIds)
}

// 安装/启动时设置
chrome.runtime.onInstalled.addListener(() => {
  setupAlarm()
  // 首次安装时预加载数据
  fetchAllMatches()
    .then(() => checkAndNotifyFinishedMatches())
    .catch(console.error)
})

// 处理定时任务
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    try {
      await fetchAllMatches()
      await checkAndNotifyFinishedMatches()
    } catch (error) {
      console.error('Background fetch failed:', error)
    }
  }
})

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'REFRESH_DATA') {
    fetchAllMatches()
      .then(async (data) => {
        await checkAndNotifyFinishedMatches()
        sendResponse({ success: true, data })
      })
      .catch((error) => sendResponse({ success: false, error: String(error) }))
    return true // 表示异步响应
  }

  if (message.type === 'UPDATE_ALARM') {
    setupAlarm()
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: String(error) }))
    return true
  }

  // 代理新浪财经请求（用 GBK 解码）
  if (message.type === 'FETCH_SINA') {
    const list = message.list as string
    fetch(`https://hq.sinajs.cn/rn=${Date.now()}&list=${list}`)
      .then((resp) => resp.ok ? resp.arrayBuffer() : new ArrayBuffer(0))
      .then((buf) => {
        const text = new TextDecoder('gbk').decode(buf)
        sendResponse({ text })
      })
      .catch(() => sendResponse({ text: '' }))
    return true
  }
})
