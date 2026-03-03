import type { AssetType, FinanceItem, FinanceSearchResult, FinanceWatchItem } from '../types/finance'

// 常见加密货币 ID → 代号映射
const CRYPTO_SYMBOL_MAP: Record<string, string> = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  binancecoin: 'BNB',
  ripple: 'XRP',
  dogecoin: 'DOGE',
  cardano: 'ADA',
  polkadot: 'DOT',
  'avalanche-2': 'AVAX',
  chainlink: 'LINK',
  tron: 'TRX',
  litecoin: 'LTC',
}

const CRYPTO_NAME_MAP: Record<string, string> = {
  bitcoin: 'Bitcoin',
  ethereum: 'Ethereum',
  solana: 'Solana',
  binancecoin: 'BNB',
}

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
    symbol: CRYPTO_SYMBOL_MAP[id] ?? id.toUpperCase(),
    name: CRYPTO_NAME_MAP[id] ?? id,
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

// ========== 通过 background 代理请求新浪财经 ==========
async function fetchViaBg(sinaList: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(
        { type: 'FETCH_SINA', list: sinaList },
        (resp) => {
          if (chrome.runtime.lastError || !resp?.text) {
            resolve('')
            return
          }
          resolve(resp.text as string)
        },
      )
    } catch {
      resolve('')
    }
  })
}

// 新浪财经返回 GBK 编码，需要用 TextDecoder 解码
async function fetchAsGbk(url: string): Promise<string> {
  const resp = await fetch(url)
  if (!resp.ok) return ''
  const buf = await resp.arrayBuffer()
  return new TextDecoder('gbk').decode(buf)
}

// ========== 新浪财经 + 腾讯财经 API ==========
function parseSinaHq(text: string): Array<{ code: string; fields: string[] }> {
  const results: Array<{ code: string; fields: string[] }> = []
  const lines = text.split('\n').filter(Boolean)
  for (const line of lines) {
    const match = line.match(/var hq_str_(\w+)="(.*)";?/)
    if (match && match[2]) {
      results.push({ code: match[1], fields: match[2].split(',') })
    }
  }
  return results
}

function parseTencentHq(text: string): Array<{ code: string; fields: string[] }> {
  const results: Array<{ code: string; fields: string[] }> = []
  const lines = text.split('\n').filter(Boolean)
  for (const line of lines) {
    const match = line.match(/v_(\w+)="(.*)";?/)
    if (match && match[2]) {
      results.push({ code: match[1], fields: match[2].split('~') })
    }
  }
  return results
}

// 尝试直接 fetch + BG 代理
async function fetchSinaData(list: string): Promise<Array<{ code: string; fields: string[] }>> {
  // 1. 直接 fetch（用 GBK 解码）
  try {
    const text = await fetchAsGbk(`https://hq.sinajs.cn/rn=${Date.now()}&list=${list}`)
    if (text) {
      const items = parseSinaHq(text)
      if (items.length > 0 && items.some((i) => i.fields.length > 1 && i.fields[0])) {
        return items
      }
    }
  } catch { /* fall through */ }

  // 2. 通过 background service worker 代理
  try {
    const bgText = await fetchViaBg(list)
    if (bgText) {
      const items = parseSinaHq(bgText)
      if (items.length > 0 && items.some((i) => i.fields.length > 1 && i.fields[0])) {
        return items
      }
    }
  } catch { /* fall through */ }

  return []
}

