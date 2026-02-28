import type { Match } from '../types'
import { useMatches } from '../hooks/useData'
import MatchList from './MatchList'

interface FootballTabProps {
  onMatchClick?: (match: Match) => void
}

export default function FootballTab({ onMatchClick }: FootballTabProps) {
  const { matches, loading, error, refresh } = useMatches('football')

  return (
    <div className="tab-content">
      <MatchList
        matches={matches}
        loading={loading}
        error={error}
        sportType="football"
        onRefresh={refresh}
        onMatchClick={onMatchClick}
      />
    </div>
  )
}
