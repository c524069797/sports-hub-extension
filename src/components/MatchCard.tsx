import type { Match, PlayerStat } from '../types'
import { getStatusText, getStatusColor, formatMatchTime } from '../utils/format'
import { useI18n } from '../i18n'
import { translateTeamName } from '../i18n/team-names'

interface MatchCardProps {
  match: Match
  isFavoriteHome?: boolean
  isFavoriteAway?: boolean
  isFavoriteMatch?: boolean
  onToggleFavorite?: (teamName: string, type: 'home' | 'away') => void
  onToggleFavoriteMatch?: (match: Match) => void
  onClick?: () => void
}

// 格式化选手名称（带位置）
function formatPlayer(player: PlayerStat): string {
  if (player.position) {
    return `${player.name}(${player.position})`
  }
  return player.name
}

export default function MatchCard({ match, isFavoriteHome, isFavoriteAway, isFavoriteMatch, onToggleFavorite, onToggleFavoriteMatch, onClick }: MatchCardProps) {
  const { locale, t, translatePlayerName } = useI18n()
  const statusColor = getStatusColor(match.status)
  const isLive = match.status === 'live'

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

  // 翻译球队名称
  const homeTeamName = translateTeamName(match.homeTeam, locale, match.sportType)
  const awayTeamName = translateTeamName(match.awayTeam, locale, match.sportType)

  const hasPlayers = (match.homePlayers?.length ?? 0) > 0 || (match.awayPlayers?.length ?? 0) > 0
  const isEsports = match.sportType === 'esports'

  return (
    <div
      className={`match-card ${isLive ? 'match-card--live' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      <div className="match-card__header">
        <span className="match-card__league">{translateLeague(match.league)}</span>
        {match.extra?.region && (
          <span className="match-card__region-tag">{match.extra.region}</span>
        )}
        <span className="match-card__status" style={{ color: statusColor }}>
          {isLive && <span className="match-card__live-dot" />}
          {getStatusText(match, locale)}
        </span>
        <button
          className={`match-card__fav-match-btn ${isFavoriteMatch ? 'match-card__fav-match-btn--active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavoriteMatch?.(match) }}
          title={isFavoriteMatch
            ? (locale === 'zh' ? '取消关注比赛' : 'Unfavorite match')
            : (locale === 'zh' ? '关注比赛' : 'Favorite match')}
        >
          {isFavoriteMatch ? '♥' : '♡'}
        </button>
      </div>

      <div className="match-card__body">
        {/* Home Team */}
        <div className="match-card__team">
          <button
            className={`match-card__fav-btn ${isFavoriteHome ? 'match-card__fav-btn--active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(match.homeTeam, 'home') }}
            title={isFavoriteHome ? t.favorites.unfavorite : t.favorites.team}
          >
            {isFavoriteHome ? '★' : '☆'}
          </button>
          {match.homeLogo && (
            <img
              className="match-card__logo"
              src={match.homeLogo}
              alt={match.homeTeam}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
          <span className="match-card__team-name">{homeTeamName}</span>
        </div>

        {/* Score */}
        <div className="match-card__score">
          {match.status === 'upcoming' ? (
            <span className="match-card__time">{formatMatchTime(match.startTime, locale)}</span>
          ) : (
            <>
              <span className={`match-card__score-num ${isLive ? 'match-card__score-num--live' : ''}`}>
                {match.homeScore ?? 0}
              </span>
              <span className="match-card__score-sep">:</span>
              <span className={`match-card__score-num ${isLive ? 'match-card__score-num--live' : ''}`}>
                {match.awayScore ?? 0}
              </span>
            </>
          )}
        </div>

        {/* Away Team */}
        <div className="match-card__team">
          <span className="match-card__team-name">{awayTeamName}</span>
          {match.awayLogo && (
            <img
              className="match-card__logo"
              src={match.awayLogo}
              alt={match.awayTeam}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
          <button
            className={`match-card__fav-btn ${isFavoriteAway ? 'match-card__fav-btn--active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(match.awayTeam, 'away') }}
            title={isFavoriteAway ? t.favorites.unfavorite : t.favorites.team}
          >
            {isFavoriteAway ? '★' : '☆'}
          </button>
        </div>
      </div>

      {/* Esports player roster preview */}
      {isEsports && hasPlayers && (
        <div className="match-card__players">
          {(match.homePlayers?.length ?? 0) > 0 && (
            <div className="match-card__player-row">
              <span className="match-card__player-team">{homeTeamName}</span>
              <span className="match-card__player-list">
                {match.homePlayers!.slice(0, 5).map((p) => formatPlayer(p)).join(' / ')}
              </span>
            </div>
          )}
          {(match.awayPlayers?.length ?? 0) > 0 && (
            <div className="match-card__player-row">
              <span className="match-card__player-team">{awayTeamName}</span>
              <span className="match-card__player-list">
                {match.awayPlayers!.slice(0, 5).map((p) => formatPlayer(p)).join(' / ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Extra info */}
      {(match.extra?.bestOf || match.extra?.matchday || match.extra?.halfTimeScore) && (
        <div className="match-card__footer">
          {match.extra.bestOf && <span className="match-card__extra">{match.extra.bestOf}</span>}
          {match.extra.matchday && <span className="match-card__extra">{match.extra.matchday}</span>}
          {match.extra.halfTimeScore && <span className="match-card__extra">{match.extra.halfTimeScore}</span>}
          {match.extra.homeLeader && (
            <span className="match-card__extra match-card__extra--leader">
              {homeTeamName}: {match.extra.homeLeaderName
                ? `${translatePlayerName(String(match.extra.homeLeaderName), match.sportType)} ${match.extra.homeLeaderStats}`
                : match.extra.homeLeader}
            </span>
          )}
          {match.extra.awayLeader && (
            <span className="match-card__extra match-card__extra--leader">
              {awayTeamName}: {match.extra.awayLeaderName
                ? `${translatePlayerName(String(match.extra.awayLeaderName), match.sportType)} ${match.extra.awayLeaderStats}`
                : match.extra.awayLeader}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
