import type { Match } from '../../types'

// 使用 ESPN 公共 API 获取足球数据（免费、无需 API key、数据准确）
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer'

// 五大联赛 + 欧冠 + 国家队赛事的 ESPN slug 和显示名称
const LEAGUE_SLUGS: Array<{ slug: string; name: string }> = [
  { slug: 'eng.1', name: 'Premier League' },
  { slug: 'esp.1', name: 'La Liga' },
  { slug: 'ger.1', name: 'Bundesliga' },
  { slug: 'ita.1', name: 'Serie A' },
  { slug: 'fra.1', name: 'Ligue 1' },
  { slug: 'uefa.champions', name: 'Champions League' },
  { slug: 'fifa.world', name: 'World Cup' },
  { slug: 'uefa.euro', name: 'Euro' },
  { slug: 'uefa.nations', name: 'Nations League' },
]

interface ESPNEvent {
  id: string
  date: string
  name: string
  competitions: Array<{
    id: string
    date: string
    status: {
      type: {
        name: string
        description: string
        completed: boolean
      }
      displayClock?: string
    }
    competitors: Array<{
      homeAway: 'home' | 'away'
      score: string
      team: {
        id: string
        displayName: string
        shortDisplayName: string
        logo: string
      }
    }>
    venue?: {
      fullName: string
      city: string
    }
  }>
}

interface ESPNResponse {
  events: ESPNEvent[]
  leagues: Array<{ name: string }>
}

function parseEspnStatus(statusName: string, completed: boolean): Match['status'] {
  if (completed) return 'finished'

  // ESPN status types
  const liveStatuses = [
    'STATUS_IN_PROGRESS',
    'STATUS_HALFTIME',
    'STATUS_FIRST_HALF',
    'STATUS_SECOND_HALF',
    'STATUS_EXTRA_TIME',
    'STATUS_OVERTIME',
    'STATUS_PENALTY_SHOOTOUT',
  ]
  const finishedStatuses = [
    'STATUS_FULL_TIME',
    'STATUS_FINAL',
    'STATUS_FINAL_AET',
    'STATUS_FINAL_PEN',
    'STATUS_AWARDED',
    'STATUS_CANCELLED',
    'STATUS_POSTPONED',
    'STATUS_ABANDONED',
  ]

  if (liveStatuses.includes(statusName)) return 'live'
  if (finishedStatuses.includes(statusName)) return 'finished'
  return 'upcoming'
}

async function fetchLeagueMatches(slug: string, leagueName: string, dateRange: string): Promise<Match[]> {
  try {
    const response = await fetch(`${ESPN_BASE}/${slug}/scoreboard?dates=${dateRange}`, {
      headers: { 'Accept': 'application/json' },
    })

    if (!response.ok) return []

    const data: ESPNResponse = await response.json()
    const events = data.events ?? []

    return events.map((event) => {
      const comp = event.competitions[0]
      const homeTeam = comp.competitors.find((c) => c.homeAway === 'home')
      const awayTeam = comp.competitors.find((c) => c.homeAway === 'away')

      if (!homeTeam || !awayTeam) return null

      const statusType = comp.status.type
      const status = parseEspnStatus(statusType.name, statusType.completed)
      const homeScore = parseInt(homeTeam.score, 10)
      const awayScore = parseInt(awayTeam.score, 10)

      return {
        id: `football-espn-${event.id}`,
        sportType: 'football' as const,
        homeTeam: homeTeam.team.displayName,
        awayTeam: awayTeam.team.displayName,
        homeScore: status !== 'upcoming' && !isNaN(homeScore) ? homeScore : undefined,
        awayScore: status !== 'upcoming' && !isNaN(awayScore) ? awayScore : undefined,
        homeLogo: homeTeam.team.logo,
        awayLogo: awayTeam.team.logo,
        status,
        startTime: event.date,
        league: leagueName,
        venue: comp.venue?.fullName,
        extra: {
          espnEventId: event.id,
          espnLeagueSlug: slug,
          espnHomeTeamId: homeTeam.team.id,
          espnAwayTeamId: awayTeam.team.id,
          statusText: status === 'live' ? statusType.description : undefined,
          displayClock: status === 'live' ? comp.status.displayClock : undefined,
        },
      } satisfies Match
    }).filter((m): m is Match => m !== null)
  } catch (error) {
    console.error(`Failed to fetch ${leagueName}:`, error)
    return []
  }
}

export async function scrapeFootballMatches(): Promise<Match[]> {
  const now = new Date()
  const todayStr = formatDate(now)
  const endDate = new Date(now.getTime() + 7 * 86400000)
  const endStr = formatDate(endDate)
  const dateRange = `${todayStr}-${endStr}`

  // 并行请求所有联赛
  const results = await Promise.all(
    LEAGUE_SLUGS.map((league) => fetchLeagueMatches(league.slug, league.name, dateRange))
  )

  const allMatches = results.flat()

  // 过滤掉已结束的过去比赛（只保留今天和未来的 + 今天的已结束比赛）
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const filtered = allMatches.filter((m) => {
    if (m.status === 'finished') {
      const matchTime = new Date(m.startTime).getTime()
      return matchTime >= todayStart
    }
    return true
  })

  // 排序：进行中 > 即将开始（按时间） > 已结束
  filtered.sort((a, b) => {
    const order = { live: 0, upcoming: 1, finished: 2 }
    const diff = order[a.status] - order[b.status]
    if (diff !== 0) return diff
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  })

  return filtered
}

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}
