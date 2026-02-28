import { fetchAllMatches } from './services/api'
import { getSettings } from './services/storage'

// 定时刷新数据
const ALARM_NAME = 'sports-hub-refresh'

async function setupAlarm() {
  const settings = await getSettings()
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: settings.refreshInterval,
  })
}

// 安装/启动时设置
chrome.runtime.onInstalled.addListener(() => {
  setupAlarm()
  // 首次安装时预加载数据
  fetchAllMatches().catch(console.error)
})

// 处理定时任务
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    try {
      await fetchAllMatches()
    } catch (error) {
      console.error('Background fetch failed:', error)
    }
  }
})

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'REFRESH_DATA') {
    fetchAllMatches()
      .then((data) => sendResponse({ success: true, data }))
      .catch((error) => sendResponse({ success: false, error: String(error) }))
    return true // 表示异步响应
  }

  if (message.type === 'UPDATE_ALARM') {
    setupAlarm()
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: String(error) }))
    return true
  }
})
