// ========== 通用类型 ==========
export type SportType = 'nba' | 'football' | 'esports'

export type MatchStatus = 'upcoming' | 'live' | 'finished'

export interface PlayerStat {
  id: string
  name: string
  team: string
  position?: string
  avatar?: string
  stats: Record<string, string | number>
}

export interface Match {
  id: string
  sportType: SportType
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  homeLogo?: string
  awayLogo?: string
  status: MatchStatus
  startTime: string
  league: string
  venue?: string
  extra?: Record<string, string | number | undefined>
  homePlayers?: PlayerStat[]
  awayPlayers?: PlayerStat[]
}

// ========== NBA 类型 ==========
export interface NBATeam {
  id: string
  name: string
  abbreviation: string
  conference: 'Eastern' | 'Western'
  logo?: string
}

export interface NBAPlayer {
  id: string
  name: string
  team: string
  position: string
  number: string
  avatar?: string
}

export interface NBAStanding {
  team: string
  wins: number
  losses: number
  winPct: string
  conference: 'Eastern' | 'Western'
  rank: number
}

export interface NBAPlayerStats {
  playerName: string
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  minutes: string
}

// ========== 足球类型 ==========
export interface FootballTeam {
  id: string
  name: string
  league: string
  logo?: string
}

export interface FootballPlayer {
  id: string
  name: string
  team: string
  position: string
  nationality: string
  avatar?: string
}

export interface FootballStanding {
  team: string
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  points: number
  rank: number
}

// ========== 电竞类型 ==========
export type EsportsGame = 'csgo' | 'lol' | 'valorant' | 'dota2'

export interface EsportsTeam {
  id: string
  name: string
  game: EsportsGame
  logo?: string
  region?: string
}

export interface EsportsPlayer {
  id: string
  name: string
  realName?: string
  team: string
  game: EsportsGame
  role?: string
  avatar?: string
}

export interface EsportsMatch extends Match {
  game: EsportsGame
  bestOf?: number
  mapScores?: string[]
}

// ========== 关注/收藏类型 ==========
export interface FavoriteItem {
  id: string
  type: 'team' | 'player' | 'match'
  sportType: SportType
  name: string
  logo?: string
  extra?: Record<string, string | number | undefined>
  matchData?: Match
}

// ========== 存储类型 ==========
export interface StorageData {
  favorites: FavoriteItem[]
  settings: AppSettings
  cachedMatches: {
    nba: Match[]
    football: Match[]
    esports: Match[]
  }
  lastFetchTime: {
    nba: number
    football: number
    esports: number
  }
}

export interface AppSettings {
  refreshInterval: number // minutes
  enableNotifications: boolean
  theme: 'dark' | 'light'
  language: 'zh' | 'en'
  activeTab: SportType
  esportsGameFilter: EsportsGame | 'all'
  footballLeagueFilter: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  refreshInterval: 10,
  enableNotifications: true,
  theme: 'dark',
  language: 'zh',
  activeTab: 'nba',
  esportsGameFilter: 'all',
  footballLeagueFilter: 'all',
}
