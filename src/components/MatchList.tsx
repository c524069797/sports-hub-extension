import type { Match, SportType } from '../types'
import MatchCard from './MatchCard'
import { useFavorites } from '../hooks/useData'
import { useI18n } from '../i18n'

interface MatchListProps {
  matches: Match[]
  loading: boolean
  error: string | null
  sportType: SportType
  onRefresh: () => void
  onMatchClick?: (match: Match) => void
}

export default function MatchList({ matches, loading, error, sportType, onRefresh, onMatchClick }: MatchListProps) {
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites()
  const { t } = useI18n()

  const handleToggleFavorite = (match: Match, teamName: string, side: 'home' | 'away') => {
    const teamId = `${sportType}-team-${teamName}`
    const logo = side === 'home' ? match.homeLogo : match.awayLogo

    if (isFavorite(teamId, sportType)) {
      removeFavorite(teamId, sportType)
    } else {
      addFavorite({
        id: teamId,
        type: 'team',
        sportType,
        name: teamName,
        logo,
        extra: { league: match.league },
      })
    }
  }

  if (loading) {
    return (
      <div className="match-list__loading">
        <div className="spinner" />
        <p>{t.matchList.loading}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="match-list__error">
        <p>{t.matchList.loadError}: {error}</p>
        <button className="btn btn--primary" onClick={onRefresh}>
          {t.common.retry}
        </button>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="match-list__empty">
        <p>{t.matchList.noMatches}</p>
        <button className="btn btn--primary" onClick={onRefresh}>
          {t.common.refresh}
        </button>
      </div>
    )
  }

  // 排序: 进行中 > 即将开始 > 已结束
  const sortedMatches = [...matches].sort((a, b) => {
    const statusOrder = { live: 0, upcoming: 1, finished: 2 }
    const diff = statusOrder[a.status] - statusOrder[b.status]
    if (diff !== 0) return diff
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  })

  // 标记关注队伍的比赛并置顶
  const favoriteTeamNames = new Set(
    favorites.filter((f) => f.sportType === sportType).map((f) => f.name),
  )

  const favMatches = sortedMatches.filter(
    (m) => favoriteTeamNames.has(m.homeTeam) || favoriteTeamNames.has(m.awayTeam),
  )
  const otherMatches = sortedMatches.filter(
    (m) => !favoriteTeamNames.has(m.homeTeam) && !favoriteTeamNames.has(m.awayTeam),
  )

  return (
    <div className="match-list">
      <div className="match-list__header">
        <span className="match-list__count">{matches.length}{t.matchList.matchCount}</span>
        <button className="btn btn--icon" onClick={onRefresh} title={t.matchList.refreshTitle}>
          ↻
        </button>
      </div>

      {favMatches.length > 0 && (
        <>
          <div className="match-list__section-title">{t.matchList.favoriteTeams}</div>
          {favMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              isFavoriteHome={isFavorite(`${sportType}-team-${match.homeTeam}`, sportType)}
              isFavoriteAway={isFavorite(`${sportType}-team-${match.awayTeam}`, sportType)}
              onToggleFavorite={(teamName, side) => handleToggleFavorite(match, teamName, side)}
              onClick={() => onMatchClick?.(match)}
            />
          ))}
        </>
      )}

      {otherMatches.length > 0 && (
        <>
          {favMatches.length > 0 && <div className="match-list__section-title">{t.matchList.allMatches}</div>}
          {otherMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              isFavoriteHome={isFavorite(`${sportType}-team-${match.homeTeam}`, sportType)}
              isFavoriteAway={isFavorite(`${sportType}-team-${match.awayTeam}`, sportType)}
              onToggleFavorite={(teamName, side) => handleToggleFavorite(match, teamName, side)}
              onClick={() => onMatchClick?.(match)}
            />
          ))}
        </>
      )}
    </div>
  )
}
