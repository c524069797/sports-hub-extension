import type { Match, SportType, EsportsGame } from '../types'
import { fetchNBAMatches } from './nba'
import { fetchFootballMatches } from './football'
import { fetchEsportsMatches } from './esports'
import { setCachedMatches, setLastFetchTime, getCachedMatches, shouldRefresh, getSettings } from './storage'

export async function fetchMatches(sportType: SportType, forceRefresh = false): Promise<Match[]> {
  const settings = await getSettings()

  if (!forceRefresh) {
    const needsRefresh = await shouldRefresh(sportType, settings.refreshInterval)
    if (!needsRefresh) {
      const cached = await getCachedMatches(sportType)
      if (cached.length > 0) return cached
    }
  }

  let matches: Match[]

  switch (sportType) {
    case 'nba':
      matches = await fetchNBAMatches()
      break
    case 'football':
      matches = await fetchFootballMatches()
      break
    case 'esports':
      matches = await fetchEsportsMatches(settings.esportsGameFilter)
      break
    default:
      matches = []
  }

  // Cache the results
  await setCachedMatches(sportType, matches)
  await setLastFetchTime(sportType)

  return matches
}

export async function fetchAllMatches(): Promise<Record<SportType, Match[]>> {
  const [nba, football, esports] = await Promise.all([
    fetchMatches('nba'),
    fetchMatches('football'),
    fetchMatches('esports'),
  ])

  return { nba, football, esports }
}

export { fetchNBAMatches } from './nba'
export { fetchFootballMatches } from './football'
export { fetchEsportsMatches, getGameDisplayName } from './esports'
