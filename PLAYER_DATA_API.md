# 球员数据 API 配置说明

## 📋 概述

扩展现在支持自动获取足球和电竞比赛的球员数据。数据来源于免费的第三方 API。

## ⚽ 足球球员数据

### TheSportsDB API（完全免费）

**无需注册，开箱即用！**

- **API Key**: `123` (官方免费 key，已内置)
- **覆盖**: 256,000+ 球员
- **限制**: 无限制
- **数据**: 球员基本信息（号码、国籍、身高、体重）

**工作原理**:
- 自动为已结束和进行中的足球比赛获取球员数据
- 通过球队名称搜索球员
- 每场比赛显示最多 10 名球员

**数据来源**: [TheSportsDB](https://www.thesportsdb.com/documentation)

## 🎮 电竞球员数据

### PandaScore API（免费计划）

**需要注册获取 API Key**

- **免费额度**: 1000 请求/小时
- **覆盖游戏**: CS2, LOL, VALORANT, DOTA2
- **数据**: 选手信息（位置、国籍、ID）

### 如何配置

1. **注册账号**
   - 访问: https://pandascore.co/users/sign_up
   - 填写邮箱和密码注册
   - 验证邮箱

2. **获取 API Key**
   - 登录后访问: https://pandascore.co/settings/api
   - 复制你的 API Token

3. **配置到扩展**
   - 打开文件: `src/config/api-keys.ts`
   - 找到 `PANDASCORE` 字段
   - 粘贴你的 API Key:
   ```typescript
   export const API_KEYS = {
     PANDASCORE: 'your-api-key-here',  // 粘贴你的 key
   }
   ```
   - 重新构建扩展: `npm run build`

4. **验证配置**
   - 打开扩展
   - 切换到电竞标签
   - 点击已结束或进行中的比赛
   - 如果配置正确，会显示球员数据

### 不配置会怎样？

- 足球数据：正常工作（使用免费 key）
- 电竞数据：不会获取球员数据，但比赛数据正常显示

## 🔧 技术实现

### 数据获取流程

```
1. 爬取比赛数据（Polymarket API）
   ↓
2. 判断比赛状态
   ↓
3. 如果是已结束或进行中的比赛
   ↓
4. 并行获取两支队伍的球员数据
   ↓
5. 合并数据并显示
```

### API 端点

**足球**:
```
GET https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?t={TeamName}
```

**电竞**:
```
GET https://api.pandascore.co/{game}/teams?search[name]={TeamName}
GET https://api.pandascore.co/{game}/teams/{teamId}/players
```

## 📊 数据示例

### 足球球员数据
```json
{
  "id": "fb-haaland",
  "name": "Erling Haaland",
  "team": "Manchester City",
  "position": "ST",
  "stats": {
    "号码": "9",
    "国籍": "Norway",
    "身高": "1.94 m",
    "体重": "88 kg"
  }
}
```

### 电竞球员数据
```json
{
  "id": "esports-123",
  "name": "Faker",
  "team": "T1",
  "position": "MID",
  "stats": {
    "位置": "MID",
    "国籍": "KR",
    "ID": "faker"
  }
}
```

## ⚠️ 注意事项

### 请求限制
- **TheSportsDB**: 无限制
- **PandaScore**: 1000 请求/小时（免费计划）

### 数据准确性
- 球员数据来自第三方 API，可能存在延迟或不准确
- 某些小型球队可能没有球员数据
- 球员统计数据为基本信息，不包含实时比赛数据

### 性能优化
- 只为已结束和进行中的比赛获取球员数据
- 使用并行请求提升速度
- 每场比赛最多显示 10 名球员

## 🐛 故障排除

### 问题: 足球球员数据不显示

**可能原因**:
1. 球队名称不匹配（API 使用英文名称）
2. 该球队没有数据
3. 网络问题

**解决方案**:
- 检查浏览器控制台错误信息
- 确认网络连接正常
- 某些小球队可能没有数据

### 问题: 电竞球员数据不显示

**可能原因**:
1. 未配置 API Key
2. API Key 无效或过期
3. 超过请求限制（1000/小时）
4. 战队名称不匹配

**解决方案**:
1. 检查 `src/config/api-keys.ts` 配置
2. 验证 API Key 是否正确
3. 等待一小时后重试
4. 查看控制台日志确认错误

### 问题: 构建失败

**解决方案**:
```bash
# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 重新构建
npm run build
```

## 📚 相关资源

- [TheSportsDB 文档](https://www.thesportsdb.com/documentation)
- [PandaScore 文档](https://developers.pandascore.co/docs/introduction)
- [Polymarket API](https://gamma-api.polymarket.com)

## 🔮 未来计划

- [ ] 支持更多数据源
- [ ] 添加球员详细统计（进球、助攻等）
- [ ] 支持历史比赛球员数据
- [ ] 添加球员对比功能
- [ ] 缓存球员数据减少 API 调用

---

**最后更新**: 2026-02-26
**版本**: 1.0.0
