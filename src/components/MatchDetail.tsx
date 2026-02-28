import { useState, useEffect, useRef } from 'react'
import type { Match, PlayerStat, EsportsGame } from '../types'
import { getStatusText, getStatusColor, formatFullDateTime } from '../utils/format'
import { useFavorites } from '../hooks/useData'
import { useI18n } from '../i18n'
import { translateTeamName } from '../i18n/team-names'
import { fetchMatchPlayers } from '../services/players/football-players'
import { fetchEsportsMatchPlayers } from '../services/players/esports-players'
import { API_KEYS } from '../config/api-keys'

interface MatchDetailProps {
  match: Match
  onBack: () => void
}

export default function MatchDetail({ match, onBack }: MatchDetailProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'away'>('home')
  const [loadingPlayers, setLoadingPlayers] = useState(false)
  const [homePlayers, setHomePlayers] = useState<PlayerStat[]>(match.homePlayers ?? [])
  const [awayPlayers, setAwayPlayers] = useState<PlayerStat[]>(match.awayPlayers ?? [])
  const [isSquadData, setIsSquadData] = useState(false)
  const hasAttemptedLoad = useRef(false)
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const { locale, t, translatePlayerName } = useI18n()
  const statusColor = getStatusColor(match.status)
  const isLive = match.status === 'live'

  // 如果没有球员数据，按需加载（只尝试一次）
  useEffect(() => {
    if (hasAttemptedLoad.current) return
    if ((match.homePlayers ?? []).length > 0 || (match.awayPlayers ?? []).length > 0) return

    hasAttemptedLoad.current = true

    let cancelled = false

    const loadPlayers = async () => {
      setLoadingPlayers(true)
      try {
        if (match.sportType === 'football') {
          const espnEventId = match.extra?.espnEventId as string | undefined
          const espnLeagueSlug = match.extra?.espnLeagueSlug as string | undefined
          const espnHomeTeamId = match.extra?.espnHomeTeamId as string | undefined
          const espnAwayTeamId = match.extra?.espnAwayTeamId as string | undefined
          const result = await fetchMatchPlayers(
            match.homeTeam, match.awayTeam,
            espnEventId, espnLeagueSlug,
            espnHomeTeamId, espnAwayTeamId,
            match.status
          )
          if (!cancelled) {
            setHomePlayers(result.homePlayers)
            setAwayPlayers(result.awayPlayers)
            setIsSquadData(result.isSquad)
          }
        } else if (match.sportType === 'esports' && match.extra?.game) {
          const apiKey = API_KEYS.PANDASCORE
          if (apiKey) {
            const game = match.extra.game as string
            const validGames: EsportsGame[] = ['csgo', 'lol', 'valorant', 'dota2']
            if (validGames.includes(game as EsportsGame)) {
              const result = await fetchEsportsMatchPlayers(
                match.homeTeam,
                match.awayTeam,
                game as EsportsGame,
                apiKey
              )
              if (!cancelled) {
                setHomePlayers(result.homePlayers)
                setAwayPlayers(result.awayPlayers)
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load players on demand:', error)
      } finally {
        if (!cancelled) {
          setLoadingPlayers(false)
        }
      }
    }

    loadPlayers()

    return () => { cancelled = true }
  }, [match.sportType, match.homeTeam, match.awayTeam, match.extra?.game, match.homePlayers, match.awayPlayers, match.status, match.extra?.espnEventId, match.extra?.espnLeagueSlug, match.extra?.espnHomeTeamId, match.extra?.espnAwayTeamId])

  const currentPlayers = activeTab === 'home' ? homePlayers : awayPlayers

  // 翻译联赛名称
  const translateLeague = (league: string) => {
    if (match.sportType === 'football') {
      return t.footballLeagues[league as keyof typeof t.footballLeagues] || league
    }
    if (match.sportType === 'esports') {
      return t.esportsLeagues[league as keyof typeof t.esportsLeagues] || league
    }
    return league
  }

  // 翻译游戏名称
  const translateGameName = (gameName?: string | number) => {
    if (!gameName || typeof gameName === 'number') return gameName
    return t.esportsGames[gameName as keyof typeof t.esportsGames] || gameName
  }

  // 翻译球队名称
  const homeTeamName = translateTeamName(match.homeTeam, locale, match.sportType)
  const awayTeamName = translateTeamName(match.awayTeam, locale, match.sportType)

  // 构建球员/选手的个人页面 URL
  const getPlayerProfileUrl = (player: PlayerStat): string | undefined => {
    const encodedName = encodeURIComponent(player.name.replace(/\s+/g, '-'))
    if (match.sportType === 'nba') {
      // NBA 球员 → nba.com 球员页
      const nameParts = player.name.toLowerCase().split(' ')
      if (nameParts.length >= 2) {
        const slug = `${nameParts[0]}-${nameParts.slice(1).join('-')}`
        return `https://www.nba.com/player/${player.id}/${slug}`
      }
      return `https://www.nba.com/player/${player.id}`
    }
    if (match.sportType === 'football') {
      return `https://www.google.com/search?q=${encodeURIComponent(player.name + ' ' + player.team + ' football')}`
    }
    if (match.sportType === 'esports') {
      const game = match.extra?.game as string | undefined
      if (game === 'lol') {
        return `https://lol.fandom.com/wiki/${encodedName}`
      }
      if (game === 'csgo') {
        return `https://www.hltv.org/search?query=${encodeURIComponent(player.name)}`
      }
      if (game === 'valorant') {
        return `https://www.vlr.gg/search?q=${encodeURIComponent(player.name)}`
      }
      if (game === 'dota2') {
        return `https://liquipedia.net/dota2/${encodedName}`
      }
    }
    return undefined
  }

  // 格式化 stats 为简短的摘要字符串
  const formatStatsForFavorite = (player: PlayerStat): string => {
    const entries = Object.entries(player.stats)
    return entries.slice(0, 4).map(([k, v]) => `${k}:${v}`).join(' ')
  }

  const handleTogglePlayerFav = (player: PlayerStat) => {
    const playerId = `${match.sportType}-player-${player.id}`
    if (isFavorite(playerId, match.sportType)) {
      removeFavorite(playerId, match.sportType)
    } else {
      addFavorite({
        id: playerId,
        type: 'player',
        sportType: match.sportType,
        name: translatePlayerName(player.name, match.sportType),
        extra: {
          team: player.team,
          position: player.position ?? '',
          stats: formatStatsForFavorite(player),
          profileUrl: getPlayerProfileUrl(player) ?? '',
        },
      })
    }
  }

  const handleToggleTeamFav = (teamName: string, logo?: string) => {
    const teamId = `${match.sportType}-team-${teamName}`
    if (isFavorite(teamId, match.sportType)) {
      removeFavorite(teamId, match.sportType)
    } else {
      addFavorite({
        id: teamId,
        type: 'team',
        sportType: match.sportType,
        name: teamName,
        logo,
        extra: { league: match.league },
      })
    }
  }

  // 获取球员数据的列名
  const statColumns = currentPlayers.length > 0
    ? Object.keys(currentPlayers[0].stats)
    : []

  return (
    <div className="match-detail">
      {/* Header with back button */}
      <div className="match-detail__nav">
        <button className="match-detail__back" onClick={onBack}>
          ← {t.matchDetail.back}
        </button>
        <span className="match-detail__league">{translateLeague(match.league)}</span>
        {match.extra?.gameName && (
          <span className="match-card__game-tag">{translateGameName(match.extra.gameName)}</span>
        )}
      </div>

      {/* Score Board */}
      <div className={`match-detail__scoreboard ${isLive ? 'match-detail__scoreboard--live' : ''}`}>
        <div className="match-detail__team-col">
          <button
            className={`match-detail__team-fav ${isFavorite(`${match.sportType}-team-${match.homeTeam}`, match.sportType) ? 'match-detail__team-fav--active' : ''}`}
            onClick={() => handleToggleTeamFav(match.homeTeam, match.homeLogo)}
          >
            {isFavorite(`${match.sportType}-team-${match.homeTeam}`, match.sportType) ? '★' : '☆'}
          </button>
          {match.homeLogo && (
            <img className="match-detail__team-logo" src={match.homeLogo} alt={match.homeTeam}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
          <span className="match-detail__team-name">{homeTeamName}</span>
        </div>

        <div className="match-detail__score-center">
          <div className="match-detail__score-big">
            <span className={isLive ? 'match-detail__score-live' : ''}>{match.homeScore ?? 0}</span>
            <span className="match-detail__score-sep">:</span>
            <span className={isLive ? 'match-detail__score-live' : ''}>{match.awayScore ?? 0}</span>
          </div>
          <span className="match-detail__status-text" style={{ color: statusColor }}>
            {isLive && <span className="match-card__live-dot" />}
            {getStatusText(match, locale)}
          </span>
          <span className="match-detail__time">{formatFullDateTime(match.startTime, locale)}</span>
        </div>

        <div className="match-detail__team-col">
          <button
            className={`match-detail__team-fav ${isFavorite(`${match.sportType}-team-${match.awayTeam}`, match.sportType) ? 'match-detail__team-fav--active' : ''}`}
            onClick={() => handleToggleTeamFav(match.awayTeam, match.awayLogo)}
          >
            {isFavorite(`${match.sportType}-team-${match.awayTeam}`, match.sportType) ? '★' : '☆'}
          </button>
          {match.awayLogo && (
            <img className="match-detail__team-logo" src={match.awayLogo} alt={match.awayTeam}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
          <span className="match-detail__team-name">{awayTeamName}</span>
        </div>
      </div>

      {/* Extra info */}
      {(match.extra?.bestOf || match.extra?.matchday || match.extra?.halfTimeScore) && (
        <div className="match-detail__extra-row">
          {match.extra.bestOf && <span className="match-detail__extra-tag">{match.extra.bestOf}</span>}
          {match.extra.matchday && <span className="match-detail__extra-tag">{match.extra.matchday}</span>}
          {match.extra.halfTimeScore && <span className="match-detail__extra-tag">{match.extra.halfTimeScore}</span>}
        </div>
      )}

      {/* Player Stats Section */}
      {loadingPlayers && (
        <div className="match-detail__no-data">
          {match.sportType === 'esports'
            ? (locale === 'zh' ? '加载选手数据中...' : 'Loading player data...')
            : (locale === 'zh' ? '加载球员数据中...' : 'Loading player data...')}
        </div>
      )}

      {!loadingPlayers && (homePlayers.length > 0 || awayPlayers.length > 0) && (
        <div className="match-detail__players">
          {/* 大名单提示 */}
          {isSquadData && (
            <div className="match-detail__squad-hint">
              {locale === 'zh'
                ? '* 当前显示为球队大名单，比赛实际出战阵容可能有所不同'
                : '* Showing full squad roster. Actual match lineup may differ.'}
            </div>
          )}
          <div className="match-detail__player-tabs">
            <button
              className={`match-detail__player-tab ${activeTab === 'home' ? 'match-detail__player-tab--active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              {homeTeamName} ({homePlayers.length})
            </button>
            <button
              className={`match-detail__player-tab ${activeTab === 'away' ? 'match-detail__player-tab--active' : ''}`}
              onClick={() => setActiveTab('away')}
            >
              {awayTeamName} ({awayPlayers.length})
            </button>
          </div>

          {currentPlayers.length > 0 ? (
            <div className="match-detail__stats-table-wrap">
              <table className="match-detail__stats-table">
                <thead>
                  <tr>
                    <th className="match-detail__th-name">{match.sportType === 'esports' ? (locale === 'zh' ? '选手' : 'Player') : (locale === 'zh' ? '球员' : 'Player')}</th>
                    {statColumns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                    <th>{locale === 'zh' ? '关注' : 'Fav'}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPlayers.map((player) => {
                    const playerId = `${match.sportType}-player-${player.id}`
                    const isFav = isFavorite(playerId, match.sportType)
                    return (
                      <tr key={player.id}>
                        <td className="match-detail__td-name">
                          <span className="match-detail__player-name">{translatePlayerName(player.name, match.sportType)}</span>
                          {player.position && (
                            <span className="match-detail__player-pos">{player.position}</span>
                          )}
                        </td>
                        {statColumns.map((col) => (
                          <td key={col}>{player.stats[col] ?? '-'}</td>
                        ))}
                        <td>
                          <button
                            className={`match-detail__fav-btn ${isFav ? 'match-detail__fav-btn--active' : ''}`}
                            onClick={() => handleTogglePlayerFav(player)}
                            title={isFav ? t.matchDetail.unfavoritePlayer : t.matchDetail.favoritePlayer}
                          >
                            {isFav ? '★' : '☆'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="match-detail__no-data">{match.sportType === 'esports' ? t.matchDetail.noPlayerDataEsports : t.matchDetail.noPlayerData}</div>
          )}
        </div>
      )}

      {!loadingPlayers && homePlayers.length === 0 && awayPlayers.length === 0 && (
        <div className="match-detail__no-data">
          {match.sportType === 'esports' && !API_KEYS.PANDASCORE
            ? (locale === 'zh' ? '未配置 PandaScore API Key，无法获取选手数据' : 'PandaScore API key not configured')
            : match.sportType === 'esports' && !match.extra?.game
              ? (locale === 'zh' ? '无法识别游戏类型，无法加载选手数据' : 'Unknown game type, cannot load player data')
              : match.sportType === 'esports' ? t.matchDetail.noPlayerDataEsports : t.matchDetail.noPlayerData}
        </div>
      )}
    </div>
  )
}
