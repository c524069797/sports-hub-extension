import type { PlayerStat } from '../../types'

// ESPN 公共 API
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer'

interface ESPNRosterEntry {
  athlete: {
    id: string
    displayName: string
    shortName?: string
    headshot?: { href: string }
  }
  jersey?: string
  position?: { abbreviation: string; displayName: string }
  starter?: boolean
  stats?: Array<{
    abbreviation: string
    displayName: string
    displayValue: string
    value: number
  }>
}

interface ESPNRoster {
  team: { id: string; displayName: string }
  roster: ESPNRosterEntry[]
}

interface ESPNSummaryResponse {
  rosters?: ESPNRoster[]
}

interface ESPNSquadPlayer {
  id: string
  displayName: string
  jersey?: string
  age?: number
  citizenship?: string
  position?: { abbreviation: string; displayName: string }
  flag?: { alt: string }
}

// 比赛统计字段
const MATCH_STAT_KEYS = [
  { key: 'G', label: '进球' },
  { key: 'A', label: '助攻' },
  { key: 'SH', label: '射门' },
  { key: 'ST', label: '射正' },
  { key: 'FC', label: '犯规' },
  { key: 'YC', label: '黄牌' },
  { key: 'RC', label: '红牌' },
  { key: 'SV', label: '扑救' },
] as const

// 解析比赛 roster（进行中/已结束）
function parseMatchRoster(roster: ESPNRosterEntry[], teamName: string): PlayerStat[] {
  const sorted = [...roster].sort((a, b) => {
    if (a.starter && !b.starter) return -1
    if (!a.starter && b.starter) return 1
    return 0
  })

  return sorted.map((entry) => {
    const stats: Record<string, string | number> = {}
    const playerStats = entry.stats ?? []

    if (entry.jersey) {
      stats['#'] = entry.jersey
    }

    for (const { key, label } of MATCH_STAT_KEYS) {
      const found = playerStats.find((s) => s.abbreviation === key)
      if (found) {
        stats[label] = found.displayValue
      }
    }

    if (playerStats.length === 0) {
      stats['#'] = entry.jersey ?? '-'
      stats['首发'] = entry.starter ? '是' : '否'
    }

    return {
      id: entry.athlete.id,
      name: entry.athlete.displayName,
      team: teamName,
      position: entry.position?.abbreviation ?? '',
      avatar: entry.athlete.headshot?.href,
      stats,
    }
  })
}

// 解析球队大名单（赛前）
function parseSquadRoster(players: ESPNSquadPlayer[], teamName: string): PlayerStat[] {
  // 按位置分组排序：GK -> DF -> MF -> FW
  const posOrder: Record<string, number> = { G: 0, D: 1, M: 2, F: 3 }

  const sorted = [...players].sort((a, b) => {
    const posA = a.position?.abbreviation?.charAt(0) ?? 'Z'
    const posB = b.position?.abbreviation?.charAt(0) ?? 'Z'
    const orderA = posOrder[posA] ?? 9
    const orderB = posOrder[posB] ?? 9
    if (orderA !== orderB) return orderA - orderB
    const numA = parseInt(a.jersey ?? '99', 10)
    const numB = parseInt(b.jersey ?? '99', 10)
    return numA - numB
  })

  return sorted.map((player) => ({
    id: player.id,
    name: player.displayName,
    team: teamName,
    position: player.position?.abbreviation ?? '',
    stats: {
      '#': player.jersey ?? '-',
      '位置': player.position?.displayName ?? '-',
      '年龄': player.age ?? '-',
      '国籍': player.citizenship ?? player.flag?.alt ?? '-',
    },
  }))
}

// 获取球队大名单（赛前使用）
async function fetchTeamSquad(leagueSlug: string, teamId: string, teamName: string): Promise<PlayerStat[]> {
  try {
    const url = `${ESPN_BASE}/${leagueSlug}/teams/${teamId}/roster`
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!response.ok) return []

    const data = await response.json()
    const athletes: ESPNSquadPlayer[] = data.athletes ?? []
    if (athletes.length === 0) return []

    return parseSquadRoster(athletes, teamName)
  } catch (error) {
    console.error(`Failed to fetch squad for team ${teamId}:`, error)
    return []
  }
}

// 获取比赛球员数据（比赛中/结束后使用）
async function fetchMatchRoster(leagueSlug: string, eventId: string, homeTeam: string, awayTeam: string): Promise<{ homePlayers: PlayerStat[]; awayPlayers: PlayerStat[] }> {
  try {
    const url = `${ESPN_BASE}/${leagueSlug}/summary?event=${eventId}`
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!response.ok) return { homePlayers: [], awayPlayers: [] }

    const data: ESPNSummaryResponse = await response.json()
    const rosters = data.rosters ?? []
    if (rosters.length < 2) return { homePlayers: [], awayPlayers: [] }

    const homeRoster = rosters.find((r) => r.team.displayName === homeTeam)
    const awayRoster = rosters.find((r) => r.team.displayName === awayTeam)

    return {
      homePlayers: homeRoster?.roster.length ? parseMatchRoster(homeRoster.roster, homeTeam) : [],
      awayPlayers: awayRoster?.roster.length ? parseMatchRoster(awayRoster.roster, awayTeam) : [],
    }
  } catch (error) {
    console.error('Failed to fetch match roster:', error)
    return { homePlayers: [], awayPlayers: [] }
  }
}

// 主入口：根据比赛状态选择获取方式
export async function fetchMatchPlayers(
  homeTeam: string,
  awayTeam: string,
  espnEventId?: string,
  espnLeagueSlug?: string,
  espnHomeTeamId?: string,
  espnAwayTeamId?: string,
  matchStatus?: string
): Promise<{ homePlayers: PlayerStat[]; awayPlayers: PlayerStat[]; isSquad: boolean }> {
  if (!espnLeagueSlug) {
    return { homePlayers: [], awayPlayers: [], isSquad: false }
  }

  // 比赛进行中或已结束：从 match summary 获取实时数据
  if (matchStatus !== 'upcoming' && espnEventId) {
    const result = await fetchMatchRoster(espnLeagueSlug, espnEventId, homeTeam, awayTeam)
    if (result.homePlayers.length > 0 || result.awayPlayers.length > 0) {
      return { ...result, isSquad: false }
    }
  }

  // 比赛未开始或 summary 无数据：从球队大名单获取
  if (espnHomeTeamId && espnAwayTeamId) {
    const [homePlayers, awayPlayers] = await Promise.all([
      fetchTeamSquad(espnLeagueSlug, espnHomeTeamId, homeTeam),
      fetchTeamSquad(espnLeagueSlug, espnAwayTeamId, awayTeam),
    ])
    return { homePlayers, awayPlayers, isSquad: true }
  }

  return { homePlayers: [], awayPlayers: [], isSquad: false }
}