export async function fetchPreciousMetals(): Promise<FinanceItem[]> {
  const metalDefs = [
    { symbol: 'AU', nameZh: '黄金', unit: 'CNY/g' },
    { symbol: 'AG', nameZh: '白银', unit: 'CNY/kg' },
    { symbol: 'CU', nameZh: '铜', unit: 'CNY/t' },
    { symbol: 'SN', nameZh: '锡', unit: 'CNY/t' },
    { symbol: 'NI', nameZh: '镍', unit: 'CNY/t' },
  ]

  const metalMap: Record<string, typeof metalDefs[0]> = {
    nf_AU0: metalDefs[0], AU0: metalDefs[0],
    nf_AG0: metalDefs[1], AG0: metalDefs[1],
    nf_CU0: metalDefs[2], CU0: metalDefs[2],
    nf_SN0: metalDefs[3], SN0: metalDefs[3],
    nf_NI0: metalDefs[4], NI0: metalDefs[4],
  }

  // 尝试上海期货
  for (const codes of ['nf_AU0,nf_AG0,nf_CU0,nf_SN0,nf_NI0', 'AU0,AG0,CU0,SN0,NI0']) {
    const items = await fetchSinaData(codes)
    const results: FinanceItem[] = []

    for (const item of items) {
      if (item.fields.length < 1 || !item.fields[0]) continue
      const meta = metalMap[item.code]
      if (!meta) continue

      const price = parseFloat(item.fields[0]) || 0
      if (price === 0) continue

      const prevClose = parseFloat(item.fields[item.fields.length >= 14 ? 7 : (item.fields.length >= 8 ? 7 : 1)]) || 0
      const change = prevClose > 0 ? price - prevClose : 0
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0

      results.push({
        id: `gold_${meta.symbol}`,
        type: 'gold',
        symbol: meta.symbol,
        name: meta.nameZh,
        price,
        change,
        changePercent,
        currency: meta.unit,
        updatedAt: new Date().toISOString(),
      })
    }

    if (results.length > 0) return results
  }

  // 尝试国际金银
  const intItems = await fetchSinaData('hf_GC,hf_SI')
  if (intItems.length > 0) {
    const results: FinanceItem[] = []
    for (const item of intItems) {
      if (item.fields.length < 14) continue
      const isGold = item.code === 'hf_GC'
      const price = parseFloat(item.fields[0]) || 0
      if (price === 0) continue
      const prevClose = parseFloat(item.fields[7]) || 0
      const change = price - prevClose
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0

      results.push({
        id: isGold ? 'gold_AU' : 'gold_AG',
        type: 'gold',
        symbol: isGold ? 'AU' : 'AG',
        name: isGold ? '黄金' : '白银',
        price, change, changePercent,
        currency: 'USD/oz',
        updatedAt: new Date().toISOString(),
      })
    }
    if (results.length > 0) return results
  }

  // 最终 fallback：返回参考价格
  return getFallbackMetals()
}

export async function fetchStockCN(codes: string[]): Promise<FinanceItem[]> {
  if (codes.length === 0) return []

  const sinaCodes = codes.map((c) => {
    const num = c.replace(/\D/g, '')
    if (num.startsWith('6') || num.startsWith('5') || num.startsWith('0000')) return `sh${num}`
    return `sz${num}`
  })

  // 尝试新浪
  const items = await fetchSinaData(sinaCodes.join(','))
  const results: FinanceItem[] = []

  for (const item of items) {
    if (item.fields.length < 32) continue
    const name = item.fields[0]
    const price = parseFloat(item.fields[3]) || 0
    if (price === 0) continue
    const prevClose = parseFloat(item.fields[2]) || 0
    const change = price - prevClose
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0
    const code = item.code.replace(/^(sh|sz)/, '')

    results.push({
      id: `stock_cn_${code}`,
      type: 'stock_cn',
      symbol: code,
      name, price, change, changePercent,
      currency: 'CNY',
      updatedAt: new Date().toISOString(),
    })
  }

  if (results.length > 0) return results

  // 尝试腾讯财经
  try {
    const qqCodes = sinaCodes.join(',')
    const text = await fetchAsGbk(`https://qt.gtimg.cn/q=${qqCodes}&_=${Date.now()}`)
    if (text) {
      const qqItems = parseTencentHq(text)
      for (const item of qqItems) {
        if (item.fields.length < 45) continue
        const name = item.fields[1]
        const price = parseFloat(item.fields[3]) || 0
        if (price === 0) continue
        const prevClose = parseFloat(item.fields[4]) || 0
        const change = parseFloat(item.fields[31]) || (price - prevClose)
        const changePercent = parseFloat(item.fields[32]) || (prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0)
        const code = item.fields[2] || item.code.replace(/^(sh|sz)/, '')

        results.push({
          id: `stock_cn_${code}`,
          type: 'stock_cn',
          symbol: code,
          name, price, change, changePercent,
          currency: 'CNY',
          updatedAt: new Date().toISOString(),
        })
      }
    }
  } catch { /* fall through */ }

  return results
}

export async function fetchStockUS(symbols: string[]): Promise<FinanceItem[]> {
  if (symbols.length === 0) return []

  const sinaCodes = symbols.map((s) => `gb_${s.toLowerCase()}`)
  const items = await fetchSinaData(sinaCodes.join(','))
  const results: FinanceItem[] = []

  for (const item of items) {
    if (item.fields.length < 26) continue
    const name = item.fields[0]
    const price = parseFloat(item.fields[1]) || 0
    if (price === 0) continue
    const change = parseFloat(item.fields[4]) || 0
    const changePercent = parseFloat(item.fields[2]) || 0
    const symbol = item.code.replace(/^gb_/, '').toUpperCase()

    results.push({
      id: `stock_us_${symbol}`,
      type: 'stock_us',
      symbol, name, price, change, changePercent,
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
        price, change, changePercent,
        currency: 'CNY',
        updatedAt: new Date().toISOString(),
      })
    } catch {
      // skip failed fund
    }
  }
  return results
}

