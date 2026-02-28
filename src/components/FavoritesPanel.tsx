import type { FavoriteItem, SportType, Match } from '../types'
import { useFavorites } from '../hooks/useData'
import { useI18n } from '../i18n'
import { translateTeamName } from '../i18n/team-names'
import { getStatusText, getStatusColor, formatMatchTime } from '../utils/format'

interface FavoritesPanelProps {
  onMatchClick?: (match: Match) => void
}

export default function FavoritesPanel({ onMatchClick }: FavoritesPanelProps) {
  const { favorites, loading, removeFavorite } = useFavorites()
  const { locale, t } = useI18n()

  const SPORT_LABELS: Record<SportType, string> = {
    nba: t.sportTypes.nba,
    football: t.sportTypes.football,
    esports: t.sportTypes.esports,
  }

  const SPORT_ICONS: Record<SportType, string> = {
    nba: '🏀',
    football: '⚽',
    esports: '🎮',
  }

  const TYPE_LABELS: Record<string, string> = {
    team: t.types.team,
    player: locale === 'zh' ? '球员/选手' : 'Player',
    match: locale === 'zh' ? '比赛' : 'Match',
  }

  if (loading) {
    return (
      <div className="favorites-panel">
        <div className="spinner" />
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="favorites-panel favorites-panel--empty">
        <p className="favorites-panel__empty-text">{t.favorites.empty}</p>
        <p className="favorites-panel__hint">
          {locale === 'zh' ? '点击比赛卡片右上角的 ♡ 关注比赛' : 'Click ♡ on match cards to favorite matches'}
        </p>
        <p className="favorites-panel__hint">{t.favorites.hintTeam}</p>
        <p className="favorites-panel__hint">{t.favorites.hintPlayer}</p>
      </div>
    )
  }

  // 分离出关注的比赛和其他收藏
  const favoriteMatches = favorites.filter((f) => f.type === 'match')
  const otherFavorites = favorites.filter((f) => f.type !== 'match')

  // 其他收藏按 sportType-type 分组
  const grouped = otherFavorites.reduce<Record<string, FavoriteItem[]>>((acc, item) => {
    const key = `${item.sportType}-${item.type}`
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const sortedKeys = Object.keys(grouped).sort()

  const handleOpenProfile = (url: string) => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url })
    } else {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="favorites-panel">
      {/* 关注的比赛 - 置顶显示 */}
      {favoriteMatches.length > 0 && (
        <div className="favorites-panel__group">
          <h3 className="favorites-panel__group-title">
            {locale === 'zh' ? '♥ 关注的比赛' : '♥ Favorite Matches'}
          </h3>
          <div className="favorites-panel__matches">
            {favoriteMatches.map((item) => {
              const matchData = item.matchData
              const sportIcon = SPORT_ICONS[item.sportType]
              const statusColor = matchData ? getStatusColor(matchData.status) : undefined

              return (
                <div
                  key={item.id}
                  className="favorites-panel__match-card"
                  onClick={() => matchData && onMatchClick?.(matchData)}
                  style={{ cursor: matchData ? 'pointer' : undefined }}
                >
                  <div className="favorites-panel__match-header">
                    <span className="favorites-panel__match-sport">{sportIcon}</span>
                    <span className="favorites-panel__match-league">
                      {SPORT_LABELS[item.sportType]}
                      {item.extra?.league ? ` · ${item.extra.league}` : ''}
                    </span>
                    {matchData && (
                      <span className="favorites-panel__match-status" style={{ color: statusColor }}>
                        {getStatusText(matchData, locale)}
                      </span>
                    )}
                    <button
                      className="favorites-panel__remove-btn"
                      onClick={(e) => { e.stopPropagation(); removeFavorite(item.id, item.sportType) }}
                      title={locale === 'zh' ? '取消关注' : 'Unfavorite'}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="favorites-panel__match-body">
                    <span className="favorites-panel__match-team">
                      {matchData
                        ? translateTeamName(matchData.homeTeam, locale, matchData.sportType)
                        : item.name.split(' vs ')[0]}
                    </span>
                    <span className="favorites-panel__match-score">
                      {item.extra?.homeScore != null && item.extra?.awayScore != null
                        ? `${item.extra.homeScore} : ${item.extra.awayScore}`
                        : matchData
                          ? `${matchData.homeScore ?? 0} : ${matchData.awayScore ?? 0}`
                          : 'vs'}
                    </span>
                    <span className="favorites-panel__match-team">
                      {matchData
                        ? translateTeamName(matchData.awayTeam, locale, matchData.sportType)
                        : item.name.split(' vs ')[1]}
                    </span>
                  </div>
                  {item.extra?.startTime && (
                    <div className="favorites-panel__match-time">
                      {formatMatchTime(String(item.extra.startTime), locale)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 关注的球队和球员 */}
      {sortedKeys.map((key) => {
        const items = grouped[key]
        const [sport, type] = key.split('-') as [SportType, string]
        const title = `${SPORT_LABELS[sport]} - ${TYPE_LABELS[type] ?? type}`

        return (
          <div key={key} className="favorites-panel__group">
            <h3 className="favorites-panel__group-title">{title}</h3>
            <div className="favorites-panel__list">
              {items.map((item) => {
                const profileUrl = item.extra?.profileUrl as string | undefined
                const stats = item.extra?.stats as string | undefined

                return (
                  <div key={item.id} className="favorites-panel__item">
                    {item.logo && (
                      <img
                        className="favorites-panel__logo"
                        src={item.logo}
                        alt={item.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    )}
                    {!item.logo && (
                      <span className="favorites-panel__type-icon">
                        {item.type === 'player' ? '👤' : '🏟'}
                      </span>
                    )}
                    <div className="favorites-panel__info">
                      {profileUrl ? (
                        <a
                          className="favorites-panel__name favorites-panel__name--link"
                          href={profileUrl}
                          onClick={(e) => {
                            e.preventDefault()
                            handleOpenProfile(profileUrl)
                          }}
                          title={locale === 'zh' ? '查看详细资料' : 'View profile'}
                        >
                          {item.name} ↗
                        </a>
                      ) : (
                        <span className="favorites-panel__name">{item.name}</span>
                      )}
                      <span className="favorites-panel__meta">
                        {item.extra?.team && <span>{item.extra.team}</span>}
                        {item.extra?.position && <span> · {item.extra.position}</span>}
                        {item.extra?.league && <span> · {item.extra.league}</span>}
                      </span>
                      {stats && (
                        <span className="favorites-panel__stats">{stats}</span>
                      )}
                    </div>
                    <button
                      className="favorites-panel__remove-btn"
                      onClick={() => removeFavorite(item.id, item.sportType)}
                      title={t.favorites.unfavorite}
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
