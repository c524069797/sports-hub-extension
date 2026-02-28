import type { AssetType, FinanceItem, FinanceSearchResult, FinanceWatchItem } from '../types/finance'

// ========== CoinGecko API ==========
export async function fetchCryptoPrice(ids: string[]): Promise<FinanceItem[]> {
  if (ids.length === 0) return []

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=false`
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`CoinGecko API error: ${resp.status}`)

  const data = await resp.json() as Record<string, { usd: number; usd_24h_change?: number }>
  return Object.entries(data).map(([id, info]) => ({
    id: `crypto_${id}`,
    type: 'crypto' as AssetType,
    symbol: id.toUpperCase(),
    name: id,
    price: info.usd,
    change: info.usd_24h_change ? (info.usd * info.usd_24h_change / 100) : 0,
    changePercent: info.usd_24h_change ?? 0,
    currency: 'USD',
    updatedAt: new Date().toISOString(),
  }))
}

export async function searchCrypto(query: string): Promise<FinanceSearchResult[]> {
  const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
  const resp = await fetch(url)
  if (!resp.ok) return []

  const data = await resp.json() as { coins: Array<{ id: string; symbol: string; name: string }> }
  return data.coins.slice(0, 10).map((c) => ({
    id: `crypto_${c.id}`,
    type: 'crypto' as AssetType,
    symbol: c.symbol.toUpperCase(),
    name: c.name,
  }))
}

export async function fetchCryptoByContract(platform: string, address: string): Promise<FinanceItem | null> {
  const url = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${address}`
  const resp = await fetch(url)
  if (!resp.ok) return null

  const data = await resp.json() as {
    id: string
    symbol: string
    name: string
    market_data?: {
      current_price?: { usd?: number }
      price_change_percentage_24h?: number
      price_change_24h?: number
    }
  }
  const md = data.market_data
  return {
    id: `crypto_${data.id}`,
    type: 'crypto',
    symbol: data.symbol.toUpperCase(),
    name: data.name,
    price: md?.current_price?.usd ?? 0,
    change: md?.price_change_24h ?? 0,
    changePercent: md?.price_change_percentage_24h ?? 0,
    currency: 'USD',
    updatedAt: new Date().toISOString(),
  }
}

// ========== 新浪财经 API ==========
function parseSinaHq(text: string): Array<{ code: string; fields: string[] }> {
  const results: Array<{ code: string; fields: string[] }> = []
  const lines = text.split('\n').filter(Boolean)
  for (const line of lines) {
    const match = line.match(/var hq_str_(\w+)="(.*)";?/)
    if (match) {
      results.push({ code: match[1], fields: match[2].split(',') })
    }
  }
  return results
}

export async function fetchGoldSilver(): Promise<FinanceItem[]> {
  const url = 'https://hq.sinajs.cn/list=hf_GC,hf_SI'
  const resp = await fetch(url, {
    headers: { Referer: 'https://finance.sina.com.cn' },
  })
  if (!resp.ok) return []

  const text = await resp.text()
  const items = parseSinaHq(text)
  const results: FinanceItem[] = []

  for (const item of items) {
    if (item.fields.length < 14) continue
    const isGold = item.code === 'hf_GC'
    const price = parseFloat(item.fields[0]) || 0
    const prevClose = parseFloat(item.fields[7]) || 0
    const change = price - prevClose
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0

    results.push({
      id: isGold ? 'gold_XAU' : 'gold_XAG',
      type: 'gold',
      symbol: isGold ? 'XAU' : 'XAG',
      name: isGold ? '黄金' : '白银',
      price,
      change,
      changePercent,
      currency: 'USD',
      updatedAt: new Date().toISOString(),
    })
  }
  return results
}

export async function fetchStockCN(codes: string[]): Promise<FinanceItem[]> {
  if (codes.length === 0) return []

  const sinaCodes = codes.map((c) => {
    const num = c.replace(/\D/g, '')
    if (num.startsWith('6') || num.startsWith('5')) return `sh${num}`
    return `sz${num}`
  })

  const url = `https://hq.sinajs.cn/list=${sinaCodes.join(',')}`
  const resp = await fetch(url, {
    headers: { Referer: 'https://finance.sina.com.cn' },
  })
  if (!resp.ok) return []

  const text = await resp.text()
  const items = parseSinaHq(text)
  const results: FinanceItem[] = []

  for (const item of items) {
    if (item.fields.length < 32) continue
    const name = item.fields[0]
    const price = parseFloat(item.fields[3]) || 0
    const prevClose = parseFloat(item.fields[2]) || 0
    const change = price - prevClose
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0
    const code = item.code.replace(/^(sh|sz)/, '')

    results.push({
      id: `stock_cn_${code}`,
      type: 'stock_cn',
      symbol: code,
      name,
      price,
      change,
      changePercent,
      currency: 'CNY',
      updatedAt: new Date().toISOString(),
    })
  }
  return results
}

