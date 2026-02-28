import type { Match, EsportsGame } from '../../types'

// 使用 Polymarket Gamma API 获取电竞数据
const GAMMA_URL = 'https://gamma-api.polymarket.com'
const ESPORTS_TAG_ID = '64'

interface GammaEvent {
  id: string
  slug: string
  title: string
  description: string
  startDate: string
  endDate: string
  volume: number
  liquidity: number
  markets: GammaMarket[]
}

interface GammaMarket {
  id: string
  question: string
  outcomePrices: string
  outcomes: string
  volume: string
  active: boolean
  closed: boolean
}

// 去除战队名称中的游戏前缀（如 "LoL: Team A" -> "Team A"）
function stripGamePrefix(name: string): string {
  return name
    .replace(/^(?:LoL|League of Legends|CS2|CSGO|CS:GO|Counter-Strike|Valorant|Dota\s*2?|DOTA\s*2?):\s*/i, '')
    .trim()
}

// 清理战队名称中的附加信息
// 例如 "Weibo Gaming (BO3) - LPL Group Ascend" -> "Weibo Gaming"
function stripExtraSuffix(name: string): string {
  // 先去掉 " - xxx" 形式的赛事附加信息
  let cleaned = name.replace(/\s+-\s+.+$/, '').trim()
  // 再去掉 "(BO3)" 等括号后缀
  cleaned = cleaned.replace(/\s*\(BO\d+\)\s*$/i, '').trim()
  return cleaned
}

// 解析战队名称（从 "Team A vs Team B" 格式）
function parseTeamsFromTitle(title: string): { homeTeam: string; awayTeam: string } | null {
  const parts = title.split(/\s+vs\.?\s+/i)
  if (parts.length < 2) return null
  const homeTeam = stripExtraSuffix(stripGamePrefix(parts[0].trim()))
  const awayTeam = stripExtraSuffix(stripGamePrefix(parts[1].trim()))
  if (!homeTeam || !awayTeam) return null
  return { homeTeam, awayTeam }
}

// 从标题或描述中识别游戏类型
function detectGame(title: string, description: string): EsportsGame {
  const text = `${title} ${description}`.toLowerCase()

  if (text.includes('counter-strike') || text.includes('cs:go') || text.includes('cs2') || text.includes('csgo')) {
    return 'csgo'
  }
  if (text.includes('league of legends') || text.includes('lol') || text.includes('worlds') || text.includes('lck') || text.includes('lpl')) {
    return 'lol'
  }
  if (text.includes('valorant') || text.includes('vct')) {
    return 'valorant'
  }
  if (text.includes('dota') || text.includes('dota 2') || text.includes('ti')) {
    return 'dota2'
  }

  // 默认返回 csgo
  return 'csgo'
}

function getGameDisplayName(game: EsportsGame): string {
  const names: Record<EsportsGame, string> = {
    csgo: 'CS2',
    lol: 'LOL',
    valorant: 'VALORANT',
    dota2: 'DOTA2',
  }
  return names[game] || game
}

// 根据市场状态和时间判断比赛状态
function determineMatchStatus(event: GammaEvent): Match['status'] {
  const markets = event.markets ?? []
  const hasActiveMarket = markets.some((m) => m.active && !m.closed)
  const allClosed = markets.length > 0 && markets.every((m) => m.closed)

  if (allClosed) {
    return 'finished'
  }

  const now = new Date()
  const startDate = event.startDate ? new Date(event.startDate) : null

  if (startDate) {
    const hoursElapsed = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60)

    // 电竞比赛一般不超过 8 小时（即使 BO5）
    // 如果开始时间已超过 8 小时，判定为已结束
    if (hoursElapsed > 8) {
      return 'finished'
    }

    if (hasActiveMarket) {
      if (startDate <= now) {
        return 'live'
      }
      return 'upcoming'
    }
  }

  return 'upcoming'
}

