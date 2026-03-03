import { useState, useEffect, useCallback } from 'react'
import type { AssetType, FinanceItem, FinanceWatchItem, FinanceSearchResult } from '../types/finance'
import { useI18n } from '../i18n'
import { getFinanceWatchlist, addFinanceWatch, removeFinanceWatch } from '../services/storage'
import { fetchPreciousMetals, fetchDefaultCrypto, fetchDefaultStockCN, fetchDefaultStockUS, refreshWatchlist, searchAsset } from '../services/finance'

// Tab 顺序：贵金属 > A股 > 美股 > 加密（加密排最后）
const ASSET_TYPE_OPTIONS: Array<{ key: AssetType | 'all'; labelZh: string; labelEn: string }> = [
  { key: 'all', labelZh: '全部', labelEn: 'All' },
  { key: 'gold', labelZh: '贵金属', labelEn: 'Metals' },
  { key: 'stock_cn', labelZh: 'A股', labelEn: 'CN Stock' },
  { key: 'stock_us', labelZh: '美股', labelEn: 'US Stock' },
  { key: 'fund', labelZh: '基金', labelEn: 'Fund' },
  { key: 'crypto', labelZh: '加密', labelEn: 'Crypto' },
]

const SEARCH_TYPE_OPTIONS: Array<{ key: AssetType; labelZh: string; labelEn: string }> = [
  { key: 'crypto', labelZh: '加密货币', labelEn: 'Crypto' },
  { key: 'stock_cn', labelZh: 'A股', labelEn: 'CN Stock' },
  { key: 'stock_us', labelZh: '美股', labelEn: 'US Stock' },
  { key: 'fund', labelZh: '基金', labelEn: 'Fund' },
]

