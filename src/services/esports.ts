import type { Match, EsportsGame } from '../types'
import { API_KEYS, hasEsportsApiKey } from '../config/api-keys'
import { scrapeEsportsMatches } from './scrapers/esports-scraper'

// 电竞数据来源：
// HLTV (CS2) 和 op.gg 没有官方公开 API，使用 CORS proxy 或社区 API
// 这里使用模拟数据 + PandaScore 的公开端点

interface EsportsApiMatch {
  id: number
  name?: string
  begin_at: string
  status: string
  tournament?: { name: string }
  league?: { name: string; image_url?: string }
  opponents?: Array<{
    opponent: { name: string; image_url?: string; id: number }
    type: string
  }>
  results?: Array<{ team_id: number; score: number }>
  videogame?: { slug: string; name: string }
  number_of_games?: number
}

function parseEsportsStatus(status: string): Match['status'] {
  if (status === 'running') return 'live'
  if (status === 'finished' || status === 'canceled') return 'finished'
  return 'upcoming'
}

function mapVideoGameSlug(slug: string): EsportsGame {
  const mapping: Record<string, EsportsGame> = {
    'cs-2': 'csgo',
    'cs-go': 'csgo',
    csgo: 'csgo',
    lol: 'lol',
    'league-of-legends': 'lol',
    valorant: 'valorant',
    dota2: 'dota2',
    'dota-2': 'dota2',
  }
  return mapping[slug] ?? 'csgo'
}

const GAME_NAMES: Record<EsportsGame, string> = {
  csgo: 'CS2',
  lol: 'LOL',
  valorant: 'VALORANT',
  dota2: 'DOTA2',
}

export function getGameDisplayName(game: EsportsGame): string {
  return GAME_NAMES[game] ?? game
}

export async function fetchEsportsMatches(gameFilter: EsportsGame | 'all' = 'all'): Promise<Match[]> {
  // 优先使用爬虫获取最新数据
  console.log('Attempting to scrape esports data...')
  const scrapedMatches = await scrapeEsportsMatches(gameFilter)

  if (scrapedMatches.length > 0) {
    console.log(`Successfully scraped ${scrapedMatches.length} esports matches`)
    return scrapedMatches
  }

  // 如果爬虫失败，尝试使用 API（如果配置了）
  if (hasEsportsApiKey()) {
    console.log('Scraping failed, trying API with key...')
    try {
      const response = await fetch(
        'https://api.pandascore.co/matches/running?per_page=20',
        {
          headers: {
            Authorization: `Bearer ${API_KEYS.PANDASCORE}`,
          },
        },
      )

      if (response.ok) {
        const data: EsportsApiMatch[] = await response.json()

        if (data && data.length > 0) {
          const matches = data
            .filter((m) => m.opponents && m.opponents.length >= 2)
            .map((m) => {
              const game = m.videogame?.slug ? mapVideoGameSlug(m.videogame.slug) : 'csgo'
              const homeOpponent = m.opponents![0]
              const awayOpponent = m.opponents![1]
              const homeResult = m.results?.find((r) => r.team_id === homeOpponent.opponent.id)
              const awayResult = m.results?.find((r) => r.team_id === awayOpponent.opponent.id)

              return {
                id: `esports-${m.id}`,
                sportType: 'esports' as const,
                homeTeam: homeOpponent.opponent.name,
                awayTeam: awayOpponent.opponent.name,
                homeScore: homeResult?.score,
                awayScore: awayResult?.score,
                homeLogo: homeOpponent.opponent.image_url,
                awayLogo: awayOpponent.opponent.image_url,
                status: parseEsportsStatus(m.status),
                startTime: m.begin_at,
                league: m.league?.name ?? m.tournament?.name ?? 'Unknown',
                extra: {
                  game,
                  gameName: getGameDisplayName(game),
                  bestOf: m.number_of_games ? `BO${m.number_of_games}` : '',
                },
              } satisfies Match
            })

          if (gameFilter === 'all') return matches
          return matches.filter((m) => m.extra?.game === gameFilter)
        }
      }
    } catch (error) {
      console.error('API fetch also failed:', error)
    }
  }

  // 最后降级到 fallback 数据
  console.info('Using fallback esports data')
  return getFallbackEsportsMatches(gameFilter)
}

