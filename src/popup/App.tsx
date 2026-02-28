import { useState, useEffect } from 'react'
import type { SportType, Match } from '../types'
import { useSettings } from '../hooks/useData'
import { useI18n } from '../i18n'
import NBATab from '../components/NBATab'
import FootballTab from '../components/FootballTab'
import EsportsTab from '../components/EsportsTab'
import FavoritesPanel from '../components/FavoritesPanel'
import SettingsPanel from '../components/SettingsPanel'
import MatchDetail from '../components/MatchDetail'

type ViewType = SportType | 'favorites' | 'settings'

export default function App() {
  const { settings } = useSettings()
  const { t } = useI18n()
  const [activeView, setActiveView] = useState<ViewType>('nba')
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

  useEffect(() => {
    if (settings?.activeTab) {
      setActiveView(settings.activeTab)
    }
  }, [settings?.activeTab])

  const theme = settings?.theme ?? 'dark'

  const TABS: Array<{ key: ViewType; label: string; icon: string }> = [
    { key: 'nba', label: t.nav.nba, icon: '🏀' },
    { key: 'football', label: t.nav.football, icon: '⚽' },
    { key: 'esports', label: t.nav.esports, icon: '🎮' },
    { key: 'favorites', label: t.nav.favorites, icon: '★' },
    { key: 'settings', label: t.nav.settings, icon: '⚙' },
  ]

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match)
  }

  const handleBackFromDetail = () => {
    setSelectedMatch(null)
  }

  // 如果有选中的比赛，显示详情页
  if (selectedMatch) {
    return (
      <div className={`app app--${theme}`}>
        <main className="app__content app__content--detail">
          <MatchDetail match={selectedMatch} onBack={handleBackFromDetail} />
        </main>
      </div>
    )
  }

  return (
    <div className={`app app--${theme}`}>
      {/* Header */}
      <header className="app__header">
        <h1 className="app__title">{t.app.title}</h1>
        <span className="app__subtitle">{t.app.subtitle}</span>
      </header>

      {/* Tab Bar */}
      <nav className="tab-bar">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            className={`tab-bar__item ${activeView === key ? 'tab-bar__item--active' : ''}`}
            onClick={() => setActiveView(key)}
          >
            <span className="tab-bar__icon">{icon}</span>
            <span className="tab-bar__label">{label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="app__content">
        {activeView === 'nba' && <NBATab onMatchClick={handleMatchClick} />}
        {activeView === 'football' && <FootballTab onMatchClick={handleMatchClick} />}
        {activeView === 'esports' && <EsportsTab onMatchClick={handleMatchClick} />}
        {activeView === 'favorites' && <FavoritesPanel />}
        {activeView === 'settings' && <SettingsPanel />}
      </main>
    </div>
  )
}
