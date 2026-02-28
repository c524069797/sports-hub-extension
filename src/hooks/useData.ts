import { useState, useEffect, useCallback } from 'react'
import type { Match, SportType, AppSettings, FavoriteItem } from '../types'
import { fetchMatches } from '../services/api'
import { getSettings, updateSettings, getFavorites, addFavorite, removeFavorite } from '../services/storage'

export function useMatches(sportType: SportType) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (force = false) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMatches(sportType, force)
      setMatches(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load matches')
    } finally {
      setLoading(false)
    }
  }, [sportType])

  useEffect(() => {
    load()
  }, [load])

  const refresh = useCallback(() => load(true), [load])

  return { matches, loading, error, refresh }
}

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings | null>(null)

  useEffect(() => {
    getSettings().then(setSettingsState)
  }, [])

  const update = useCallback(async (partial: Partial<AppSettings>) => {
    const updated = await updateSettings(partial)
    setSettingsState(updated)
    return updated
  }, [])

  return { settings, updateSettings: update }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFavorites().then((f) => {
      setFavorites(f)
      setLoading(false)
    })
  }, [])

  const add = useCallback(async (item: FavoriteItem) => {
    const updated = await addFavorite(item)
    setFavorites(updated)
  }, [])

  const remove = useCallback(async (id: string, sportType: SportType) => {
    const updated = await removeFavorite(id, sportType)
    setFavorites(updated)
  }, [])

  const isFav = useCallback(
    (id: string, sportType: SportType) => favorites.some((f) => f.id === id && f.sportType === sportType),
    [favorites],
  )

  return { favorites, loading, addFavorite: add, removeFavorite: remove, isFavorite: isFav }
}
