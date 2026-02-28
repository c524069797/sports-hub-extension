# Sports Hub Extension - 开发文档

## 目录

- [项目概述](#项目概述)
- [技术架构](#技术架构)
- [目录结构](#目录结构)
- [核心模块详解](#核心模块详解)
  - [数据层 (Services)](#数据层-services)
  - [组件层 (Components)](#组件层-components)
  - [状态管理 (Hooks)](#状态管理-hooks)
  - [持久化存储 (Storage)](#持久化存储-storage)
  - [国际化 (i18n)](#国际化-i18n)
  - [后台服务 (Background)](#后台服务-background)
- [数据流架构](#数据流架构)
- [API 集成](#api-集成)
  - [NBA 数据](#nba-数据)
  - [足球数据](#足球数据)
  - [电竞数据](#电竞数据)
- [关键功能实现](#关键功能实现)
  - [比赛数据获取与缓存](#比赛数据获取与缓存)
  - [球员/选手数据按需加载](#球员选手数据按需加载)
  - [收藏系统与持久化](#收藏系统与持久化)
  - [比赛状态判定](#比赛状态判定)
- [构建与部署](#构建与部署)
- [扩展开发指南](#扩展开发指南)
  - [新增运动类型](#新增运动类型)
  - [新增数据源](#新增数据源)
  - [新增语言](#新增语言)

---

## 项目概述

Sports Hub 是一个跨浏览器体育赛事聚合扩展，支持 NBA、足球、电竞三大运动类型的实时数据追踪。采用 React 18 + TypeScript 开发，通过 Extension.js 构建框架实现 Chrome/Firefox/Edge 多浏览器兼容。

**核心特性：**

- 多数据源聚合（NBA CDN、ESPN、Polymarket、PandaScore、football-data.org）
- 三级数据降级策略（API → 爬虫 → Fallback 模拟数据）
- 按需加载球员/选手详细数据
- 基于 Chrome Storage API 的本地持久化收藏系统
- 中英双语国际化
- 深色/浅色主题切换
- 后台 Service Worker 定时刷新

---

## 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Extension                     │
├─────────────────────────────────────────────────────────┤
│  Popup UI (React 18 + TypeScript)                       │
│  ┌──────────┬──────────┬──────────┬────────┬────────┐  │
│  │  NBATab  │ Football │ Esports  │  Favs  │Settings│  │
│  │          │   Tab    │   Tab    │ Panel  │ Panel  │  │
│  └────┬─────┴────┬─────┴────┬─────┴────┬───┴────────┘  │
│       │          │          │          │                 │
│  ┌────▼──────────▼──────────▼──────────▼─────────────┐  │
│  │              Custom Hooks Layer                     │  │
│  │  useMatches() · useSettings() · useFavorites()     │  │
│  └────┬──────────────────────────────────────────────┘  │
│       │                                                  │
│  ┌────▼──────────────────────────────────────────────┐  │
│  │              Service Layer                         │  │
│  │  api.ts → nba.ts / football.ts / esports.ts       │  │
│  │           players/  · scrapers/  · storage.ts      │  │
│  └────┬──────────────────────────────────────────────┘  │
│       │                                                  │
│  ┌────▼──────────────────────────────────────────────┐  │
│  │           Storage Layer                            │  │
│  │  chrome.storage.local (扩展) / localStorage (开发) │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  Background Service Worker                               │
│  - 定时刷新 (chrome.alarms)                              │
│  - 消息监听 (chrome.runtime.onMessage)                   │
│  - 预加载数据                                            │
└─────────────────────────────────────────────────────────┘
          │                    │                  │
          ▼                    ▼                  ▼
   cdn.nba.com          Polymarket           PandaScore
   site.api.espn.com    Gamma API            football-data.org
```

**技术栈：**

| 层级 | 技术 |
|------|------|
| UI 框架 | React 18 + TypeScript 5.3 |
| 构建工具 | Extension.js (基于 Webpack/Rspack) |
| 样式 | 原生 CSS + CSS 变量 (主题系统) |
| 存储 | Chrome Storage API + localStorage fallback |
| 后台 | Service Worker + chrome.alarms |
| 国际化 | 自定义 i18n (React Context) |
| 类型系统 | TypeScript strict mode |

---

## 目录结构

```
sports-hub-extension/
├── src/
│   ├── popup/                    # 扩展弹出窗口入口
│   │   ├── App.tsx              # 根组件（路由、主题、Tab 切换）
│   │   ├── index.html           # HTML 入口
│   │   └── styles.css           # 全局样式（约 980 行）
│   │
│   ├── components/               # React UI 组件
│   │   ├── NBATab.tsx           # NBA 标签页
│   │   ├── FootballTab.tsx      # 足球标签页
│   │   ├── EsportsTab.tsx       # 电竞标签页（含游戏筛选器）
│   │   ├── MatchList.tsx        # 通用比赛列表
│   │   ├── MatchCard.tsx        # 比赛卡片
│   │   ├── MatchDetail.tsx      # 比赛详情（球员数据、收藏）
│   │   ├── FavoritesPanel.tsx   # 收藏面板（超链接、即时数据）
│   │   ├── SettingsPanel.tsx    # 设置面板
│   │   └── LanguageSwitcher.tsx # 语言切换器
│   │
│   ├── services/                 # 数据获取服务
│   │   ├── api.ts               # 统一 API 入口 + 缓存路由
│   │   ├── nba.ts               # NBA CDN API 集成
│   │   ├── football.ts          # 足球多源数据集成
│   │   ├── esports.ts           # 电竞 PandaScore API 集成
│   │   ├── storage.ts           # Chrome Storage 封装
│   │   ├── players/
│   │   │   ├── football-players.ts   # 足球球员数据 (ESPN)
│   │   │   └── esports-players.ts    # 电竞选手数据 (PandaScore)
│   │   └── scrapers/
│   │       ├── football-scraper.ts   # 足球数据爬虫 (TheSportsDB)
│   │       └── esports-scraper.ts    # 电竞数据爬虫 (Polymarket Gamma)
│   │
│   ├── hooks/                    # React 自定义 Hooks
│   │   └── useData.ts           # useMatches / useSettings / useFavorites
│   │
│   ├── types/                    # TypeScript 类型定义
│   │   └── index.ts             # Match, PlayerStat, FavoriteItem 等
│   │
│   ├── config/                   # 配置
│   │   ├── api-keys.example.ts  # API Key 模板
│   │   └── api-keys.ts          # API Key 实际配置（.gitignore）
│   │
│   ├── i18n/                     # 国际化
│   │   ├── index.tsx            # I18nProvider + useI18n hook
│   │   ├── zh.ts                # 中文翻译
│   │   ├── en.ts                # 英文翻译
│   │   └── team-names.ts       # 球队名称翻译映射
│   │
│   ├── utils/
│   │   └── format.ts           # 时间格式化、状态文本
│   │
│   ├── background.ts            # Service Worker（定时刷新）
│   └── manifest.json            # 扩展清单（Chrome MV3 / Firefox MV2）
│
├── public/                       # 静态资源（图标等）
├── dist/                         # 构建输出（.gitignore）
├── extension.config.js           # Extension.js 配置
├── tsconfig.json                 # TypeScript 配置
├── package.json                  # 项目依赖
└── DEVELOPMENT.md               # 本文档
```

---

## 核心模块详解

### 数据层 (Services)

#### `api.ts` — 统一数据入口

所有比赛数据通过 `fetchMatches(sportType, forceRefresh)` 统一入口获取，内部实现：

1. 检查缓存是否有效（基于 `refreshInterval` 配置）
2. 如缓存有效直接返回，避免不必要的网络请求
3. 如需刷新，路由到对应 sport service
4. 写入缓存 + 更新时间戳

```typescript
// src/services/api.ts
export async function fetchMatches(sportType: SportType, forceRefresh = false): Promise<Match[]>
export async function fetchAllMatches(): Promise<Record<SportType, Match[]>>
```

#### `nba.ts` — NBA 数据服务

**数据源：** `cdn.nba.com` 公开 CDN（无需认证）

| 端点 | 用途 |
|------|------|
| `/static/json/liveData/scoreboard/todaysScoreboard_00.json` | 当日赛程 + 比分 |
| `/static/json/liveData/boxscore/boxscore_{gameId}.json` | 比赛详细球员统计 |

**球员数据字段：** 得分、篮板、助攻、抢断、盖帽、上场时间

**特点：** 全部球员数据（非仅首发5人），并行获取所有比赛的 boxscore

#### `esports.ts` — 电竞数据服务

**三级数据降级：**

```
1. Polymarket Gamma API 爬虫 (主数据源，无需 Key)
   ↓ 失败
2. PandaScore REST API (需要 Key)
   ↓ 失败
3. Fallback 模拟数据
```

#### `services/scrapers/esports-scraper.ts` — Polymarket 爬虫

从 Polymarket Gamma API 获取电竞博彩事件，解析为比赛数据：

- 从事件标题中解析队名（`Team A vs Team B` 格式）
- 清理多余信息（BO 后缀、赛事附加信息、游戏前缀）
- 根据标题/描述关键词识别游戏类型
- 基于市场状态 + 时间逻辑判断比赛状态（8 小时超时自动标记已结束）
- 过滤 7 天以上旧比赛

#### `services/players/esports-players.ts` — PandaScore 选手搜索

**三级搜索策略：**

```
1. filter[acronym] 精确匹配 → 适合短名 (AL, T1, WBG)
   ↓ 无结果
2. filter[name] 精确匹配 → 适合全名 (Weibo Gaming)
   ↓ 无结果
3. search[name] 模糊搜索 → 兜底
```

支持游戏：CS2 (`cs-go`)、LoL (`lol`)、Valorant (`valorant`)、Dota2 (`dota-2`)

### 组件层 (Components)

#### `MatchDetail.tsx` — 比赛详情页

核心功能：
- 按需加载球员/选手数据（`useEffect` + `hasAttemptedLoad` ref 防重复）
- Home/Away tab 切换
- 收藏球员时自动保存即时 stats + 生成 profile URL
- 电竞/传统体育术语自适应（选手 vs 球员）

**球员 Profile URL 映射：**

| 运动 | 目标网站 |
|------|---------|
| NBA | nba.com/player/{id} |
| 足球 | Google 搜索 |
| LOL | lol.fandom.com/wiki/{name} |
| CS2 | hltv.org/search |
| Valorant | vlr.gg/search |
| Dota2 | liquipedia.net/dota2/{name} |

#### `FavoritesPanel.tsx` — 收藏面板

- 按 `{sportType}-{type}` 分组显示（如 "NBA - 球员/选手"）
- 球员名称带超链接（`↗` 图标），点击在新标签页打开详情页
- 显示收藏时快照的即时数据（monospace 小字）
- 使用 `chrome.tabs.create()` 打开链接（扩展环境），fallback `window.open()`

### 状态管理 (Hooks)

```typescript
// src/hooks/useData.ts

// 比赛数据 hook — 自动加载 + 手动刷新
useMatches(sportType: SportType)
  → { matches, loading, error, refresh }

// 全局设置 hook — 读取 + 更新
useSettings()
  → { settings, updateSettings }

// 收藏管理 hook — CRUD + 查询
useFavorites()
  → { favorites, loading, addFavorite, removeFavorite, isFavorite }
```

### 持久化存储 (Storage)

```typescript
// src/services/storage.ts

// 存储引擎自动选择：
// - 扩展环境 → chrome.storage.local (永久持久化)
// - 开发环境 → localStorage (fallback)

// 存储 Key 结构：
{
  favorites: FavoriteItem[]           // 收藏列表
  settings: AppSettings               // 用户设置
  cachedMatches: {                     // 比赛数据缓存
    nba: Match[]
    football: Match[]
    esports: Match[]
  }
  lastFetchTime: {                     // 各运动最后刷新时间
    nba: number      // Unix timestamp
    football: number
    esports: number
  }
}
```

**持久化特性：**
- `chrome.storage.local` 数据存储在用户 Chrome Profile 目录的 LevelDB 中
- 关闭浏览器后数据不丢失
- 清除浏览器缓存/Cookie 不影响扩展存储
- 仅卸载扩展或手动清除扩展数据时才丢失

### 国际化 (i18n)

基于 React Context 实现，支持中文 (`zh`) 和英文 (`en`)：

```typescript
// 使用方式
const { locale, t, setLocale } = useI18n()

// 翻译覆盖范围：
// - UI 文案 (通用、导航、比赛状态、设置等)
// - NBA 球队中文名 (湖人、勇士等)
// - 足球联赛名称 (英超、西甲等)
// - 电竞游戏名称 (英雄联盟、CS2 等)
// - 电竞联赛名称 (LPL、LCK、VCT 等)
// - 球队名称映射 (team-names.ts)
```

### 后台服务 (Background)

```typescript
// src/background.ts — Service Worker

// 1. 扩展安装时：创建定时器 + 预加载数据
chrome.runtime.onInstalled.addListener(() => { ... })

// 2. 定时刷新：根据用户设置的 refreshInterval
chrome.alarms.onAlarm.addListener(() => fetchAllMatches())

// 3. 消息处理：
//    REFRESH_DATA  → 手动刷新所有数据
//    UPDATE_ALARM  → 更新定时器间隔
```

---

## 数据流架构

### 比赛列表加载

```
用户打开扩展 Popup
  │
  ▼
App.tsx 渲染 → NBATab/FootballTab/EsportsTab
  │
  ▼
useMatches(sportType) hook 初始化
  │
  ▼
fetchMatches(sportType) ← api.ts
  │
  ├─ 检查缓存 (shouldRefresh)
  │   ├─ 缓存有效 → 返回 getCachedMatches()
  │   └─ 需要刷新 ↓
  │
  ▼
sport-specific service (nba.ts / football.ts / esports.ts)
  │
  ├─ 网络请求 (fetch API)
  ├─ 数据解析 & 格式化 → Match[]
  ├─ 写入缓存 (setCachedMatches)
  └─ 返回 Match[]
```

### 球员数据按需加载

```
用户点击比赛卡片 → MatchDetail 渲染
  │
  ▼
useEffect 检查: 是否已有球员数据?
  ├─ 有 → 直接显示
  └─ 无 → 发起加载 (hasAttemptedLoad.current = true)
       │
       ├─ NBA → fetchGameBoxscore(gameId)
       ├─ Football → fetchMatchPlayers(...)  [ESPN API]
       └─ Esports → fetchEsportsMatchPlayers(home, away, game, apiKey)
            │        [PandaScore 三级搜索]
            ▼
       setHomePlayers() + setAwayPlayers()
```

### 收藏数据流

```
用户点击 ☆ 关注球员
  │
  ▼
handleTogglePlayerFav(player)
  │
  ├─ 构建 profileUrl (getPlayerProfileUrl)
  ├─ 格式化 stats 摘要 (formatStatsForFavorite)
  │
  ▼
useFavorites().addFavorite({
  id, type, sportType, name,
  extra: { team, position, stats, profileUrl }
})
  │
  ▼
storage.addFavorite() → chrome.storage.local.set()
  │                      (永久持久化到磁盘)
  ▼
React state 更新 → UI 响应
```

---

## API 集成

### NBA 数据

| 项目 | 详情 |
|------|------|
| **数据源** | cdn.nba.com 公开 CDN |
| **认证** | 无需 API Key |
| **限制** | 无明确限制 |
| **请求头** | `Referer: https://www.nba.com/`, `Origin: https://www.nba.com` |
| **端点** | scoreboard (赛程) + boxscore (球员统计) |
| **更新频率** | 实时（比赛进行中约 10 秒更新一次） |

### 足球数据

| 项目 | 详情 |
|------|------|
| **主数据源** | TheSportsDB 爬虫 (无需 Key) |
| **备用数据源** | football-data.org API (需要 Key) |
| **球员数据** | ESPN API (无需 Key) |
| **免费额度** | football-data.org: 10 次/天 |

### 电竞数据

| 项目 | 详情 |
|------|------|
| **比赛数据** | Polymarket Gamma API 爬虫 (无需 Key) |
| **选手数据** | PandaScore REST API (需要 Key) |
| **免费额度** | PandaScore: 1000 次/月 |
| **支持游戏** | CS2, LOL, Valorant, Dota2 |
| **认证方式** | Bearer Token (`Authorization: Bearer {key}`) |

---

## 关键功能实现

### 比赛数据获取与缓存

缓存策略基于时间戳，默认 10 分钟过期：

```typescript
// storage.ts
export async function shouldRefresh(sportType, intervalMinutes): Promise<boolean> {
  const lastFetch = await getLastFetchTime(sportType)
  if (lastFetch === 0) return true
  return (Date.now() - lastFetch) > intervalMinutes * 60 * 1000
}
```

后台 Service Worker 使用 `chrome.alarms` 定时触发全量刷新。

### 球员/选手数据按需加载

使用 `useRef(hasAttemptedLoad)` 确保每次打开详情页只请求一次，避免重复调用消耗 API 额度。

### 收藏系统与持久化

`FavoriteItem` 结构设计支持扩展：

```typescript
interface FavoriteItem {
  id: string                                            // "{sport}-player-{playerId}"
  type: 'team' | 'player'
  sportType: SportType
  name: string
  logo?: string
  extra?: Record<string, string | number | undefined>  // 可扩展元数据
}
// extra 当前存储: team, position, stats(摘要), profileUrl
```

### 比赛状态判定

**NBA：** 直接使用 API 返回的 `gameStatus` (1=upcoming, 2=live, 3=finished)

**足球：** 基于 ESPN/TheSportsDB 的状态字段

**电竞 (Polymarket)：** 综合市场状态 + 时间逻辑：

```
市场全部关闭 → finished
开始时间超过 8 小时 → finished (防止僵尸 live 状态)
市场活跃 + 已过开始时间 → live
市场活跃 + 未到开始时间 → upcoming
```

---

## 构建与部署

### 开发环境

```bash
npm install          # 安装依赖
npm run dev          # 开发模式（需要 Chromium 浏览器）
```

### 生产构建

```bash
npm run build            # Chrome/Edge (Chromium MV3)
npm run build:firefox    # Firefox (MV2)
npm run build:edge       # Edge
```

构建产物输出到 `dist/{browser}/`，包含：

```
dist/chromium/
├── manifest.json        # 浏览器扩展清单
├── action/
│   ├── index.html       # Popup 入口
│   ├── index.js         # 打包后的 JS (~205KB)
│   └── index.css        # 打包后的 CSS (~14KB)
├── background/
│   └── service_worker.js # 后台脚本 (~28KB)
└── icons/               # 多尺寸图标
```

### 浏览器安装

1. 打开 `chrome://extensions/`
2. 开启 "开发者模式"
3. "加载已解压的扩展程序" → 选择 `dist/chromium/`

---

## 扩展开发指南

### 新增运动类型

1. **类型定义：** 在 `types/index.ts` 的 `SportType` 联合类型中添加新值
2. **数据服务：** 在 `services/` 下创建新的数据获取模块
3. **API 路由：** 在 `api.ts` 的 `fetchMatches()` switch 中添加分支
4. **UI 组件：** 创建新的 Tab 组件
5. **App 入口：** 在 `popup/App.tsx` 的 TABS 数组和渲染逻辑中注册
6. **存储：** 在 `StorageData.cachedMatches` 和 `lastFetchTime` 中添加对应 key
7. **国际化：** 在 `zh.ts` / `en.ts` 中添加翻译

### 新增数据源

以电竞为例，当前的降级链为 `Polymarket → PandaScore → Fallback`：

1. 在 `services/scrapers/` 或 `services/` 下实现新的数据源函数
2. 在对应的主 service 文件中添加到降级链
3. 确保返回的数据符合 `Match` 接口
4. 如需新权限，在 `manifest.json` 的 `host_permissions` 中添加域名

### 新增语言

1. 在 `i18n/` 下创建新的翻译文件（如 `ja.ts`）
2. 在 `i18n/index.tsx` 中导入并注册到 translations map
3. 在 `types/index.ts` 的 `AppSettings.language` 类型中添加新值
4. 在 `SettingsPanel.tsx` 中添加语言选项

---

## 类型系统概览

```typescript
// 核心类型 (src/types/index.ts)

type SportType = 'nba' | 'football' | 'esports'
type MatchStatus = 'upcoming' | 'live' | 'finished'
type EsportsGame = 'csgo' | 'lol' | 'valorant' | 'dota2'

interface Match {
  id: string
  sportType: SportType
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  homeLogo?: string
  awayLogo?: string
  status: MatchStatus
  startTime: string            // ISO 8601
  league: string
  extra?: Record<string, string | number | undefined>
  homePlayers?: PlayerStat[]
  awayPlayers?: PlayerStat[]
}

interface PlayerStat {
  id: string
  name: string
  team: string
  position?: string
  avatar?: string
  stats: Record<string, string | number>
}

interface FavoriteItem {
  id: string
  type: 'team' | 'player'
  sportType: SportType
  name: string
  logo?: string
  extra?: Record<string, string | number | undefined>
}

interface AppSettings {
  refreshInterval: number       // 分钟
  enableNotifications: boolean
  theme: 'dark' | 'light'
  language: 'zh' | 'en'
  activeTab: SportType
  esportsGameFilter: EsportsGame | 'all'
  footballLeagueFilter: string
}
```

---

## 安全注意事项

- `src/config/api-keys.ts` 已加入 `.gitignore`，**绝不提交 API Key 到仓库**
- 所有外部 API 调用使用 HTTPS
- `manifest.json` 中的 `host_permissions` 仅声明了实际使用的 API 域名
- 无远程代码执行，所有代码均为本地打包
- `chrome.storage.local` 仅限扩展自身访问，不同扩展间隔离

---

*文档版本: 1.0.0 | 最后更新: 2026-02-28*