// 从 Polymarket Gamma API 获取电竞比赛
async function scrapeFromPolymarket(gameFilter: EsportsGame | 'all'): Promise<Match[]> {
  try {
    // 获取活跃和已关闭的比赛
    const [activeResponse, closedResponse] = await Promise.all([
      fetch(`${GAMMA_URL}/events?tag_id=${ESPORTS_TAG_ID}&active=true&closed=false&limit=30&offset=0&order=volume&ascending=false`, {
        headers: { 'Accept': 'application/json' },
      }),
      fetch(`${GAMMA_URL}/events?tag_id=${ESPORTS_TAG_ID}&closed=true&limit=20&offset=0&order=volume&ascending=false`, {
        headers: { 'Accept': 'application/json' },
      }),
    ])

    const activeData: GammaEvent[] = activeResponse.ok ? await activeResponse.json() : []
    const closedData: GammaEvent[] = closedResponse.ok ? await closedResponse.json() : []

    // 合并并去重
    const seenIds = new Set<string>()
    const allEvents: GammaEvent[] = []
    for (const event of [...activeData, ...closedData]) {
      if (!seenIds.has(event.id)) {
        seenIds.add(event.id)
        allEvents.push(event)
      }
    }

    if (allEvents.length === 0) {
      return []
    }

    const matches: Match[] = []
    const now = new Date()
    // 只保留最近 7 天内的比赛
    const maxAge = 7 * 24 * 60 * 60 * 1000

    for (const event of allEvents) {
      // 只处理包含 "vs" 的比赛
      if (!/\bvs\.?\b/i.test(event.title)) continue

      const teams = parseTeamsFromTitle(event.title)
      if (!teams) continue

      // 过滤掉太旧的比赛
      const eventDate = event.startDate ? new Date(event.startDate) : (event.endDate ? new Date(event.endDate) : null)
      if (eventDate && (now.getTime() - eventDate.getTime()) > maxAge) continue

      const game = detectGame(event.title, event.description)

      // 如果指定了游戏过滤，只返回匹配的游戏
      if (gameFilter !== 'all' && game !== gameFilter) continue

      const status = determineMatchStatus(event)

      // 从描述中提取赛事信息
      const { league, region } = extractLeagueAndRegion(event.title, event.description, game)

      // 从原始标题中提取 BO 信息
      const boMatch = event.title.match(/\(BO(\d+)\)/i)
      const bestOf = boMatch ? `BO${boMatch[1]}` : ''

      matches.push({
        id: `esports-poly-${event.id}`,
        sportType: 'esports' as const,
        homeTeam: teams.homeTeam,
        awayTeam: teams.awayTeam,
        homeScore: undefined,
        awayScore: undefined,
        status,
        startTime: event.startDate || event.endDate,
        league,
        extra: {
          game,
          gameName: getGameDisplayName(game),
          bestOf,
          region,
          volume: `$${(event.volume / 1000).toFixed(1)}k`,
          polymarketUrl: `https://polymarket.com/event/${event.slug}`,
        },
      })
    }

    // 球员数据由 MatchDetail 组件按需加载
    return matches.slice(0, 20)
  } catch (error) {
    console.error('Polymarket scraping failed:', error)
    return []
  }
}

// 从标题或描述中提取赛事和赛区信息
function extractLeagueAndRegion(title: string, description: string, game: EsportsGame): { league: string; region?: string } {
  const text = `${title} ${description}`.toLowerCase()

  // CS2 赛事
  if (game === 'csgo') {
    if (text.includes('iem') || text.includes('intel extreme masters')) return { league: 'IEM' }
    if (text.includes('blast')) return { league: 'BLAST Premier' }
    if (text.includes('esl') || text.includes('pro league')) return { league: 'ESL Pro League' }
    if (text.includes('major')) return { league: 'CS Major' }
    return { league: 'CS2' }
  }

  // LOL 赛事 - 带赛区
  if (game === 'lol') {
    if (text.includes('worlds') || text.includes('world championship')) return { league: 'Worlds', region: 'Global' }
    if (text.includes('msi')) return { league: 'MSI', region: 'Global' }
    if (text.includes('lck')) return { league: 'LCK', region: 'LCK' }
    if (text.includes('lpl')) return { league: 'LPL', region: 'LPL' }
    if (text.includes('lec')) return { league: 'LEC', region: 'LEC' }
    if (text.includes('lcs')) return { league: 'LCS', region: 'LCS' }
    if (text.includes('pcs')) return { league: 'PCS', region: 'PCS' }
    if (text.includes('ljl')) return { league: 'LJL', region: 'LJL' }
    if (text.includes('cblol')) return { league: 'CBLOL', region: 'CBLOL' }
    return { league: 'LOL' }
  }

  // VALORANT 赛事 - 带赛区
  if (game === 'valorant') {
    if (text.includes('champions')) return { league: 'VCT Champions', region: 'Global' }
    if (text.includes('masters')) return { league: 'VCT Masters', region: 'Global' }
    if (text.includes('americas')) return { league: 'VCT Americas', region: 'Americas' }
    if (text.includes('pacific')) return { league: 'VCT Pacific', region: 'Pacific' }
    if (text.includes('emea')) return { league: 'VCT EMEA', region: 'EMEA' }
    if (text.includes('china')) return { league: 'VCT China', region: 'China' }
    return { league: 'VALORANT' }
  }

  // DOTA2 赛事
  if (game === 'dota2') {
    if (/\bti\d*\b/.test(text) || text.includes('the international')) return { league: 'The International' }
    if (text.includes('dpc') || text.includes('pro circuit')) return { league: 'DPC' }
    if (text.includes('major')) return { league: 'Dota Major' }
    return { league: 'DOTA2' }
  }

  return { league: getGameDisplayName(game) }
}

// 主函数：使用 Polymarket API
export async function scrapeEsportsMatches(gameFilter: EsportsGame | 'all' = 'all'): Promise<Match[]> {
  const matches = await scrapeFromPolymarket(gameFilter)

  if (matches.length > 0) {
    return matches
  }

  return []
}
