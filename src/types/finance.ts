export type AssetType = 'crypto' | 'gold' | 'stock_cn' | 'stock_us' | 'fund'

export interface FinanceItem {
  id: string
  type: AssetType
  symbol: string       // BTC, XAU, 600519, AAPL, 110011
  name: string         // 比特币, 黄金, 贵州茅台, Apple, 易方达
  price: number
  change: number       // 涨跌额
  changePercent: number // 涨跌幅 %
  currency: string     // USD, CNY
  updatedAt: string
}

export interface FinanceWatchItem {
  id: string
  type: AssetType
  symbol: string
  name: string
  addedAt: string
}

export interface FinanceSearchResult {
  id: string
  type: AssetType
  symbol: string
  name: string
}
