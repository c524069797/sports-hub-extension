# 数据爬取说明

## 📡 数据获取策略

扩展采用**三层降级策略**确保数据可用性：

```
1. 爬虫获取最新数据（优先）
   ↓ 失败
2. API 获取（如果配置了 key）
   ↓ 失败
3. Fallback 模拟数据（保底）
```

## 🏀 NBA 数据

**数据源**: NBA 官方 CDN
- ✅ 实时比赛比分
- ✅ 自动获取球员详细统计
- ✅ 无需配置，开箱即用

**API 端点**:
- 比赛列表: `https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json`
- 球员数据: `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_{gameId}.json`

## ⚽ 足球数据

### 爬虫数据源

**1. ESPN Soccer API** (主要)
- 端点: `https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard`
- 特点: 公开 API，无需认证
- 覆盖: 全球主流联赛
- 数据: 实时比分、球队 Logo、比赛状态

**2. TheSportsDB** (备用)
- 端点: `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d={date}&s=Soccer`
- 特点: 免费 API，无需注册
- 覆盖: 全球足球赛事
- 数据: 比赛信息、球队徽章、场地信息

### 降级方案
如果爬虫失败，会尝试：
1. Football-Data.org API（需要配置 key）
2. Fallback 模拟数据（包含完整球员信息）

## 🎮 电竞数据

### 爬虫数据源

**1. Abios Gaming API** (主要)
- 端点: `https://api.abiosgaming.com/v2/matches`
- 特点: 公开 API
- 覆盖: CS2, LOL, VALORANT, DOTA2
- 数据: 实时比赛、战队 Logo、赛制信息

### 备用数据源（已预留）
- Liquipedia API
- Strafe API
- VLR.gg (VALORANT 专用)

### 降级方案
如果爬虫失败，会尝试：
1. PandaScore API（需要配置 key）
2. Fallback 模拟数据（包含完整选手信息）

## 🔧 技术实现

### 文件结构
```
src/services/
├── nba.ts              # NBA 数据获取
├── football.ts         # 足球数据获取（含爬虫调用）
├── esports.ts          # 电竞数据获取（含爬虫调用）
└── scrapers/
    ├── football-scraper.ts  # 足球爬虫实现
    └── esports-scraper.ts   # 电竞爬虫实现
```

### 爬虫特点
- ✅ 使用公开 API，无需认证
- ✅ 自动错误处理和降级
- ✅ 遵守 CORS 和 rate limit
- ✅ 添加适当的 User-Agent
- ✅ 并行请求提升性能

## 📊 数据更新

### 自动刷新
- 默认间隔: 10 分钟
- 可在设置中调整: 5-60 分钟
- 使用 Chrome Alarms API 实现

### 手动刷新
点击刷新按钮立即更新数据

### 缓存机制
- 使用 Chrome Storage API 缓存数据
- 避免频繁 API 调用
- 离线时显示缓存数据

## ⚠️ 注意事项

### CORS 限制
某些网站可能有 CORS 限制，扩展通过以下方式解决：
1. 使用 `host_permissions` 声明权限
2. 选择支持 CORS 的公开 API
3. 添加适当的请求头

### Rate Limiting
为避免被限流：
1. 使用缓存减少请求
2. 设置合理的刷新间隔
3. 错误时自动降级到备用源

### 数据准确性
- NBA: 官方数据，100% 准确
- 足球: 来自 ESPN/TheSportsDB，准确度高
- 电竞: 来自 Abios，覆盖主流赛事

## 🐛 故障排除

### 问题: 爬虫获取失败
**解决方案**:
1. 检查浏览器控制台错误信息
2. 确认网络连接正常
3. 验证 manifest 权限配置
4. 扩展会自动降级到 fallback 数据

### 问题: 数据不是最新的
**解决方案**:
1. 点击刷新按钮手动更新
2. 检查缓存时间是否过期
3. 查看控制台日志确认爬虫状态

### 问题: 某些比赛缺少数据
**原因**:
- 数据源可能未覆盖该赛事
- 比赛尚未开始（球员数据）
- API 临时故障

**解决方案**:
- 等待数据源更新
- 使用 fallback 数据体验功能

## 📈 性能优化

### 并行请求
- NBA: 并行获取所有比赛的 boxscore
- 足球/电竞: 单次请求获取多场比赛

### 数据压缩
- 只保存必要字段
- 使用 Chrome Storage 压缩

### 懒加载
- 只在切换标签时加载对应数据
- 球员详情按需获取

## 🔮 未来计划

### 更多数据源
- [ ] 添加更多足球数据源
- [ ] 支持更多电竞游戏
- [ ] 集成球员详细统计

### 功能增强
- [ ] 比赛提醒通知
- [ ] 数据可视化图表
- [ ] 历史比赛查询
- [ ] 球员对比分析

## 📝 开发者说明

### 添加新数据源

1. 在 `scrapers/` 目录创建新文件
2. 实现爬取函数
3. 在主服务文件中调用
4. 更新 manifest 权限

示例：
```typescript
// scrapers/new-source.ts
export async function scrapeFromNewSource(): Promise<Match[]> {
  try {
    const response = await fetch('https://api.example.com/matches')
    const data = await response.json()
    return parseData(data)
  } catch (error) {
    console.error('Scraping failed:', error)
    return []
  }
}
```

### 测试爬虫
```bash
# 开发模式运行
npm run dev

# 打开浏览器控制台
# 查看爬虫日志输出
```

---

**最后更新**: 2026-02-26
**版本**: 1.0.0
