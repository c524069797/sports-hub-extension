import type { Match } from '../types'
import { useMatches } from '../hooks/useData'
import MatchList from './MatchList'

interface NBATabProps {
  onMatchClick?: (match: Match) => void
}

export default function NBATab({ onMatchClick }: NBATabProps) {
  const { matches, loading, error, refresh } = useMatches('nba')

  return (
    <div className="tab-content">
      <MatchList
        matches={matches}
        loading={loading}
        error={error}
        sportType="nba"
        onRefresh={refresh}
        onMatchClick={onMatchClick}
      />
    </div>
  )
}
