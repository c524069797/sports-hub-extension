import type { Match, PlayerStat } from '../types'

// NBA 数据来源：ESPN 公开 API（无需认证）

interface NbaApiGame {
  gameId: string
  gameStatusText: string
  gameStatus: number // 1=upcoming, 2=live, 3=finished
  gameTimeUTC: string
  homeTeam: {
    teamId: number
    teamName: string
    teamTricode: string
    score: number
  }
  awayTeam: {
    teamId: number
    teamName: string
    teamTricode: string
    score: number
  }
}

function parseNbaStatus(gameStatus: number): Match['status'] {
  if (gameStatus === 1) return 'upcoming'
  if (gameStatus === 2) return 'live'
  return 'finished'
}

function getNbaLogoByTeamId(teamId: number): string {
  return `https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`
}

const NBA_TEAM_IDS: Record<string, number> = {
  ATL: 1610612737, BOS: 1610612738, BKN: 1610612751, CHA: 1610612766,
  CHI: 1610612741, CLE: 1610612739, DAL: 1610612742, DEN: 1610612743,
  DET: 1610612765, GSW: 1610612744, HOU: 1610612745, IND: 1610612754,
  LAC: 1610612746, LAL: 1610612747, MEM: 1610612763, MIA: 1610612748,
  MIL: 1610612749, MIN: 1610612750, NOP: 1610612740, NYK: 1610612752,
  OKC: 1610612760, ORL: 1610612753, PHI: 1610612755, PHX: 1610612756,
  POR: 1610612757, SAC: 1610612758, SAS: 1610612759, TOR: 1610612761,
  UTA: 1610612762, WAS: 1610612764,
}

const NBA_TEAM_CN: Record<string, string> = {
  Lakers: '湖人', Celtics: '凯尔特人', Warriors: '勇士', Nets: '篮网',
  Knicks: '尼克斯', '76ers': '76人', Bucks: '雄鹿', Heat: '热火',
  Nuggets: '掘金', Suns: '太阳', Mavericks: '独行侠', Thunder: '雷霆',
  Clippers: '快船', Kings: '国王', Timberwolves: '森林狼', Pelicans: '鹈鹕',
  Grizzlies: '灰熊', Spurs: '马刺', Rockets: '火箭', Cavaliers: '骑士',
  Hawks: '老鹰', Bulls: '公牛', Pacers: '步行者', Magic: '魔术',
  Raptors: '猛龙', Hornets: '黄蜂', Pistons: '活塞', Wizards: '奇才',
  'Trail Blazers': '开拓者', Jazz: '爵士',
}

function getTeamCnName(engName: string): string {
  return NBA_TEAM_CN[engName] ?? engName
}

