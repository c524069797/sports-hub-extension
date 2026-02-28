import { useState, useEffect, useCallback } from 'react'
import type { AssetType, FinanceItem, FinanceWatchItem, FinanceSearchResult } from '../types/finance'
import { useI18n } from '../i18n'
import { getFinanceWatchlist, addFinanceWatch, removeFinanceWatch } from '../services/storage'
import { fetchGoldSilver, refreshWatchlist, searchAsset } from '../services/finance'

const ASSET_TYPE_OPTIONS: Array<{ key: AssetType | 'all'; labelZh: string; labelEn: string }> = [
  { key: 'all', labelZh: '全部', labelEn: 'All' },
  { key: 'crypto', labelZh: '加密', labelEn: 'Crypto' },
  { key: 'gold', labelZh: '贵金属', labelEn: 'Metals' },
  { key: 'stock_cn', labelZh: 'A股', labelEn: 'CN Stock' },
  { key: 'stock_us', labelZh: '美股', labelEn: 'US Stock' },
  { key: 'fund', labelZh: '基金', labelEn: 'Fund' },
]

const SEARCH_TYPE_OPTIONS: Array<{ key: AssetType; labelZh: string; labelEn: string }> = [
  { key: 'crypto', labelZh: '加密货币', labelEn: 'Crypto' },
  { key: 'stock_cn', labelZh: 'A股', labelEn: 'CN Stock' },
  { key: 'stock_us', labelZh: '美股', labelEn: 'US Stock' },
  { key: 'fund', labelZh: '基金', labelEn: 'Fund' },
]

function formatPrice(price: number, currency: string): string {
  const symbol = currency === 'CNY' ? '¥' : '$'
  if (price >= 10000) return `${symbol}${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (price >= 1) return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`
}

