[powered-image]: https://img.shields.io/badge/Powered%20by-Extension.js-0971fe
[powered-url]: https://extension.js.org

![Powered by Extension.js][powered-image]

# Sports Hub - 体育赛事中心 🏀⚽🎮

> 一站式体育赛事数据聚合浏览器扩展，支持 NBA、足球、电竞实时数据追踪

## ✨ 功能特性

- 🏀 **NBA 赛事**：实时比分、球员详细统计数据
- ⚽ **足球赛事**：英超、西甲、德甲、意甲、法甲、欧冠等主流联赛
- 🎮 **电竞赛事**：CS2、LOL、VALORANT、DOTA2 等热门游戏
- ⭐ **关注功能**：收藏喜欢的球队和选手
- 🔄 **自动刷新**：可配置的数据更新间隔
- 📊 **详细数据**：点击比赛查看球员/选手详细统计
- 🌙 **深色模式**：舒适的视觉体验

## 📦 安装

### 开发环境

```bash
# 克隆项目
git clone <repository-url>
cd sports-hub-extension

# 安装依赖
npm install

# 配置 API Keys（可选）
cp src/config/api-keys.example.ts src/config/api-keys.ts
# 编辑 api-keys.ts 填写你的 API keys

# 开发模式运行
npm run dev

# 构建生产版本
npm run build
```

### 浏览器安装

1. 运行 `npm run build` 构建扩展
2. 打开浏览器扩展管理页面：
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Firefox: `about:addons`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `dist/chromium` 目录

## 🔑 API 配置

本扩展使用多个体育数据 API。详细配置说明请查看 [API_SETUP.md](./API_SETUP.md)

### 快速配置

1. **NBA 数据** ✅ 无需配置（使用 NBA 官方 CDN）

2. **足球数据** 🔑 需要 API Key
   - 注册：https://www.football-data.org/client/register
   - 免费额度：10 次/天

3. **电竞数据** 🔑 需要 API Key
   - 注册：https://pandascore.co/users/sign_up
   - 免费额度：1000 次/月

### 无 API Key？

没问题！扩展会自动使用高质量的模拟数据（Fallback Data），包含完整的球员统计信息，所有功能正常可用。

## 🚀 使用方法

1. 点击浏览器工具栏的扩展图标
2. 选择你感兴趣的运动类型（NBA/足球/电竞）
3. 浏览实时比赛列表
4. 点击比赛卡片查看详细球员数据
5. 点击 ⭐ 收藏喜欢的球队或球员

## 🛠️ 开发命令

```bash
# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 针对特定浏览器构建
npm run build:firefox
npm run build:edge

# 预览扩展
npm run start
```

## 📁 项目结构

```
sports-hub-extension/
├── src/
│   ├── components/          # React 组件
│   │   ├── NBATab.tsx      # NBA 标签页
│   │   ├── FootballTab.tsx # 足球标签页
│   │   ├── EsportsTab.tsx  # 电竞标签页
│   │   ├── MatchDetail.tsx # 比赛详情
│   │   └── ...
│   ├── services/           # API 服务
│   │   ├── nba.ts         # NBA 数据获取
│   │   ├── football.ts    # 足球数据获取
│   │   ├── esports.ts     # 电竞数据获取
│   │   └── api.ts         # 统一 API 接口
│   ├── config/            # 配置文件
│   │   └── api-keys.ts    # API Keys（需自行创建）
│   ├── types/             # TypeScript 类型定义
│   ├── hooks/             # React Hooks
│   └── utils/             # 工具函数
├── public/                # 静态资源
├── API_SETUP.md          # API 配置详细说明
└── README.md             # 项目说明
```

## 🔧 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Extension.js
- **数据源**:
  - NBA: cdn.nba.com 官方 API
  - 足球: football-data.org API
  - 电竞: PandaScore API
- **存储**: Chrome Storage API
- **样式**: CSS Modules

## 📝 数据说明

### NBA 数据
- ✅ 实时比分和比赛状态
- ✅ 球员详细统计（得分、篮板、助攻等）
- ✅ 球队 Logo
- ✅ 比赛领袖数据

### 足球数据
- ⚽ 主流联赛比赛信息
- ⚽ 实时比分和半场比分
- ⚽ 球队徽章
- ⚽ 轮次信息

### 电竞数据
- 🎮 多游戏支持（CS2/LOL/VAL/DOTA2）
- 🎮 实时比赛状态
- 🎮 战队 Logo
- 🎮 BO3/BO5 赛制信息

## ⚠️ 注意事项

1. **API 调用限制**
   - 足球 API: 10次/天（免费版）
   - 电竞 API: 1000次/月（免费版）
   - 扩展会自动缓存数据，减少 API 调用

2. **隐私保护**
   - 不要将 `api-keys.ts` 提交到 Git
   - 该文件已添加到 `.gitignore`

3. **数据更新**
   - 默认每 10 分钟自动刷新
   - 可在设置中调整刷新间隔
   - 手动点击刷新按钮立即更新

## 🐛 故障排除

**Q: 显示"暂无比赛数据"？**
- 检查是否配置了 API Keys
- 查看浏览器控制台是否有错误信息
- 确认当天是否有比赛安排

**Q: 球员数据不显示？**
- NBA: 只有已开始的比赛才有球员数据
- 足球/电竞: 需要配置 API Key 或使用 Fallback 数据

**Q: API 调用失败？**
- 检查 API Key 是否正确
- 确认是否超出免费额度
- 查看网络连接是否正常

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过 GitHub Issues 联系。

---

Made with ❤️ by chenzilong