// 获取比赛的详细球员数据（使用 ESPN summary API）
async function fetchGameBoxscore(gameId: string): Promise<{ homePlayers: PlayerStat[]; awayPlayers: PlayerStat[] } | null> {
  try {
    const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`
    const response = await fetch(summaryUrl, {
      headers: { 'Accept': 'application/json' },
    })

    if (!response.ok) return null

    const data = await response.json()
    const boxscore = data.boxscore

    if (!boxscore?.players || boxscore.players.length < 2) return null

    // ESPN boxscore labels: ['MIN', 'PTS', 'FG', '3PT', 'FT', 'REB', 'AST', 'TO', 'STL', 'BLK', ...]
    const parseTeamPlayers = (teamData: any): PlayerStat[] => {
      const teamName = teamData.team?.displayName ?? ''
      const statGroup = teamData.statistics?.[0]
      if (!statGroup?.athletes) return []

      const labels: string[] = statGroup.labels ?? []
      const idxMIN = labels.indexOf('MIN')
      const idxPTS = labels.indexOf('PTS')
      const idxREB = labels.indexOf('REB')
      const idxAST = labels.indexOf('AST')
      const idxSTL = labels.indexOf('STL')
      const idxBLK = labels.indexOf('BLK')

      return statGroup.athletes
        .filter((ath: any) => !ath.didNotPlay && ath.stats?.[idxMIN] !== '0')
        .map((ath: any): PlayerStat => {
          const a = ath.athlete
          const s = ath.stats ?? []
          return {
            id: String(a.id),
            name: a.displayName ?? a.shortName ?? '',
            team: teamName,
            position: a.position?.abbreviation ?? 'N/A',
            stats: {
              得分: parseInt(s[idxPTS], 10) || 0,
              篮板: parseInt(s[idxREB], 10) || 0,
              助攻: parseInt(s[idxAST], 10) || 0,
              抢断: parseInt(s[idxSTL], 10) || 0,
              盖帽: parseInt(s[idxBLK], 10) || 0,
              时间: s[idxMIN] ?? '0',
            },
          }
        })
    }

    // ESPN boxscore.players 顺序不固定，需要判断 homeAway
    // 但 summary API 的 players 可能没有 homeAway 标记，通常第一个是客队，第二个是主队
    // 通过 header.competitions 来确认
    let homeIdx = 1
    let awayIdx = 0
    const header = data.header
    if (header?.competitions?.[0]?.competitors) {
      const competitors = header.competitions[0].competitors
      const homeTeamId = competitors.find((c: any) => c.homeAway === 'home')?.team?.id
      if (homeTeamId && String(boxscore.players[0]?.team?.id) === String(homeTeamId)) {
        homeIdx = 0
        awayIdx = 1
      }
    }

    const homePlayers = parseTeamPlayers(boxscore.players[homeIdx])
    const awayPlayers = parseTeamPlayers(boxscore.players[awayIdx])

    return { homePlayers, awayPlayers }
  } catch (error) {
    console.error(`Failed to fetch boxscore for game ${gameId}:`, error)
    return null
  }
}

async function fetchNBAScoreboardByDate(dateStr: string): Promise<NbaApiGame[]> {
  // cdn.nba.com 的历史 scoreboard 端点返回 403，改用 ESPN API
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${dateStr}`
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!resp.ok) return []

    const data = await resp.json() as {
      events: Array<{
        id: string
        date: string
        competitions: Array<{
          status: {
            clock: number
            displayClock: string
            period: number
            type: { state: string; completed: boolean; description: string; detail: string; shortDetail: string }
          }
          competitors: Array<{
            homeAway: 'home' | 'away'
            score: string
            team: { id: string; displayName: string; shortDisplayName: string; abbreviation: string }
          }>
        }>
      }>
    }

    return (data.events ?? []).map((event) => {
      const comp = event.competitions[0]
      const home = comp.competitors.find((c) => c.homeAway === 'home')
      const away = comp.competitors.find((c) => c.homeAway === 'away')
      if (!home || !away) return null

      const state = comp.status.type.state // 'pre' | 'in' | 'post'
      const homeScore = parseInt(home.score, 10) || 0
      const awayScore = parseInt(away.score, 10) || 0

      // 映射 ESPN state → NbaApiGame gameStatus
      let gameStatus: number
      let gameStatusText: string
      if (state === 'in') {
        gameStatus = 2 // live
        // 生成如 "Q3 5:32" 的状态文本
        const period = comp.status.period
        const clock = comp.status.displayClock
        gameStatusText = `Q${period} ${clock}`
      } else if (state === 'post') {
        gameStatus = 3 // finished
        gameStatusText = comp.status.type.shortDetail || 'Final'
      } else {
        gameStatus = 1 // upcoming
        gameStatusText = ''
      }

      return {
        gameId: event.id, // ESPN 原生 ID（纯数字），用于查询 summary API
        gameStatusText,
        gameStatus,
        gameTimeUTC: event.date,
        homeTeam: {
          teamId: NBA_TEAM_IDS[home.team.abbreviation] ?? parseInt(home.team.id, 10),
          teamName: home.team.shortDisplayName,
          teamTricode: home.team.abbreviation,
          score: homeScore,
        },
        awayTeam: {
          teamId: NBA_TEAM_IDS[away.team.abbreviation] ?? parseInt(away.team.id, 10),
          teamName: away.team.shortDisplayName,
          teamTricode: away.team.abbreviation,
          score: awayScore,
        },
      } satisfies NbaApiGame
    }).filter((g): g is NbaApiGame => g !== null)
  } catch {
    return []
  }
}

function formatDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