// ========== 默认数据（自动加载） ==========

const DEFAULT_CRYPTO_IDS = ['bitcoin', 'ethereum', 'solana', 'binancecoin']

export async function fetchDefaultCrypto(): Promise<FinanceItem[]> {
  return await fetchCryptoPrice(DEFAULT_CRYPTO_IDS)
}

// 默认 A 股指数
export async function fetchDefaultStockCN(): Promise<FinanceItem[]> {
  // 尝试新浪
  const items = await fetchSinaData('sh000001,sh000688')
  const indexMeta: Record<string, { symbol: string; nameZh: string }> = {
    sh000001: { symbol: '000001', nameZh: '上证指数' },
    sh000688: { symbol: '000688', nameZh: '科创50' },
  }
  const results: FinanceItem[] = []

  for (const item of items) {
    if (item.fields.length < 32) continue
    const meta = indexMeta[item.code]
    if (!meta) continue
    const price = parseFloat(item.fields[3]) || 0
    if (price === 0) continue
    const prevClose = parseFloat(item.fields[2]) || 0
    const change = price - prevClose
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0

    results.push({
      id: `stock_cn_${meta.symbol}`,
      type: 'stock_cn',
      symbol: meta.symbol,
      name: item.fields[0] || meta.nameZh,
      price, change, changePercent,
      currency: 'INDEX',
      updatedAt: new Date().toISOString(),
    })
  }

  if (results.length > 0) return results

  // 尝试腾讯财经
  try {
    const text = await fetchAsGbk(`https://qt.gtimg.cn/q=sh000001,sh000688&_=${Date.now()}`)
    if (text) {
      const qqItems = parseTencentHq(text)
      for (const item of qqItems) {
        if (item.fields.length < 45) continue
        const code = item.code.replace(/^(sh|sz)/, '')
        const meta = indexMeta[item.code] ?? { symbol: code, nameZh: item.fields[1] }
        const price = parseFloat(item.fields[3]) || 0
        if (price === 0) continue
        const prevClose = parseFloat(item.fields[4]) || 0
        const change = parseFloat(item.fields[31]) || (price - prevClose)
        const changePercent = parseFloat(item.fields[32]) || (prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0)

        results.push({
          id: `stock_cn_${meta.symbol}`,
          type: 'stock_cn',
          symbol: meta.symbol,
          name: item.fields[1] || meta.nameZh,
          price, change, changePercent,
          currency: 'INDEX',
          updatedAt: new Date().toISOString(),
        })
      }
      if (results.length > 0) return results
    }
  } catch { /* fall through */ }

  // 最终 fallback
  return getFallbackStockCN()
}

// 默认美股
const DEFAULT_US_STOCK_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA']

export async function fetchDefaultStockUS(): Promise<FinanceItem[]> {
  const stockCodes = DEFAULT_US_STOCK_SYMBOLS.map((s) => `gb_${s.toLowerCase()}`)
  const indexCodes = ['int_dji', 'int_nasdaq', 'int_sp500']
  const allCodes = [...indexCodes, ...stockCodes]

  const items = await fetchSinaData(allCodes.join(','))
  const results: FinanceItem[] = []

  const indexMeta: Record<string, { symbol: string; nameZh: string }> = {
    int_dji: { symbol: 'DJI', nameZh: '道琼斯' },
    int_nasdaq: { symbol: 'NASDAQ', nameZh: '纳斯达克' },
    int_sp500: { symbol: 'S&P500', nameZh: '标普500' },
  }

  for (const item of items) {
    if (item.fields.length < 2 || !item.fields[0]) continue

    const meta = indexMeta[item.code]
    if (meta) {
      const price = parseFloat(item.fields[1]) || 0
      if (price === 0) continue
      const change = parseFloat(item.fields[4]) || 0
      const changePercent = parseFloat(item.fields[2]) || 0

      results.push({
        id: `stock_us_${meta.symbol}`,
        type: 'stock_us',
        symbol: meta.symbol,
        name: meta.nameZh,
        price, change, changePercent,
        currency: 'INDEX',
        updatedAt: new Date().toISOString(),
      })
    } else if (item.code.startsWith('gb_')) {
      if (item.fields.length < 26) continue
      const name = item.fields[0]
      const price = parseFloat(item.fields[1]) || 0
      if (price === 0) continue
      const change = parseFloat(item.fields[4]) || 0
      const changePercent = parseFloat(item.fields[2]) || 0
      const symbol = item.code.replace(/^gb_/, '').toUpperCase()

      results.push({
        id: `stock_us_${symbol}`,
        type: 'stock_us',
        symbol, name, price, change, changePercent,
        currency: 'USD',
        updatedAt: new Date().toISOString(),
      })
    }
  }

  if (results.length > 0) return results

  // 最终 fallback
  return getFallbackStockUS()
}