export async function fetchStockUS(symbols: string[]): Promise<FinanceItem[]> {
  if (symbols.length === 0) return []

  const sinaCodes = symbols.map((s) => `gb_${s.toLowerCase()}`)
  const url = `https://hq.sinajs.cn/list=${sinaCodes.join(',')}`
  const resp = await fetch(url, {
    headers: { Referer: 'https://finance.sina.com.cn' },
  })
  if (!resp.ok) return []

  const text = await resp.text()
  const items = parseSinaHq(text)
  const results: FinanceItem[] = []

  for (const item of items) {
    if (item.fields.length < 26) continue
    const name = item.fields[0]
    const price = parseFloat(item.fields[1]) || 0
    const change = parseFloat(item.fields[4]) || 0
    const changePercent = parseFloat(item.fields[2]) || 0
    const symbol = item.code.replace(/^gb_/, '').toUpperCase()

    results.push({
      id: `stock_us_${symbol}`,
      type: 'stock_us',
      symbol,
      name,
      price,
      change,
      changePercent,
      currency: 'USD',
      updatedAt: new Date().toISOString(),
    })
  }
  return results
}

// ========== 天天基金 API ==========
export async function fetchFund(codes: string[]): Promise<FinanceItem[]> {
  if (codes.length === 0) return []

  const results: FinanceItem[] = []
  for (const code of codes) {
    try {
      const url = `https://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`
      const resp = await fetch(url)
      if (!resp.ok) continue

      const text = await resp.text()
      // jsonpgz({"fundcode":"110011","name":"易方达中小盘","jzrq":"2024-01-01","dwjz":"3.1234","gsz":"3.1300","gszzl":"0.21",...})
      const match = text.match(/jsonpgz\((.+)\)/)
      if (!match) continue

      const data = JSON.parse(match[1]) as {
        fundcode: string
        name: string
        dwjz: string
        gsz: string
        gszzl: string
      }

      const price = parseFloat(data.gsz) || parseFloat(data.dwjz) || 0
      const prevPrice = parseFloat(data.dwjz) || 0
      const changePercent = parseFloat(data.gszzl) || 0
      const change = prevPrice * changePercent / 100

      results.push({
        id: `fund_${code}`,
        type: 'fund',
        symbol: code,
        name: data.name,
        price,
        change,
        changePercent,
        currency: 'CNY',
        updatedAt: new Date().toISOString(),
      })
    } catch {
      // skip failed fund
    }
  }
  return results
}

// ========== 批量刷新关注列表 ==========
export async function refreshWatchlist(watchlist: FinanceWatchItem[]): Promise<FinanceItem[]> {
  if (watchlist.length === 0) return []

  const grouped: Record<AssetType, string[]> = {
    crypto: [],
    gold: [],
    stock_cn: [],
    stock_us: [],
    fund: [],
  }

  for (const item of watchlist) {
    if (item.type === 'crypto') {
      // CoinGecko uses lowercase id (e.g. "bitcoin")
      grouped.crypto.push(item.symbol.toLowerCase())
    } else if (item.type === 'stock_cn') {
      grouped.stock_cn.push(item.symbol)
    } else if (item.type === 'stock_us') {
      grouped.stock_us.push(item.symbol)
    } else if (item.type === 'fund') {
      grouped.fund.push(item.symbol)
    }
  }

  const fetches = await Promise.allSettled([
    grouped.crypto.length > 0 ? fetchCryptoPrice(grouped.crypto) : Promise.resolve([]),
    grouped.stock_cn.length > 0 ? fetchStockCN(grouped.stock_cn) : Promise.resolve([]),
    grouped.stock_us.length > 0 ? fetchStockUS(grouped.stock_us) : Promise.resolve([]),
    grouped.fund.length > 0 ? fetchFund(grouped.fund) : Promise.resolve([]),
  ])

  const results: FinanceItem[] = []
  for (const r of fetches) {
    if (r.status === 'fulfilled') {
      results.push(...r.value)
    }
  }
  return results
}

// ========== 搜索/验证 ==========
export async function searchAsset(query: string, type: AssetType): Promise<FinanceSearchResult[]> {
  switch (type) {
    case 'crypto':
      return searchCrypto(query)
    case 'stock_cn': {
      const items = await fetchStockCN([query])
      return items.map((i) => ({ id: i.id, type: i.type, symbol: i.symbol, name: i.name }))
    }
    case 'stock_us': {
      const items = await fetchStockUS([query])
      return items.map((i) => ({ id: i.id, type: i.type, symbol: i.symbol, name: i.name }))
    }
    case 'fund': {
      const items = await fetchFund([query])
      return items.map((i) => ({ id: i.id, type: i.type, symbol: i.symbol, name: i.name }))
    }
    default:
      return []
  }
}
