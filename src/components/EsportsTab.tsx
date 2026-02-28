import { useState } from 'react'
import type { Match, EsportsGame } from '../types'
import { useMatches, useSettings } from '../hooks/useData'
import MatchList from './MatchList'

const GAME_FILTERS: Array<{ key: EsportsGame | 'all'; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'csgo', label: 'CS2' },
  { key: 'lol', label: 'LOL' },
  { key: 'valorant', label: 'VAL' },
  { key: 'dota2', label: 'DOTA2' },
]

interface EsportsTabProps {
  onMatchClick?: (match: Match) => void
}

export default function EsportsTab({ onMatchClick }: EsportsTabProps) {
  const { settings, updateSettings } = useSettings()
  const [gameFilter, setGameFilter] = useState<EsportsGame | 'all'>(
    settings?.esportsGameFilter ?? 'all',
  )
  const { matches, loading, error, refresh } = useMatches('esports')

  const handleFilterChange = (filter: EsportsGame | 'all') => {
    setGameFilter(filter)
    updateSettings({ esportsGameFilter: filter })
  }

  const filteredMatches =
    gameFilter === 'all'
      ? matches
      : matches.filter((m) => m.extra?.game === gameFilter)

  return (
    <div className="tab-content">
      <div className="game-filter">
        {GAME_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            className={`game-filter__btn ${gameFilter === key ? 'game-filter__btn--active' : ''}`}
            onClick={() => handleFilterChange(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <MatchList
        matches={filteredMatches}
        loading={loading}
        error={error}
        sportType="esports"
        onRefresh={refresh}
        onMatchClick={onMatchClick}
      />
    </div>
  )
}
