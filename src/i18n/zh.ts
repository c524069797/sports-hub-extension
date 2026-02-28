export const zhTranslations = {
  // 通用
  common: {
    loading: '加载中...',
    refresh: '刷新',
    retry: '重试',
    back: '返回',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    matches: '场比赛',
    noData: '暂无数据',
  },

  // 应用标题
  app: {
    title: 'Sports Hub',
    subtitle: '体育赛事中心',
  },

  // 导航标签
  nav: {
    nba: 'NBA',
    football: '足球',
    esports: '电竞',
    favorites: '关注',
    finance: '金融',
    settings: '设置',
  },

  // 比赛状态
  matchStatus: {
    live: '进行中',
    upcoming: '即将开始',
    finished: '已结束',
  },

  // 比赛列表
  matchList: {
    loading: '加载中...',
    loadError: '加载失败',
    noMatches: '暂无比赛数据',
    matchCount: '场比赛',
    favoriteTeams: '★ 关注球队',
    allMatches: '全部比赛',
    refreshTitle: '刷新',
  },

  // 比赛详情
  matchDetail: {
    back: '返回',
    matchInfo: '比赛信息',
    league: '联赛',
    startTime: '开始时间',
    status: '状态',
    homeTeam: '主队',
    awayTeam: '客队',
    score: '比分',
    players: '球员统计',
    playersEsports: '选手统计',
    homePlayers: '主队球员',
    awayPlayers: '客队球员',
    noPlayerData: '暂无球员数据',
    noPlayerDataEsports: '暂无选手数据',
    stats: '数据',
    favoritePlayer: '关注球员',
    favoritePlayerEsports: '关注选手',
    unfavoritePlayer: '取消关注',
  },

  // 关注面板
  favorites: {
    title: '我的关注',
    empty: '还没有关注任何球队或球员',
    hintTeam: '点击比赛卡片上的 ☆ 关注球队',
    hintPlayer: '点击比赛详情中球员旁的 ☆ 关注球员',
    unfavorite: '取消关注',
    team: '球队',
    player: '球员',
  },

  // 设置面板
  settings: {
    title: '设置',
    refreshInterval: '自动刷新间隔',
    theme: '主题模式',
    themeDark: '深色',
    themeLight: '浅色',
    language: '语言',
    languageZh: '中文',
    languageEn: 'English',
    version: 'Sports Hub v1.0.0',
    description: 'NBA / 足球 / 电竞赛事 + 金融行情',
    minutes: '分钟',
  },

  // 金融模块
  finance: {
    title: '💰 金融行情',
    search: '搜索',
    searchPlaceholder: '输入代码/名称/地址',
    searchBtn: '搜索',
    refresh: '刷新',
    goldSilver: '贵金属',
    watchlist: '我的关注',
    add: '+ 关注',
    added: '已添加',
    remove: '取消关注',
    emptyHint: '点击 🔍 搜索并添加关注资产',
    crypto: '加密货币',
    metals: '贵金属',
    stockCN: 'A股',
    stockUS: '美股',
    fund: '基金',
    all: '全部',
  },

  // 运动类型
  sportTypes: {
    nba: 'NBA',
    football: '足球',
    esports: '电竞',
  },

  // 类型标签
  types: {
    team: '球队',
    player: '球员',
  },

  // NBA 球队名称映射
  nbaTeams: {
    'Atlanta Hawks': 'ATL 老鹰',
    'Boston Celtics': 'BOS 凯尔特人',
    'Brooklyn Nets': 'BKN 篮网',
    'Charlotte Hornets': 'CHA 黄蜂',
    'Chicago Bulls': 'CHI 公牛',
    'Cleveland Cavaliers': 'CLE 骑士',
    'Dallas Mavericks': 'DAL 独行侠',
    'Denver Nuggets': 'DEN 掘金',
    'Detroit Pistons': 'DET 活塞',
    'Golden State Warriors': 'GSW 勇士',
    'Houston Rockets': 'HOU 火箭',
    'Indiana Pacers': 'IND 步行者',
    'LA Clippers': 'LAC 快船',
    'Los Angeles Lakers': 'LAL 湖人',
    'Memphis Grizzlies': 'MEM 灰熊',
    'Miami Heat': 'MIA 热火',
    'Milwaukee Bucks': 'MIL 雄鹿',
    'Minnesota Timberwolves': 'MIN 森林狼',
    'New Orleans Pelicans': 'NOP 鹈鹕',
    'New York Knicks': 'NYK 尼克斯',
    'Oklahoma City Thunder': 'OKC 雷霆',
    'Orlando Magic': 'ORL 魔术',
    'Philadelphia 76ers': 'PHI 76人',
    'Phoenix Suns': 'PHX 太阳',
    'Portland Trail Blazers': 'POR 开拓者',
    'Sacramento Kings': 'SAC 国王',
    'San Antonio Spurs': 'SAS 马刺',
    'Toronto Raptors': 'TOR 猛龙',
    'Utah Jazz': 'UTA 爵士',
    'Washington Wizards': 'WAS 奇才',
  },

  // 足球联赛
  footballLeagues: {
    '英超': '英超',
    '西甲': '西甲',
    '德甲': '德甲',
    '意甲': '意甲',
    '法甲': '法甲',
    '欧冠': '欧冠',
    '欧联杯': '欧联杯',
    '世界杯': '世界杯',
    '欧洲杯': '欧洲杯',
    '足球': '足球',
    'Premier League': '英超',
    'La Liga': '西甲',
    'Bundesliga': '德甲',
    'Serie A': '意甲',
    'Ligue 1': '法甲',
    'Champions League': '欧冠',
    'Europa League': '欧联杯',
    'World Cup': '世界杯',
    'Euro': '欧洲杯',
    'Nations League': '欧国联',
    'Football': '足球',
  },

  // 电竞游戏
  esportsGames: {
    csgo: 'CS2',
    lol: '英雄联盟',
    valorant: 'VALORANT',
    dota2: 'DOTA2',
    'CS2': 'CS2',
    'LOL': '英雄联盟',
    '英雄联盟': '英雄联盟',
    'VALORANT': 'VALORANT',
    'DOTA2': 'DOTA2',
  },

  // 电竞联赛
  esportsLeagues: {
    'IEM': 'IEM',
    'BLAST Premier': 'BLAST Premier',
    'ESL Pro League': 'ESL Pro League',
    'CS Major': 'CS Major',
    'CS2': 'CS2',
    'Worlds': 'Worlds',
    'LCK': 'LCK',
    'LPL': 'LPL',
    'LEC': 'LEC',
    'LCS': 'LCS',
    'MSI': 'MSI',
    'LOL': '英雄联盟',
    '英雄联盟': '英雄联盟',
    'VCT Champions': 'VCT Champions',
    'VCT Masters': 'VCT Masters',
    'VCT Americas': 'VCT Americas',
    'VCT Pacific': 'VCT Pacific',
    'VCT EMEA': 'VCT EMEA',
    'VALORANT': 'VALORANT',
    'The International': 'The International',
    'DPC': 'DPC',
    'Dota Major': 'Dota Major',
    'DOTA2': 'DOTA2',
  },
}