async function parseNbaGames(games: NbaApiGame[], gameDate?: string): Promise<Match[]> {
  return Promise.all(
    games.map(async (game) => {
      const extra: Record<string, string> = {}
      extra.statusText = game.gameStatusText
      if (gameDate) {
        extra.gameDate = gameDate
      }

      const match: Match = {
        id: `nba-${game.gameId}`,
        sportType: 'nba' as const,
        homeTeam: getTeamCnName(game.homeTeam.teamName),
        awayTeam: getTeamCnName(game.awayTeam.teamName),
        homeScore: game.homeTeam.score,
        awayScore: game.awayTeam.score,
        homeLogo: getNbaLogoByTeamId(game.homeTeam.teamId),
        awayLogo: getNbaLogoByTeamId(game.awayTeam.teamId),
        status: parseNbaStatus(game.gameStatus),
        startTime: game.gameTimeUTC,
        league: 'NBA',
        extra,
      }

      // 只为已开始的比赛获取球员数据
      if (game.gameStatus === 2 || game.gameStatus === 3) {
        const boxscore = await fetchGameBoxscore(game.gameId)
        if (boxscore) {
          match.homePlayers = boxscore.homePlayers
          match.awayPlayers = boxscore.awayPlayers
        }
      }

      return match
    })
  )
}

export async function fetchNBAMatches(): Promise<Match[]> {
  try {
    // ESPN 按美国日期查询，美国日期的比赛在东亚时区是次日
    // 所以查询本地"昨天"和"今天"对应的 ESPN 日期，即可得到本地今天+明天的比赛
    const now = new Date()
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    const todayStr = formatDateStr(now)
    const yesterdayStr = formatDateStr(yesterday)

    const [todayUSGames, yesterdayUSGames] = await Promise.all([
      fetchNBAScoreboardByDate(todayStr),
      fetchNBAScoreboardByDate(yesterdayStr),
    ])

    // 不传 gameDate，让前端根据 startTime 在浏览器本地时区自动计算日期归属
    const [todayUSMatches, yesterdayUSMatches] = await Promise.all([
      parseNbaGames(todayUSGames),
      parseNbaGames(yesterdayUSGames),
    ])

    return [...todayUSMatches, ...yesterdayUSMatches]
  } catch (error) {
    console.error('Failed to fetch NBA matches:', error)
    return getFallbackNBAMatches()
  }
}

