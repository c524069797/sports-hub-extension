import type { PlayerStat, EsportsGame } from '../../types'

// PandaScore 免费 API (需要注册获取 key)
// 用户可以在 https://pandascore.co 注册获取免费 API key
// 免费计划: 1000 请求/小时

interface PandaScorePlayer {
  id: number
  name: string
  slug: string
  first_name: string
  last_name: string
  role: string
  nationality: string
  current_team?: {
    id: number
    name: string
    acronym: string
  }
}

interface PandaScoreTeam {
  id: number
  name: string
  acronym: string
  players: PandaScorePlayer[]
}

// 从 PandaScore 获取战队球员
export async function fetchEsportsPlayers(
  teamName: string,
  game: EsportsGame,
  apiKey?: string
): Promise<PlayerStat[]> {
  // 如果没有 API key，返回空数组
  if (!apiKey) {
    console.log('PandaScore API key not configured')
    return []
  }

  try {
    // 游戏映射
    const gameSlugMap: Record<EsportsGame, string> = {
      csgo: 'cs-go',
      lol: 'lol',
      valorant: 'valorant',
      dota2: 'dota-2',
    }

    const gameSlug = gameSlugMap[game]
    if (!gameSlug) return []

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    }

    // 策略1: 先用 filter 精确匹配 acronym（适合短名如 AL, WBG, T1）
    let teams: PandaScoreTeam[] = []
    const filterUrl = `https://api.pandascore.co/${gameSlug}/teams?filter[acronym]=${encodeURIComponent(teamName)}&per_page=5`
    const filterResponse = await fetch(filterUrl, { headers })

    if (filterResponse.ok) {
      teams = await filterResponse.json()
    }

    // 策略2: 如果精确匹配 acronym 没结果，用 filter 精确匹配 name
    if (teams.length === 0) {
      const filterNameUrl = `https://api.pandascore.co/${gameSlug}/teams?filter[name]=${encodeURIComponent(teamName)}&per_page=5`
      const filterNameResponse = await fetch(filterNameUrl, { headers })
      if (filterNameResponse.ok) {
        teams = await filterNameResponse.json()
      }
    }

    // 策略3: 如果精确匹配都没结果，用 search 模糊搜索
    if (teams.length === 0) {
      const searchUrl = `https://api.pandascore.co/${gameSlug}/teams?search[name]=${encodeURIComponent(teamName)}&per_page=5`
      const searchResponse = await fetch(searchUrl, { headers })
      if (searchResponse.ok) {
        teams = await searchResponse.json()
      }
    }

    if (!teams || teams.length === 0) {
      console.log(`No team found: ${teamName}`)
      return []
    }

    // 优先精确匹配队名或缩写
    const team = teams.find(
      (t) => t.name.toLowerCase() === teamName.toLowerCase()
        || t.acronym?.toLowerCase() === teamName.toLowerCase()
    ) ?? teams[0]

    // 选手数据直接从 team 对象获取
    const players: PandaScorePlayer[] = team.players ?? []

    if (players.length === 0) {
      return []
    }

    // 转换为我们的 PlayerStat 格式
    const playerStats: PlayerStat[] = players.slice(0, 10).map((player) => ({
      id: `esports-${player.id}`,
      name: player.name || `${player.first_name} ${player.last_name}`.trim(),
      team: team.name,
      position: player.role || '',
      stats: {
        '位置': player.role || '-',
        '国籍': player.nationality || '-',
        'ID': player.slug || '-',
      },
    }))

    return playerStats
  } catch (error) {
    console.error('Failed to fetch esports players:', error)
    return []
  }
}

// 批量获取两支战队的球员
export async function fetchEsportsMatchPlayers(
  homeTeam: string,
  awayTeam: string,
  game: EsportsGame,
  apiKey?: string
): Promise<{ homePlayers: PlayerStat[]; awayPlayers: PlayerStat[] }> {
  if (!apiKey) {
    return { homePlayers: [], awayPlayers: [] }
  }

  try {
    // 并行获取两支战队的球员
    const [homePlayers, awayPlayers] = await Promise.all([
      fetchEsportsPlayers(homeTeam, game, apiKey),
      fetchEsportsPlayers(awayTeam, game, apiKey),
    ])

    return { homePlayers, awayPlayers }
  } catch (error) {
    console.error('Failed to fetch esports match players:', error)
    return { homePlayers: [], awayPlayers: [] }
  }
}
