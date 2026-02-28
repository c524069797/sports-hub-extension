import type { Match } from '../types'
import { API_KEYS, hasFootballApiKey } from '../config/api-keys'
import { scrapeFootballMatches } from './scrapers/football-scraper'

// 足球数据来源：使用 football-data.org 公开 API（每分钟 10 次免费额度）
// 无需认证即可获取部分数据
// 备用：使用开放的 API-Football 数据

// 主要联赛代码（五大联赛 + 欧冠 + 国家队赛事）
const LEAGUES: Record<string, string> = {
  PL: 'Premier League',
  PD: 'La Liga',
  BL1: 'Bundesliga',
  SA: 'Serie A',
  FL1: 'Ligue 1',
  CL: 'Champions League',
  WC: 'World Cup',
  EC: 'Euro',
  NL: 'Nations League',
}

// 允许的联赛代码集合
const ALLOWED_LEAGUE_CODES = new Set(Object.keys(LEAGUES))

interface FootballApiMatch {
  id: number
  utcDate: string
  status: string
  homeTeam: { id: number; name: string; crest?: string; shortName?: string }
  awayTeam: { id: number; name: string; crest?: string; shortName?: string }
  score: {
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
  }
  competition: { id: number; name: string; code?: string; emblem?: string }
  matchday?: number
}

interface FootballApiResponse {
  matches: FootballApiMatch[]
  resultSet?: { count: number }
}

function parseFootballStatus(status: string): Match['status'] {
  const liveStatuses = ['IN_PLAY', 'PAUSED', 'HALFTIME', 'EXTRA_TIME', 'PENALTY_SHOOTOUT']
  const finishedStatuses = ['FINISHED', 'AWARDED', 'CANCELLED']

  if (liveStatuses.includes(status)) return 'live'
  if (finishedStatuses.includes(status)) return 'finished'
  return 'upcoming'
}

export async function fetchFootballMatches(): Promise<Match[]> {
  // 优先使用爬虫获取最新数据
  console.log('Attempting to scrape football data...')
  const scrapedMatches = await scrapeFootballMatches()

  if (scrapedMatches.length > 0) {
    console.log(`Successfully scraped ${scrapedMatches.length} football matches`)
    return scrapedMatches
  }

  // 如果爬虫失败，尝试使用 API（如果配置了）
  if (hasFootballApiKey()) {
    console.log('Scraping failed, trying API with key...')
    try {
      const today = new Date().toISOString().split('T')[0]
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

      const response = await fetch(
        `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${nextWeek}`,
        {
          headers: {
            'X-Auth-Token': API_KEYS.FOOTBALL_DATA_ORG,
          },
        }
      )

      if (response.ok) {
        const data: FootballApiResponse = await response.json()
        if (data.matches && data.matches.length > 0) {
          return data.matches
            .filter((m) => m.competition.code && ALLOWED_LEAGUE_CODES.has(m.competition.code))
            .slice(0, 20)
            .map((m) => ({
            id: `football-${m.id}`,
            sportType: 'football' as const,
            homeTeam: m.homeTeam.shortName ?? m.homeTeam.name,
            awayTeam: m.awayTeam.shortName ?? m.awayTeam.name,
            homeScore: m.score.fullTime.home ?? undefined,
            awayScore: m.score.fullTime.away ?? undefined,
            homeLogo: m.homeTeam.crest,
            awayLogo: m.awayTeam.crest,
            status: parseFootballStatus(m.status),
            startTime: m.utcDate,
            league: m.competition.code ? (LEAGUES[m.competition.code] ?? m.competition.name) : m.competition.name,
            extra: {
              matchday: m.matchday ? `Matchday ${m.matchday}` : '',
              halfTimeScore:
                m.score.halfTime.home !== null
                  ? `HT ${m.score.halfTime.home}-${m.score.halfTime.away}`
                  : '',
            },
          }))
        }
      }
    } catch (error) {
      console.error('API fetch also failed:', error)
    }
  }

  // 最后降级到 fallback 数据（只返回 upcoming 的比赛）
  console.info('Using fallback football data')
  return getFallbackFootballMatches().filter((m) => m.status === 'upcoming' || m.status === 'live')
}