function getFallbackEsportsMatches(gameFilter: EsportsGame | 'all'): Match[] {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().split('T')[0]

  const matches: Match[] = [
    // CS2 比赛
    {
      id: 'es-cs-1',
      sportType: 'esports',
      homeTeam: 'NAVI',
      awayTeam: 'FaZe Clan',
      homeScore: 2,
      awayScore: 1,
      status: 'finished',
      startTime: `${todayStr}T09:00:00Z`, // 北京时间 17:00
      league: 'IEM Katowice 2026',
      extra: { game: 'csgo', gameName: 'CS2', bestOf: 'BO3' },
      homePlayers: [
        { id: 'es-s1mple', name: 's1mple', team: 'NAVI', stats: { KD: '1.35', Rating: '1.42', ADR: '88.5', 击杀: 65, 死亡: 48 } },
        { id: 'es-b1t', name: 'b1t', team: 'NAVI', stats: { KD: '1.18', Rating: '1.22', ADR: '76.3', 击杀: 55, 死亡: 47 } },
        { id: 'es-jl', name: 'jL', team: 'NAVI', stats: { KD: '1.05', Rating: '1.10', ADR: '72.1', 击杀: 50, 死亡: 48 } },
      ],
      awayPlayers: [
        { id: 'es-ropz', name: 'ropz', team: 'FaZe Clan', stats: { KD: '1.22', Rating: '1.28', ADR: '80.2', 击杀: 58, 死亡: 48 } },
        { id: 'es-rain', name: 'rain', team: 'FaZe Clan', stats: { KD: '0.95', Rating: '1.02', ADR: '68.5', 击杀: 45, 死亡: 47 } },
        { id: 'es-frozen', name: 'frozen', team: 'FaZe Clan', stats: { KD: '1.10', Rating: '1.15', ADR: '74.8', 击杀: 52, 死亡: 47 } },
      ],
    },
    {
      id: 'es-cs-2',
      sportType: 'esports',
      homeTeam: 'Team Vitality',
      awayTeam: 'G2 Esports',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      startTime: `${tomorrowStr}T10:00:00Z`, // 北京时间明天 18:00
      league: 'BLAST Premier',
      extra: { game: 'csgo', gameName: 'CS2', bestOf: 'BO3' },
    },
    {
      id: 'es-cs-3',
      sportType: 'esports',
      homeTeam: 'Team Liquid',
      awayTeam: 'Cloud9',
      homeScore: 1,
      awayScore: 0,
      status: 'live',
      startTime: `${todayStr}T11:00:00Z`, // 北京时间 19:00
      league: 'ESL Pro League S21',
      extra: { game: 'csgo', gameName: 'CS2', bestOf: 'BO3' },
      homePlayers: [
        { id: 'es-twistzz', name: 'Twistzz', team: 'Team Liquid', stats: { KD: '1.28', Rating: '1.35', ADR: '85.2', 击杀: 42, 死亡: 33 } },
        { id: 'es-yekindar', name: 'YEKINDAR', team: 'Team Liquid', stats: { KD: '1.15', Rating: '1.18', ADR: '78.5', 击杀: 38, 死亡: 33 } },
        { id: 'es-naf', name: 'NAF', team: 'Team Liquid', stats: { KD: '1.05', Rating: '1.08', ADR: '70.3', 击杀: 35, 死亡: 33 } },
      ],
      awayPlayers: [
        { id: 'es-ax1le', name: 'Ax1Le', team: 'Cloud9', stats: { KD: '1.12', Rating: '1.15', ADR: '75.8', 击杀: 37, 死亡: 33 } },
        { id: 'es-hobbit', name: 'HObbit', team: 'Cloud9', stats: { KD: '0.97', Rating: '1.00', ADR: '68.2', 击杀: 32, 死亡: 33 } },
        { id: 'es-sh1ro', name: 'sh1ro', team: 'Cloud9', stats: { KD: '1.00', Rating: '1.05', ADR: '72.5', 击杀: 33, 死亡: 33 } },
      ],
    },
    // LoL 比赛
    {
      id: 'es-lol-1',
      sportType: 'esports',
      homeTeam: 'T1',
      awayTeam: 'Gen.G',
      homeScore: 2,
      awayScore: 0,
      status: 'finished',
      startTime: `${todayStr}T09:00:00Z`, // 北京时间 17:00
      league: 'LCK Spring 2026',
      extra: { game: 'lol', gameName: 'LOL', bestOf: 'BO3', region: 'LCK' },
      homePlayers: [
        { id: 'es-faker', name: 'Faker', team: 'T1', position: 'MID', stats: { KDA: '8/1/6', CS: 245, 伤害: '28.5k', 参团率: '78%' } },
        { id: 'es-gumayusi', name: 'Gumayusi', team: 'T1', position: 'ADC', stats: { KDA: '6/2/8', CS: 268, 伤害: '32.1k', 参团率: '82%' } },
        { id: 'es-keria', name: 'Keria', team: 'T1', position: 'SUP', stats: { KDA: '1/1/14', CS: 32, 伤害: '8.2k', 参团率: '90%' } },
        { id: 'es-zeus', name: 'Zeus', team: 'T1', position: 'TOP', stats: { KDA: '4/2/5', CS: 220, 伤害: '22.3k', 参团率: '60%' } },
        { id: 'es-oner', name: 'Oner', team: 'T1', position: 'JG', stats: { KDA: '3/1/10', CS: 180, 伤害: '15.8k', 参团率: '85%' } },
      ],
      awayPlayers: [
        { id: 'es-chovy', name: 'Chovy', team: 'Gen.G', position: 'MID', stats: { KDA: '2/3/3', CS: 230, 伤害: '24.1k', 参团率: '65%' } },
        { id: 'es-peyz', name: 'Peyz', team: 'Gen.G', position: 'ADC', stats: { KDA: '3/4/2', CS: 255, 伤害: '26.8k', 参团率: '58%' } },
        { id: 'es-lehends', name: 'Lehends', team: 'Gen.G', position: 'SUP', stats: { KDA: '0/3/5', CS: 28, 伤害: '5.5k', 参团率: '62%' } },
      ],
    },
    {
      id: 'es-lol-2',
      sportType: 'esports',
      homeTeam: 'BLG',
      awayTeam: 'JDG',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      startTime: `${tomorrowStr}T09:00:00Z`, // 北京时间明天 17:00
      league: 'LPL Spring 2026',
      extra: { game: 'lol', gameName: 'LOL', bestOf: 'BO3', region: 'LPL' },
    },
    {
      id: 'es-lol-3',
      sportType: 'esports',
      homeTeam: 'WBG',
      awayTeam: 'TES',
      homeScore: 1,
      awayScore: 1,
      status: 'live',
      startTime: `${todayStr}T10:00:00Z`, // 北京时间 18:00
      league: 'LPL Spring 2026',
      extra: { game: 'lol', gameName: 'LOL', bestOf: 'BO3', region: 'LPL' },
      homePlayers: [
        { id: 'es-theshy', name: 'TheShy', team: 'WBG', position: 'TOP', stats: { KDA: '5/3/4', CS: 235, 伤害: '26.8k', 参团率: '68%' } },
        { id: 'es-weiwei', name: 'Weiwei', team: 'WBG', position: 'JG', stats: { KDA: '2/2/8', CS: 165, 伤害: '12.5k', 参团率: '80%' } },
        { id: 'es-xiaohu', name: 'Xiaohu', team: 'WBG', position: 'MID', stats: { KDA: '4/2/5', CS: 248, 伤害: '24.2k', 参团率: '72%' } },
        { id: 'es-light', name: 'Light', team: 'WBG', position: 'ADC', stats: { KDA: '6/1/6', CS: 272, 伤害: '31.5k', 参团率: '75%' } },
      ],
      awayPlayers: [
        { id: 'es-wayward', name: 'Wayward', team: 'TES', position: 'TOP', stats: { KDA: '3/4/5', CS: 228, 伤害: '22.1k', 参团率: '65%' } },
        { id: 'es-tian', name: 'Tian', team: 'TES', position: 'JG', stats: { KDA: '1/3/7', CS: 158, 伤害: '10.8k', 参团率: '70%' } },
        { id: 'es-knight', name: 'Knight', team: 'TES', position: 'MID', stats: { KDA: '4/3/4', CS: 255, 伤害: '27.3k', 参团率: '68%' } },
        { id: 'es-jackeylove', name: 'JackeyLove', team: 'TES', position: 'ADC', stats: { KDA: '5/2/5', CS: 268, 伤害: '29.8k', 参团率: '73%' } },
      ],
    },
    // VALORANT 比赛
    {
      id: 'es-val-1',
      sportType: 'esports',
      homeTeam: 'Sentinels',
      awayTeam: '100 Thieves',
      homeScore: 2,
      awayScore: 1,
      status: 'finished',
      startTime: `${todayStr}T02:00:00Z`, // 北京时间 10:00
      league: 'VCT Americas',
      extra: { game: 'valorant', gameName: 'VALORANT', bestOf: 'BO3' },
      homePlayers: [
        { id: 'es-tenz', name: 'TenZ', team: 'Sentinels', stats: { ACS: 285, KD: '1.42', 击杀: 68, 死亡: 48, 首杀: 12 } },
        { id: 'es-zekken', name: 'zekken', team: 'Sentinels', stats: { ACS: 268, KD: '1.35', 击杀: 65, 死亡: 48, 首杀: 10 } },
        { id: 'es-sacy', name: 'Sacy', team: 'Sentinels', stats: { ACS: 198, KD: '1.08', 击杀: 52, 死亡: 48, 首杀: 8 } },
      ],
      awayPlayers: [
        { id: 'es-asuna', name: 'Asuna', team: '100 Thieves', stats: { ACS: 245, KD: '1.18', 击杀: 57, 死亡: 48, 首杀: 9 } },
        { id: 'es-cryo', name: 'Cryo', team: '100 Thieves', stats: { ACS: 232, KD: '1.12', 击杀: 54, 死亡: 48, 首杀: 7 } },
        { id: 'es-bang', name: 'bang', team: '100 Thieves', stats: { ACS: 188, KD: '0.95', 击杀: 46, 死亡: 48, 首杀: 5 } },
      ],
    },
    {
      id: 'es-val-2',
      sportType: 'esports',
      homeTeam: 'EDG',
      awayTeam: 'DRX',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      startTime: `${tomorrowStr}T06:00:00Z`, // 北京时间明天 14:00
      league: 'VCT Pacific',
      extra: { game: 'valorant', gameName: 'VALORANT', bestOf: 'BO3' },
    },
    // DOTA2 比赛
    {
      id: 'es-dota-1',
      sportType: 'esports',
      homeTeam: 'Team Spirit',
      awayTeam: 'Gaimin Gladiators',
      homeScore: 1,
      awayScore: 2,
      status: 'finished',
      startTime: `${todayStr}T08:00:00Z`, // 北京时间 16:00
      league: 'DPC Tour 2026',
      extra: { game: 'dota2', gameName: 'DOTA2', bestOf: 'BO3' },
      homePlayers: [
        { id: 'es-yatoro', name: 'Yatoro', team: 'Team Spirit', stats: { KDA: '8/5/12', GPM: 685, XPM: 745, 伤害: '42.5k', 英雄: 'Phantom Assassin' } },
        { id: 'es-collapse', name: 'Collapse', team: 'Team Spirit', stats: { KDA: '5/6/15', GPM: 512, XPM: 625, 伤害: '28.3k', 英雄: 'Mars' } },
        { id: 'es-toronto', name: 'TorontoTokyo', team: 'Team Spirit', stats: { KDA: '6/7/14', GPM: 558, XPM: 682, 伤害: '35.8k', 英雄: 'Puck' } },
      ],
      awayPlayers: [
        { id: 'es-quinn', name: 'Quinn', team: 'Gaimin Gladiators', stats: { KDA: '10/4/18', GPM: 725, XPM: 785, 伤害: '48.2k', 英雄: 'Morphling' } },
        { id: 'es-ace', name: 'Ace', team: 'Gaimin Gladiators', stats: { KDA: '7/5/20', GPM: 485, XPM: 598, 伤害: '22.5k', 英雄: 'Earthshaker' } },
        { id: 'es-dyrachyo', name: 'dyrachyo', team: 'Gaimin Gladiators', stats: { KDA: '8/6/16', GPM: 642, XPM: 712, 伤害: '38.7k', 英雄: 'Invoker' } },
      ],
    },
  ]

  if (gameFilter === 'all') return matches
  return matches.filter((m) => m.extra?.game === gameFilter)
}
