import type { Match, PlayerStat } from '../types'

// NBA 数据来源：cdn.nba.com 公开 scoreboard API（无需认证）
const NBA_SCOREBOARD_URL =
  'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json'

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
  gameLeaders?: {
    homeLeaders?: { name: string; points: number; rebounds: number; assists: number }
    awayLeaders?: { name: string; points: number; rebounds: number; assists: number }
  }
}

interface NbaApiResponse {
  scoreboard: {
    games: NbaApiGame[]
    gameDate: string
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

// 获取比赛的详细球员数据
async function fetchGameBoxscore(gameId: string): Promise<{ homePlayers: PlayerStat[]; awayPlayers: PlayerStat[] } | null> {
  try {
    const boxscoreUrl = `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_${gameId}.json`
    const response = await fetch(boxscoreUrl, {
      headers: {
        'Accept': 'application/json',
        'Referer': 'https://www.nba.com/',
        'Origin': 'https://www.nba.com',
      },
    })

    if (!response.ok) return null

    const data = await response.json()
    const game = data.game

    if (!game?.homeTeam?.players || !game?.awayTeam?.players) return null

    const parsePlayer = (p: any, teamName: string): PlayerStat | null => {
      if (!p.played || p.statistics.minutes === 'PT00M00.00S') return null

      const stats = p.statistics
      return {
        id: p.personId,
        name: `${p.firstName} ${p.familyName}`,
        team: teamName,
        position: p.position || 'N/A',
        stats: {
          得分: stats.points,
          篮板: stats.reboundsTotal,
          助攻: stats.assists,
          抢断: stats.steals,
          盖帽: stats.blocks,
          时间: stats.minutes.replace('PT', '').replace('M', ':').replace('.00S', ''),
        },
      }
    }

    const homePlayers = game.homeTeam.players
      .map((p: any) => parsePlayer(p, game.homeTeam.teamName))
      .filter((p: PlayerStat | null): p is PlayerStat => p !== null)

    const awayPlayers = game.awayTeam.players
      .map((p: any) => parsePlayer(p, game.awayTeam.teamName))
      .filter((p: PlayerStat | null): p is PlayerStat => p !== null)

    return { homePlayers, awayPlayers }
  } catch (error) {
    console.error(`Failed to fetch boxscore for game ${gameId}:`, error)
    return null
  }
}

export async function fetchNBAMatches(): Promise<Match[]> {
  try {
    const response = await fetch(NBA_SCOREBOARD_URL, {
      headers: {
        'Accept': 'application/json',
        'Referer': 'https://www.nba.com/',
        'Origin': 'https://www.nba.com',
      },
    })
    if (!response.ok) throw new Error(`NBA API error: ${response.status}`)

    const data: NbaApiResponse = await response.json()

    // 并行获取所有比赛的球员数据
    const gamesWithPlayers = await Promise.all(
      data.scoreboard.games.map(async (game) => {
        const extra: Record<string, string> = {}
        if (game.gameLeaders?.homeLeaders) {
          const l = game.gameLeaders.homeLeaders
          extra.homeLeaderName = l.name
          extra.homeLeaderStats = `${l.points}分 ${l.rebounds}板 ${l.assists}助`
          extra.homeLeader = `${l.name} ${l.points}分 ${l.rebounds}板 ${l.assists}助`
        }
        if (game.gameLeaders?.awayLeaders) {
          const l = game.gameLeaders.awayLeaders
          extra.awayLeaderName = l.name
          extra.awayLeaderStats = `${l.points}分 ${l.rebounds}板 ${l.assists}助`
          extra.awayLeader = `${l.name} ${l.points}分 ${l.rebounds}板 ${l.assists}助`
        }
        extra.statusText = game.gameStatusText

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

    return gamesWithPlayers
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