function getFallbackNBAMatches(): Match[] {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().split('T')[0]

  return [
    {
      id: 'nba-fallback-1',
      sportType: 'nba',
      homeTeam: '湖人',
      awayTeam: '凯尔特人',
      homeScore: 108,
      awayScore: 112,
      homeLogo: getNbaLogoByTeamId(NBA_TEAM_IDS.LAL),
      awayLogo: getNbaLogoByTeamId(NBA_TEAM_IDS.BOS),
      status: 'finished',
      startTime: `${todayStr}T02:30:00Z`,
      league: 'NBA',
      extra: { statusText: '已结束', homeLeader: 'LeBron James 28分 8板 9助', awayLeader: 'Jayson Tatum 32分 7板 5助' },
      homePlayers: [
        { id: 'lbj-23', name: 'LeBron James', team: '湖人', position: 'SF', stats: { 得分: 28, 篮板: 8, 助攻: 9, 抢断: 2, 盖帽: 1, 时间: '36:45' } },
        { id: 'ad-3', name: 'Anthony Davis', team: '湖人', position: 'PF', stats: { 得分: 24, 篮板: 12, 助攻: 3, 抢断: 1, 盖帽: 3, 时间: '35:20' } },
        { id: 'ar-15', name: 'Austin Reaves', team: '湖人', position: 'SG', stats: { 得分: 18, 篮板: 4, 助攻: 6, 抢断: 1, 盖帽: 0, 时间: '33:10' } },
        { id: 'dr-1', name: "D'Angelo Russell", team: '湖人', position: 'PG', stats: { 得分: 15, 篮板: 2, 助攻: 7, 抢断: 1, 盖帽: 0, 时间: '30:55' } },
        { id: 'rh-8', name: 'Rui Hachimura', team: '湖人', position: 'PF', stats: { 得分: 12, 篮板: 5, 助攻: 1, 抢断: 0, 盖帽: 0, 时间: '26:30' } },
      ],
      awayPlayers: [
        { id: 'jt-0', name: 'Jayson Tatum', team: '凯尔特人', position: 'SF', stats: { 得分: 32, 篮板: 7, 助攻: 5, 抢断: 1, 盖帽: 0, 时间: '37:15' } },
        { id: 'jb-7', name: 'Jaylen Brown', team: '凯尔特人', position: 'SG', stats: { 得分: 26, 篮板: 6, 助攻: 3, 抢断: 2, 盖帽: 1, 时间: '35:40' } },
        { id: 'kp-8', name: 'Kristaps Porzingis', team: '凯尔特人', position: 'C', stats: { 得分: 22, 篮板: 9, 助攻: 2, 抢断: 0, 盖帽: 2, 时间: '32:00' } },
        { id: 'dw-4', name: 'Derrick White', team: '凯尔特人', position: 'PG', stats: { 得分: 16, 篮板: 3, 助攻: 5, 抢断: 2, 盖帽: 1, 时间: '34:20' } },
        { id: 'ah-42', name: 'Al Horford', team: '凯尔特人', position: 'C', stats: { 得分: 8, 篮板: 6, 助攻: 4, 抢断: 1, 盖帽: 1, 时间: '24:15' } },
      ],
    },
    {
      id: 'nba-fallback-2',
      sportType: 'nba',
      homeTeam: '勇士',
      awayTeam: '掘金',
      homeScore: 0,
      awayScore: 0,
      homeLogo: getNbaLogoByTeamId(NBA_TEAM_IDS.GSW),
      awayLogo: getNbaLogoByTeamId(NBA_TEAM_IDS.DEN),
      status: 'upcoming',
      startTime: `${todayStr}T03:00:00Z`,
      league: 'NBA',
      extra: { statusText: '未开始' },
    },
    {
      id: 'nba-fallback-3',
      sportType: 'nba',
      homeTeam: '独行侠',
      awayTeam: '雷霆',
      homeScore: 95,
      awayScore: 102,
      homeLogo: getNbaLogoByTeamId(NBA_TEAM_IDS.DAL),
      awayLogo: getNbaLogoByTeamId(NBA_TEAM_IDS.OKC),
      status: 'live',
      startTime: `${todayStr}T01:00:00Z`,
      league: 'NBA',
      extra: { statusText: 'Q4 5:32' },
      homePlayers: [
        { id: 'ld-77', name: 'Luka Doncic', team: '独行侠', position: 'PG', stats: { 得分: 35, 篮板: 9, 助攻: 12, 抢断: 1, 盖帽: 0, 时间: '35:28' } },
        { id: 'ki-11', name: 'Kyrie Irving', team: '独行侠', position: 'SG', stats: { 得分: 22, 篮板: 3, 助攻: 5, 抢断: 1, 盖帽: 0, 时间: '33:15' } },
        { id: 'pjw-25', name: 'PJ Washington', team: '独行侠', position: 'PF', stats: { 得分: 14, 篮板: 7, 助攻: 2, 抢断: 0, 盖帽: 1, 时间: '30:40' } },
        { id: 'dj-36', name: 'Dereck Lively II', team: '独行侠', position: 'C', stats: { 得分: 10, 篮板: 8, 助攻: 1, 抢断: 0, 盖帽: 2, 时间: '28:00' } },
      ],
      awayPlayers: [
        { id: 'sga-2', name: 'Shai Gilgeous-Alexander', team: '雷霆', position: 'SG', stats: { 得分: 38, 篮板: 5, 助攻: 6, 抢断: 2, 盖帽: 1, 时间: '36:10' } },
        { id: 'jw-12', name: 'Jalen Williams', team: '雷霆', position: 'SF', stats: { 得分: 24, 篮板: 6, 助攻: 4, 抢断: 1, 盖帽: 0, 时间: '34:20' } },
        { id: 'ch-7', name: 'Chet Holmgren', team: '雷霆', position: 'C', stats: { 得分: 18, 篮板: 10, 助攻: 2, 抢断: 0, 盖帽: 3, 时间: '32:45' } },
        { id: 'ld-5', name: 'Luguentz Dort', team: '雷霆', position: 'SG', stats: { 得分: 12, 篮板: 3, 助攻: 2, 抢断: 2, 盖帽: 0, 时间: '30:00' } },
      ],
    },
    {
      id: 'nba-fallback-4',
      sportType: 'nba',
      homeTeam: '雄鹿',
      awayTeam: '76人',
      homeScore: 0,
      awayScore: 0,
      homeLogo: getNbaLogoByTeamId(NBA_TEAM_IDS.MIL),
      awayLogo: getNbaLogoByTeamId(NBA_TEAM_IDS.PHI),
      status: 'upcoming',
      startTime: `${tomorrowStr}T00:00:00Z`,
      league: 'NBA',
      extra: { statusText: '未开始' },
    },
  ]
}