function getFallbackFootballMatches(): Match[] {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().split('T')[0]

  return [
    {
      id: 'fb-1',
      sportType: 'football',
      homeTeam: 'Manchester City',
      awayTeam: 'Liverpool',
      homeScore: 2,
      awayScore: 1,
      status: 'finished',
      startTime: `${todayStr}T12:30:00Z`,
      league: 'Premier League',
      extra: { matchday: 'Matchday 28', halfTimeScore: 'HT 1-0' },
      homePlayers: [
        { id: 'fb-haaland', name: 'Erling Haaland', team: 'Manchester City', position: 'ST', stats: { Goals: 1, Assists: 0, Shots: 4, Passes: 18, Rating: '7.8' } },
        { id: 'fb-kdb', name: 'Kevin De Bruyne', team: 'Manchester City', position: 'MF', stats: { Goals: 1, Assists: 1, Shots: 2, Passes: 62, Rating: '8.5' } },
        { id: 'fb-rodri', name: 'Rodri', team: 'Manchester City', position: 'MF', stats: { Goals: 0, Assists: 0, Shots: 1, Passes: 78, Rating: '7.2' } },
        { id: 'fb-foden', name: 'Phil Foden', team: 'Manchester City', position: 'MF', stats: { Goals: 0, Assists: 1, Shots: 3, Passes: 45, Rating: '7.5' } },
      ],
      awayPlayers: [
        { id: 'fb-salah', name: 'Mohamed Salah', team: 'Liverpool', position: 'RW', stats: { Goals: 1, Assists: 0, Shots: 5, Passes: 30, Rating: '7.6' } },
        { id: 'fb-nunez', name: 'Darwin Nunez', team: 'Liverpool', position: 'ST', stats: { Goals: 0, Assists: 0, Shots: 3, Passes: 15, Rating: '6.2' } },
        { id: 'fb-mac', name: 'Alexis Mac Allister', team: 'Liverpool', position: 'MF', stats: { Goals: 0, Assists: 1, Shots: 1, Passes: 55, Rating: '7.0' } },
        { id: 'fb-vvd', name: 'Virgil van Dijk', team: 'Liverpool', position: 'CB', stats: { Goals: 0, Assists: 0, Shots: 0, Passes: 68, Rating: '6.8' } },
      ],
    },
    {
      id: 'fb-2',
      sportType: 'football',
      homeTeam: 'Real Madrid',
      awayTeam: 'Barcelona',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      startTime: `${tomorrowStr}T12:00:00Z`,
      league: 'La Liga',
      extra: { matchday: 'Matchday 26' },
    },
    {
      id: 'fb-3',
      sportType: 'football',
      homeTeam: 'Bayern Munich',
      awayTeam: 'Borussia Dortmund',
      homeScore: 3,
      awayScore: 2,
      status: 'live',
      startTime: `${todayStr}T11:30:00Z`,
      league: 'Bundesliga',
      extra: { matchday: 'Matchday 24', halfTimeScore: 'HT 2-1' },
      homePlayers: [
        { id: 'fb-kane', name: 'Harry Kane', team: 'Bayern Munich', position: 'ST', stats: { Goals: 2, Assists: 0, Shots: 5, Passes: 25, Rating: '8.9' } },
        { id: 'fb-musiala', name: 'Jamal Musiala', team: 'Bayern Munich', position: 'AM', stats: { Goals: 1, Assists: 1, Shots: 3, Passes: 48, Rating: '8.2' } },
        { id: 'fb-kimmich', name: 'Joshua Kimmich', team: 'Bayern Munich', position: 'DM', stats: { Goals: 0, Assists: 1, Shots: 1, Passes: 82, Rating: '7.5' } },
      ],
      awayPlayers: [
        { id: 'fb-adeyemi', name: 'Karim Adeyemi', team: 'Borussia Dortmund', position: 'LW', stats: { Goals: 1, Assists: 0, Shots: 4, Passes: 22, Rating: '7.3' } },
        { id: 'fb-brandt', name: 'Julian Brandt', team: 'Borussia Dortmund', position: 'AM', stats: { Goals: 1, Assists: 0, Shots: 2, Passes: 45, Rating: '7.1' } },
        { id: 'fb-hummels', name: 'Mats Hummels', team: 'Borussia Dortmund', position: 'CB', stats: { Goals: 0, Assists: 0, Shots: 0, Passes: 65, Rating: '6.5' } },
      ],
    },
    {
      id: 'fb-4',
      sportType: 'football',
      homeTeam: 'AC Milan',
      awayTeam: 'Inter Milan',
      homeScore: 1,
      awayScore: 1,
      status: 'finished',
      startTime: `${todayStr}T11:45:00Z`,
      league: 'Serie A',
      extra: { matchday: 'Matchday 27', halfTimeScore: 'HT 0-1' },
      homePlayers: [
        { id: 'fb-leao', name: 'Rafael Leão', team: 'AC Milan', position: 'LW', stats: { Goals: 1, Assists: 0, Shots: 3, Passes: 28, Rating: '7.8' } },
        { id: 'fb-pulisic', name: 'Christian Pulisic', team: 'AC Milan', position: 'RW', stats: { Goals: 0, Assists: 1, Shots: 2, Passes: 32, Rating: '7.2' } },
        { id: 'fb-tonali', name: 'Sandro Tonali', team: 'AC Milan', position: 'CM', stats: { Goals: 0, Assists: 0, Shots: 1, Passes: 58, Rating: '6.9' } },
      ],
      awayPlayers: [
        { id: 'fb-lautaro', name: 'Lautaro Martínez', team: 'Inter Milan', position: 'ST', stats: { Goals: 1, Assists: 0, Shots: 4, Passes: 20, Rating: '7.5' } },
        { id: 'fb-barella', name: 'Nicolò Barella', team: 'Inter Milan', position: 'CM', stats: { Goals: 0, Assists: 1, Shots: 2, Passes: 62, Rating: '7.3' } },
        { id: 'fb-bastoni', name: 'Alessandro Bastoni', team: 'Inter Milan', position: 'CB', stats: { Goals: 0, Assists: 0, Shots: 0, Passes: 72, Rating: '7.0' } },
      ],
    },
    {
      id: 'fb-5',
      sportType: 'football',
      homeTeam: 'Paris Saint-Germain',
      awayTeam: 'Marseille',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      startTime: `${tomorrowStr}T13:00:00Z`,
      league: 'Ligue 1',
      extra: { matchday: 'Matchday 25' },
    },
    {
      id: 'fb-6',
      sportType: 'football',
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      homeScore: 2,
      awayScore: 0,
      status: 'finished',
      startTime: `${todayStr}T09:30:00Z`,
      league: 'Premier League',
      extra: { matchday: 'Matchday 28', halfTimeScore: 'HT 1-0' },
      homePlayers: [
        { id: 'fb-saka', name: 'Bukayo Saka', team: 'Arsenal', position: 'RW', stats: { Goals: 1, Assists: 1, Shots: 4, Passes: 35, Rating: '8.6' } },
        { id: 'fb-odegaard', name: 'Martin Ødegaard', team: 'Arsenal', position: 'AM', stats: { Goals: 1, Assists: 0, Shots: 3, Passes: 68, Rating: '8.1' } },
        { id: 'fb-rice', name: 'Declan Rice', team: 'Arsenal', position: 'DM', stats: { Goals: 0, Assists: 1, Shots: 1, Passes: 75, Rating: '7.4' } },
        { id: 'fb-saliba', name: 'William Saliba', team: 'Arsenal', position: 'CB', stats: { Goals: 0, Assists: 0, Shots: 0, Passes: 82, Rating: '7.8' } },
      ],
      awayPlayers: [
        { id: 'fb-palmer', name: 'Cole Palmer', team: 'Chelsea', position: 'AM', stats: { Goals: 0, Assists: 0, Shots: 2, Passes: 42, Rating: '6.5' } },
        { id: 'fb-jackson', name: 'Nicolas Jackson', team: 'Chelsea', position: 'ST', stats: { Goals: 0, Assists: 0, Shots: 3, Passes: 18, Rating: '6.2' } },
        { id: 'fb-enzo', name: 'Enzo Fernández', team: 'Chelsea', position: 'CM', stats: { Goals: 0, Assists: 0, Shots: 1, Passes: 58, Rating: '6.4' } },
      ],
    },
  ]
}
