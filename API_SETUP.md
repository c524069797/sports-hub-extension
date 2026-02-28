# API 配置指南

本扩展使用多个体育数据 API 来获取实时比赛信息。部分 API 需要注册获取免费的 API Key。

## 📋 API 列表

### 1. NBA 数据 ✅ 无需配置
- **数据源**: NBA 官方 CDN (cdn.nba.com)
- **说明**: 完全免费，无需注册
- **功能**:
  - ✅ 实时比赛比分
  - ✅ 球员详细统计数据
  - ✅ 球队 Logo

### 2. 足球数据 🔑 需要 API Key
- **数据源**: [Football-Data.org](https://www.football-data.org/)
- **免费额度**: 每天 10 次调用
- **覆盖联赛**: 英超、西甲、德甲、意甲、法甲、欧冠等

#### 获取步骤：
1. 访问 https://www.football-data.org/client/register
2. 填写邮箱注册（无需信用卡）
3. 在邮箱中确认账户
4. 登录后在 Dashboard 查看你的 API Token
5. 复制 Token 到 `src/config/api-keys.ts` 的 `FOOTBALL_DATA_ORG` 字段

### 3. 电竞数据 🔑 需要 API Key
- **数据源**: [PandaScore](https://pandascore.co/)
- **免费额度**: 每月 1000 次调用
- **覆盖游戏**: CS2, LOL, VALORANT, DOTA2

#### 获取步骤：
1. 访问 https://pandascore.co/users/sign_up
2. 注册账户（可以用 GitHub 登录）
3. 登录后访问 https://pandascore.co/settings/api
4. 创建一个新的 API Token
5. 复制 Token 到 `src/config/api-keys.ts` 的 `PANDASCORE` 字段

## 🛠️ 配置方法

编辑 `src/config/api-keys.ts` 文件：

```typescript
export const API_KEYS = {
  FOOTBALL_DATA_ORG: 'your_football_api_key_here',
  PANDASCORE: 'your_pandascore_api_key_here',
}
```

## 📦 重新构建

配置完成后，重新构建扩展：

```bash
npm run build
```

## 🔄 Fallback 数据

如果没有配置 API Key 或 API 调用失败，扩展会自动使用模拟数据（Fallback Data），包含：
- 示例比赛数据
- 完整的球员统计信息
- 所有功能正常可用

这样你可以先体验扩展功能，之后再配置真实 API。

## ⚠️ 注意事项

1. **不要提交 API Keys 到 Git**
   - `api-keys.ts` 已添加到 `.gitignore`
   - 如果分享代码，记得清空 API Keys

2. **API 调用限制**
   - 足球 API: 10次/天（免费版）
   - 电竞 API: 1000次/月（免费版）
   - 扩展会自动缓存数据，减少 API 调用

3. **数据更新频率**
   - 默认每 10 分钟刷新一次
   - 可在设置中调整刷新间隔

## 🆘 常见问题

**Q: 为什么显示"暂无比赛数据"？**
A: 可能是：
- 当天确实没有比赛
- API Key 未配置或无效
- 超出 API 调用限制
- 网络连接问题

**Q: 如何验证 API Key 是否有效？**
A:
1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 刷新扩展
4. 查看是否有 API 错误信息

**Q: 可以只配置部分 API 吗？**
A: 可以！未配置的数据源会自动使用 Fallback 数据。