// ========== Fallback 参考数据（API 全部不可用时兜底） ==========

function getFallbackMetals(): FinanceItem[] {
  const now = new Date().toISOString()
  return [
    { id: 'gold_AU', type: 'gold', symbol: 'AU', name: '黄金', price: 1050, change: 5.2, changePercent: 0.50, currency: 'CNY/g', updatedAt: now },
    { id: 'gold_AG', type: 'gold', symbol: 'AG', name: '白银', price: 22500, change: -80, changePercent: -0.35, currency: 'CNY/kg', updatedAt: now },
    { id: 'gold_CU', type: 'gold', symbol: 'CU', name: '铜', price: 103000, change: 450, changePercent: 0.44, currency: 'CNY/t', updatedAt: now },
    { id: 'gold_SN', type: 'gold', symbol: 'SN', name: '锡', price: 407000, change: -27000, changePercent: -6.22, currency: 'CNY/t', updatedAt: now },
    { id: 'gold_NI', type: 'gold', symbol: 'NI', name: '镍', price: 138000, change: -1500, changePercent: -1.08, currency: 'CNY/t', updatedAt: now },
  ]
}

function getFallbackStockCN(): FinanceItem[] {
  const now = new Date().toISOString()
  return [
    { id: 'stock_cn_000001', type: 'stock_cn', symbol: '000001', name: '上证指数', price: 3320.50, change: 15.30, changePercent: 0.46, currency: 'INDEX', updatedAt: now },
    { id: 'stock_cn_000688', type: 'stock_cn', symbol: '000688', name: '科创50', price: 1020.80, change: -5.20, changePercent: -0.51, currency: 'INDEX', updatedAt: now },
  ]
}

function getFallbackStockUS(): FinanceItem[] {
  const now = new Date().toISOString()
  return [
    { id: 'stock_us_DJI', type: 'stock_us', symbol: 'DJI', name: '道琼斯', price: 43250, change: 120, changePercent: 0.28, currency: 'INDEX', updatedAt: now },
    { id: 'stock_us_NASDAQ', type: 'stock_us', symbol: 'NASDAQ', name: '纳斯达克', price: 18950, change: -85, changePercent: -0.45, currency: 'INDEX', updatedAt: now },
    { id: 'stock_us_S&P500', type: 'stock_us', symbol: 'S&P500', name: '标普500', price: 5920, change: 12, changePercent: 0.20, currency: 'INDEX', updatedAt: now },
    { id: 'stock_us_AAPL', type: 'stock_us', symbol: 'AAPL', name: 'Apple Inc', price: 228.50, change: 1.20, changePercent: 0.53, currency: 'USD', updatedAt: now },
    { id: 'stock_us_MSFT', type: 'stock_us', symbol: 'MSFT', name: 'Microsoft', price: 415.80, change: -2.30, changePercent: -0.55, currency: 'USD', updatedAt: now },
    { id: 'stock_us_GOOGL', type: 'stock_us', symbol: 'GOOGL', name: 'Alphabet', price: 175.20, change: 0.80, changePercent: 0.46, currency: 'USD', updatedAt: now },
    { id: 'stock_us_AMZN', type: 'stock_us', symbol: 'AMZN', name: 'Amazon', price: 205.40, change: 3.10, changePercent: 1.53, currency: 'USD', updatedAt: now },
    { id: 'stock_us_NVDA', type: 'stock_us', symbol: 'NVDA', name: 'NVIDIA', price: 880.50, change: -12.30, changePercent: -1.38, currency: 'USD', updatedAt: now },
    { id: 'stock_us_META', type: 'stock_us', symbol: 'META', name: 'Meta', price: 595.70, change: 5.40, changePercent: 0.91, currency: 'USD', updatedAt: now },
    { id: 'stock_us_TSLA', type: 'stock_us', symbol: 'TSLA', name: 'Tesla', price: 262.30, change: -8.50, changePercent: -3.14, currency: 'USD', updatedAt: now },
  ]
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
