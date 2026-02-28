import type { StorageData, FavoriteItem, AppSettings, Match, SportType } from '../types'
import { DEFAULT_SETTINGS } from '../types'

const STORAGE_KEYS = {
  FAVORITES: 'favorites',
  SETTINGS: 'settings',
  CACHED_MATCHES: 'cachedMatches',
  LAST_FETCH_TIME: 'lastFetchTime',
} as const

function getStorage(): typeof chrome.storage.local {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return chrome.storage.local
  }
  // Fallback for dev environment
  return {
    get: (keys: string | string[] | Record<string, unknown> | null) =>
      new Promise((resolve) => {
        const result: Record<string, unknown> = {}
        const keyList = Array.isArray(keys) ? keys : typeof keys === 'string' ? [keys] : keys ? Object.keys(keys) : []
        for (const key of keyList) {
          const stored = localStorage.getItem(key)
          if (stored) {
            try {
              result[key] = JSON.parse(stored)
            } catch {
              result[key] = stored
            }
          }
        }
        resolve(result)
      }),
    set: (items: Record<string, unknown>) =>
      new Promise<void>((resolve) => {
        for (const [key, value] of Object.entries(items)) {
          localStorage.setItem(key, JSON.stringify(value))
        }
        resolve()
      }),
    remove: (keys: string | string[]) =>
      new Promise<void>((resolve) => {
        const keyList = Array.isArray(keys) ? keys : [keys]
        for (const key of keyList) {
          localStorage.removeItem(key)
        }
        resolve()
      }),
  } as unknown as typeof chrome.storage.local
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  const storage = getStorage()
  const result = await storage.get(STORAGE_KEYS.FAVORITES)
  return (result as Record<string, unknown>)[STORAGE_KEYS.FAVORITES] as FavoriteItem[] ?? []
}

export async function addFavorite(item: FavoriteItem): Promise<FavoriteItem[]> {
  const favorites = await getFavorites()
  const exists = favorites.some((f) => f.id === item.id && f.sportType === item.sportType)
  if (exists) return favorites

  const updated = [...favorites, item]
  await getStorage().set({ [STORAGE_KEYS.FAVORITES]: updated })
  return updated
}

export async function removeFavorite(id: string, sportType: SportType): Promise<FavoriteItem[]> {
  const favorites = await getFavorites()
  const updated = favorites.filter((f) => !(f.id === id && f.sportType === sportType))
  await getStorage().set({ [STORAGE_KEYS.FAVORITES]: updated })
  return updated
}

export async function isFavorite(id: string, sportType: SportType): Promise<boolean> {
  const favorites = await getFavorites()
  return favorites.some((f) => f.id === id && f.sportType === sportType)
}

export async function getSettings(): Promise<AppSettings> {
  const storage = getStorage()
  const result = await storage.get(STORAGE_KEYS.SETTINGS)
  const stored = (result as Record<string, unknown>)[STORAGE_KEYS.SETTINGS] as Partial<AppSettings> | undefined
  return { ...DEFAULT_SETTINGS, ...stored }
}

export async function updateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings()
  const updated = { ...current, ...partial }
  await getStorage().set({ [STORAGE_KEYS.SETTINGS]: updated })
  return updated
}

export async function getCachedMatches(sportType: SportType): Promise<Match[]> {
  const storage = getStorage()
  const result = await storage.get(STORAGE_KEYS.CACHED_MATCHES)
  const cached = (result as Record<string, unknown>)[STORAGE_KEYS.CACHED_MATCHES] as StorageData['cachedMatches'] | undefined
  return cached?.[sportType] ?? []
}

export async function setCachedMatches(sportType: SportType, matches: Match[]): Promise<void> {
  const storage = getStorage()
  const result = await storage.get(STORAGE_KEYS.CACHED_MATCHES)
  const cached = (result as Record<string, unknown>)[STORAGE_KEYS.CACHED_MATCHES] as StorageData['cachedMatches'] ?? {
    nba: [],
    football: [],
    esports: [],
  }
  const updated = { ...cached, [sportType]: matches }
  await getStorage().set({ [STORAGE_KEYS.CACHED_MATCHES]: updated })
}

export async function getLastFetchTime(sportType: SportType): Promise<number> {
  const storage = getStorage()
  const result = await storage.get(STORAGE_KEYS.LAST_FETCH_TIME)
  const times = (result as Record<string, unknown>)[STORAGE_KEYS.LAST_FETCH_TIME] as StorageData['lastFetchTime'] | undefined
  return times?.[sportType] ?? 0
}

export async function setLastFetchTime(sportType: SportType): Promise<void> {
  const storage = getStorage()
  const result = await storage.get(STORAGE_KEYS.LAST_FETCH_TIME)
  const times = (result as Record<string, unknown>)[STORAGE_KEYS.LAST_FETCH_TIME] as StorageData['lastFetchTime'] ?? {
    nba: 0,
    football: 0,
    esports: 0,
  }
  const updated = { ...times, [sportType]: Date.now() }
  await getStorage().set({ [STORAGE_KEYS.LAST_FETCH_TIME]: updated })
}

export async function shouldRefresh(sportType: SportType, intervalMinutes: number): Promise<boolean> {
  const lastFetch = await getLastFetchTime(sportType)
  if (lastFetch === 0) return true
  const elapsed = Date.now() - lastFetch
  return elapsed > intervalMinutes * 60 * 1000
}
