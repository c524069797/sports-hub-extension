// API Keys 配置文件模板
// 复制此文件为 api-keys.ts 并填写你的 API keys

export const API_KEYS = {
  // 足球数据 API Key
  // 获取方式：访问 https://www.football-data.org/client/register
  // 免费账户每天可以调用 10 次
  FOOTBALL_DATA_ORG: '',

  // 电竞数据 API Key
  // 获取方式：访问 https://pandascore.co/users/sign_up
  // 免费账户每月 1000 次调用
  PANDASCORE: '',
}

// 如果没有配置 API key，将使用模拟数据
export const hasFootballApiKey = () => API_KEYS.FOOTBALL_DATA_ORG.length > 0
export const hasEsportsApiKey = () => API_KEYS.PANDASCORE.length > 0