function formatChange(change: number, percent: number): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}%`
}

export default function FinanceTab() {
  const { locale, t } = useI18n()
  const [watchlist, setWatchlist] = useState<FinanceWatchItem[]>([])
  const [prices, setPrices] = useState<FinanceItem[]>([])
  const [goldSilver, setGoldSilver] = useState<FinanceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<AssetType | 'all'>('all')

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<AssetType>('crypto')
  const [searchResults, setSearchResults] = useState<FinanceSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [wl, gs] = await Promise.all([
        getFinanceWatchlist(),
        fetchGoldSilver(),
      ])
      setWatchlist(wl)
      setGoldSilver(gs)

      if (wl.length > 0) {
        const priceData = await refreshWatchlist(wl)
        setPrices(priceData)
      }
    } catch (err) {
      console.error('Finance data load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const [gs, priceData] = await Promise.all([
        fetchGoldSilver(),
        watchlist.length > 0 ? refreshWatchlist(watchlist) : Promise.resolve([]),
      ])
      setGoldSilver(gs)
      setPrices(priceData)
    } catch (err) {
      console.error('Refresh error:', err)
    } finally {
      setRefreshing(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const results = await searchAsset(searchQuery.trim(), searchType)
      setSearchResults(results)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleAddWatch = async (result: FinanceSearchResult) => {
    const item: FinanceWatchItem = {
      id: result.id,
      type: result.type,
      symbol: result.symbol,
      name: result.name,
      addedAt: new Date().toISOString(),
    }
    const updated = await addFinanceWatch(item)
    setWatchlist(updated)

    // Refresh prices for new item
    const priceData = await refreshWatchlist(updated)
    setPrices(priceData)

    setSearchResults((prev) => prev.filter((r) => r.id !== result.id))
  }

  const handleRemoveWatch = async (id: string) => {
    const updated = await removeFinanceWatch(id)
    setWatchlist(updated)
    setPrices((prev) => prev.filter((p) => p.id !== id))
  }

  const getPriceForWatch = (item: FinanceWatchItem): FinanceItem | undefined => {
    return prices.find((p) => p.id === item.id)
  }

  const filteredWatchlist = filter === 'all'
    ? watchlist
    : watchlist.filter((w) => w.type === filter)

  const isWatched = (id: string) => watchlist.some((w) => w.id === id)

  const financeT = t.finance

  if (loading) {
    return (
      <div className="finance-tab">
        <div className="finance-tab__loading">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="finance-tab">
      {/* Header with refresh */}
      <div className="finance-tab__header">
        <h3 className="finance-tab__title">
          {financeT?.title ?? (locale === 'zh' ? '💰 金融行情' : '💰 Finance')}
        </h3>
        <div className="finance-tab__actions">
          <button
            className="btn--icon"
            onClick={() => setShowSearch(!showSearch)}
            title={financeT?.search ?? (locale === 'zh' ? '搜索' : 'Search')}
          >
            🔍
          </button>
          <button
            className="btn--icon"
            onClick={handleRefresh}
            disabled={refreshing}
            title={financeT?.refresh ?? (locale === 'zh' ? '刷新' : 'Refresh')}
          >
            {refreshing ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div className="finance-tab__search">
          <div className="finance-tab__search-row">
            <input
              className="finance-tab__search-input"
              type="text"
              placeholder={financeT?.searchPlaceholder ?? (locale === 'zh' ? '输入代码/名称/地址' : 'Enter symbol/name/address')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <select
              className="finance-tab__search-type"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as AssetType)}
            >
              {SEARCH_TYPE_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {locale === 'zh' ? opt.labelZh : opt.labelEn}
                </option>
              ))}
            </select>
            <button className="btn btn--primary finance-tab__search-btn" onClick={handleSearch} disabled={searching}>
              {searching
                ? (locale === 'zh' ? '搜索中...' : 'Searching...')
                : (financeT?.searchBtn ?? (locale === 'zh' ? '搜索' : 'Search'))}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="finance-tab__search-results">
              {searchResults.map((result) => (
                <div key={result.id} className="finance-tab__search-item">
                  <div className="finance-tab__search-info">
                    <span className="finance-tab__search-symbol">{result.symbol}</span>
                    <span className="finance-tab__search-name">{result.name}</span>
                  </div>
                  <button
                    className="btn btn--primary finance-tab__add-btn"
                    onClick={() => handleAddWatch(result)}
                    disabled={isWatched(result.id)}
                  >
                    {isWatched(result.id)
                      ? (financeT?.added ?? (locale === 'zh' ? '已添加' : 'Added'))
                      : (financeT?.add ?? (locale === 'zh' ? '+ 关注' : '+ Watch'))}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Type Filter */}
      <div className="finance-tab__filter">
        {ASSET_TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            className={`game-filter__btn ${filter === opt.key ? 'game-filter__btn--active' : ''}`}
            onClick={() => setFilter(opt.key)}
          >
            {locale === 'zh' ? opt.labelZh : opt.labelEn}
          </button>
        ))}
      </div>

      {/* Gold/Silver (default) */}
      {(filter === 'all' || filter === 'gold') && goldSilver.length > 0 && (
        <div className="finance-tab__section">
          <h4 className="finance-tab__section-title">
            {financeT?.goldSilver ?? (locale === 'zh' ? '贵金属' : 'Precious Metals')}
          </h4>
          <div className="finance-tab__list">
            {goldSilver.map((item) => (
              <div key={item.id} className="finance-tab__card">
                <div className="finance-tab__card-left">
                  <span className="finance-tab__card-symbol">{item.symbol}</span>
                  <span className="finance-tab__card-name">{locale === 'zh' ? item.name : (item.symbol === 'XAU' ? 'Gold' : 'Silver')}</span>
                </div>
                <div className="finance-tab__card-right">
                  <span className="finance-tab__card-price">{formatPrice(item.price, item.currency)}</span>
                  <span className={`finance-tab__card-change ${item.changePercent >= 0 ? 'finance-tab__card-change--up' : 'finance-tab__card-change--down'}`}>
                    {formatChange(item.change, item.changePercent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Watchlist */}
      {filteredWatchlist.length > 0 && (
        <div className="finance-tab__section">
          <h4 className="finance-tab__section-title">
            {financeT?.watchlist ?? (locale === 'zh' ? '我的关注' : 'My Watchlist')}
          </h4>
          <div className="finance-tab__list">
            {filteredWatchlist.map((item) => {
              const priceInfo = getPriceForWatch(item)
              return (
                <div key={item.id} className="finance-tab__card">
                  <div className="finance-tab__card-left">
                    <span className="finance-tab__card-symbol">{item.symbol}</span>
                    <span className="finance-tab__card-name">{priceInfo?.name ?? item.name}</span>
                  </div>
                  <div className="finance-tab__card-right">
                    {priceInfo ? (
                      <>
                        <span className="finance-tab__card-price">{formatPrice(priceInfo.price, priceInfo.currency)}</span>
                        <span className={`finance-tab__card-change ${priceInfo.changePercent >= 0 ? 'finance-tab__card-change--up' : 'finance-tab__card-change--down'}`}>
                          {formatChange(priceInfo.change, priceInfo.changePercent)}
                        </span>
                      </>
                    ) : (
                      <span className="finance-tab__card-price">--</span>
                    )}
                    <button
                      className="finance-tab__remove-btn"
                      onClick={() => handleRemoveWatch(item.id)}
                      title={financeT?.remove ?? (locale === 'zh' ? '取消关注' : 'Remove')}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state for watchlist */}
      {watchlist.length === 0 && (
        <div className="finance-tab__empty">
          <p>{financeT?.emptyHint ?? (locale === 'zh' ? '点击 🔍 搜索并添加关注资产' : 'Click 🔍 to search and watch assets')}</p>
        </div>
      )}
    </div>
  )
}