function formatPrice(price: number, currency: string): string {
  // INDEX: no symbol, just the number (for stock indices)
  if (currency === 'INDEX') {
    if (price >= 10000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Unit-based currencies for precious metals: CNY/g, CNY/kg, CNY/t
  const unitMap: Record<string, { symbol: string; unit: string }> = {
    'CNY/g': { symbol: '¥', unit: '/克' },
    'CNY/kg': { symbol: '¥', unit: '/千克' },
    'CNY/t': { symbol: '¥', unit: '/吨' },
    'USD/oz': { symbol: '$', unit: '/oz' },
  }
  const unitInfo = unitMap[currency]
  if (unitInfo) {
    const formatted = price >= 10000
      ? price.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return `${unitInfo.symbol}${formatted}${unitInfo.unit}`
  }

  // Standard currencies
  const symbol = currency === 'CNY' ? '¥' : '$'
  if (price >= 10000) return `${symbol}${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (price >= 1) return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`
}

function formatChange(change: number, percent: number): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}%`
}

function FinanceCard({ item, locale, onRemove }: { item: FinanceItem; locale: string; onRemove?: () => void }) {
  return (
    <div className="finance-tab__card">
      <div className="finance-tab__card-left">
        <span className="finance-tab__card-symbol">{item.symbol}</span>
        <span className="finance-tab__card-name">{item.name}</span>
      </div>
      <div className="finance-tab__card-right">
        <span className="finance-tab__card-price">{formatPrice(item.price, item.currency)}</span>
        <span className={`finance-tab__card-change ${item.changePercent >= 0 ? 'finance-tab__card-change--up' : 'finance-tab__card-change--down'}`}>
          {formatChange(item.change, item.changePercent)}
        </span>
        {onRemove && (
          <button
            className="finance-tab__remove-btn"
            onClick={onRemove}
            title={locale === 'zh' ? '取消关注' : 'Remove'}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default function FinanceTab() {
  const { locale, t } = useI18n()
  const [watchlist, setWatchlist] = useState<FinanceWatchItem[]>([])
  const [prices, setPrices] = useState<FinanceItem[]>([])
  const [preciousMetals, setPreciousMetals] = useState<FinanceItem[]>([])
  const [defaultCrypto, setDefaultCrypto] = useState<FinanceItem[]>([])
  const [defaultStockCN, setDefaultStockCN] = useState<FinanceItem[]>([])
  const [defaultStockUS, setDefaultStockUS] = useState<FinanceItem[]>([])
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
      const results = await Promise.allSettled([
        getFinanceWatchlist(),
        fetchPreciousMetals(),
        fetchDefaultCrypto(),
        fetchDefaultStockCN(),
        fetchDefaultStockUS(),
      ])

      const wl = results[0].status === 'fulfilled' ? results[0].value : []
      const metals = results[1].status === 'fulfilled' ? results[1].value : []
      const crypto = results[2].status === 'fulfilled' ? results[2].value : []
      const cnStocks = results[3].status === 'fulfilled' ? results[3].value : []
      const usStocks = results[4].status === 'fulfilled' ? results[4].value : []

      setWatchlist(wl)
      setPreciousMetals(metals)
      setDefaultCrypto(crypto)
      setDefaultStockCN(cnStocks)
      setDefaultStockUS(usStocks)

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
      const results = await Promise.allSettled([
        fetchPreciousMetals(),
        fetchDefaultCrypto(),
        fetchDefaultStockCN(),
        fetchDefaultStockUS(),
        watchlist.length > 0 ? refreshWatchlist(watchlist) : Promise.resolve([]),
      ])

      if (results[0].status === 'fulfilled' && results[0].value.length > 0) setPreciousMetals(results[0].value)
      if (results[1].status === 'fulfilled' && results[1].value.length > 0) setDefaultCrypto(results[1].value)
      if (results[2].status === 'fulfilled' && results[2].value.length > 0) setDefaultStockCN(results[2].value)
      if (results[3].status === 'fulfilled' && results[3].value.length > 0) setDefaultStockUS(results[3].value)
      if (results[4].status === 'fulfilled') setPrices(results[4].value)
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

  // 贵金属名称映射
  const metalNames: Record<string, Record<string, string>> = {
    zh: { AU: '黄金', AG: '白银', CU: '铜', SN: '锡', NI: '镍' },
    en: { AU: 'Gold', AG: 'Silver', CU: 'Copper', SN: 'Tin', NI: 'Nickel' },
  }

  if (loading) {
    return (
      <div className="finance-tab">
        <div className="finance-tab__loading">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  const showMetals = (filter === 'all' || filter === 'gold') && preciousMetals.length > 0
  const showCNStock = (filter === 'all' || filter === 'stock_cn') && defaultStockCN.length > 0
  const showUSStock = (filter === 'all' || filter === 'stock_us') && defaultStockUS.length > 0
  const showCrypto = (filter === 'all' || filter === 'crypto') && defaultCrypto.length > 0

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

      {/* Precious Metals (default) */}
      {showMetals && (
        <div className="finance-tab__section">
          <h4 className="finance-tab__section-title">
            {financeT?.goldSilver ?? (locale === 'zh' ? '贵金属' : 'Precious Metals')}
          </h4>
          <div className="finance-tab__list">
            {preciousMetals.map((item) => {
              const names = metalNames[locale] ?? metalNames.en
              const displayItem = { ...item, name: names[item.symbol] ?? item.name }
              return <FinanceCard key={item.id} item={displayItem} locale={locale} />
            })}
          </div>
        </div>
      )}

      {/* A Stock Indices (default) */}
      {showCNStock && (
        <div className="finance-tab__section">
          <h4 className="finance-tab__section-title">
            {financeT?.defaultStockCN ?? (locale === 'zh' ? 'A股指数' : 'CN Indices')}
          </h4>
          <div className="finance-tab__list">
            {defaultStockCN.map((item) => (
              <FinanceCard key={item.id} item={item} locale={locale} />
            ))}
          </div>
        </div>
      )}

      {/* US Stock Markets (default) */}
      {showUSStock && (
        <div className="finance-tab__section">
          <h4 className="finance-tab__section-title">
            {financeT?.defaultStockUS ?? (locale === 'zh' ? '美股行情' : 'US Markets')}
          </h4>
          <div className="finance-tab__list">
            {defaultStockUS.map((item) => (
              <FinanceCard key={item.id} item={item} locale={locale} />
            ))}
          </div>
        </div>
      )}

      {/* Major Crypto (default) */}
      {showCrypto && (
        <div className="finance-tab__section">
          <h4 className="finance-tab__section-title">
            {financeT?.defaultCrypto ?? (locale === 'zh' ? '主流币' : 'Major Crypto')}
          </h4>
          <div className="finance-tab__list">
            {defaultCrypto.map((item) => (
              <FinanceCard key={item.id} item={item} locale={locale} />
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

      {/* Empty state - shows when current filter has no data */}
      {!showMetals && !showCNStock && !showUSStock && !showCrypto && filteredWatchlist.length === 0 && (
        <div className="finance-tab__empty">
          <p>{financeT?.emptyHint ?? (locale === 'zh' ? '点击 🔍 搜索并添加关注资产' : 'Click 🔍 to search and watch assets')}</p>
        </div>
      )}
    </div>
  )
}
