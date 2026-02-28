import type { FavoriteItem, SportType } from '../types'
import { useFavorites } from '../hooks/useData'
import { useI18n } from '../i18n'

export default function FavoritesPanel() {
  const { favorites, loading, removeFavorite } = useFavorites()
  const { locale, t } = useI18n()

  const SPORT_LABELS: Record<SportType, string> = {
    nba: t.sportTypes.nba,
    football: t.sportTypes.football,
    esports: t.sportTypes.esports,
  }

  const TYPE_LABELS: Record<string, string> = {
    team: t.types.team,
    player: locale === 'zh' ? '球员/选手' : 'Player',
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
        <p className="favorites-panel__hint">{t.favorites.hintTeam}</p>
        <p className="favorites-panel__hint">{t.favorites.hintPlayer}</p>
      </div>
    )
  }

  // 按运动类型分组，再按 type 分组
  const grouped = favorites.reduce<Record<string, FavoriteItem[]>>((acc, item) => {
    const key = `${item.sportType}-${item.type}`
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  // 排序 key: nba-team, nba-player, football-team, ...
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
