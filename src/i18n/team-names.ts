// 球队名称翻译映射

// 足球队伍名称映射（英文 -> 中文）
// 覆盖 ESPN API 返回的 displayName 格式
export const footballTeamsZh: Record<string, string> = {
  // 英超 (ESPN: eng.1)
  'Manchester City': '曼城',
  'Liverpool': '利物浦',
  'Arsenal': '阿森纳',
  'Chelsea': '切尔西',
  'Manchester United': '曼联',
  'Tottenham Hotspur': '热刺',
  'Newcastle United': '纽卡斯尔',
  'Brighton & Hove Albion': '布莱顿',
  'Aston Villa': '阿斯顿维拉',
  'West Ham United': '西汉姆',
  'Everton': '埃弗顿',
  'Nottingham Forest': '诺丁汉森林',
  'Fulham': '富勒姆',
  'AFC Bournemouth': '伯恩茅斯',
  'Crystal Palace': '水晶宫',
  'Wolverhampton Wanderers': '狼队',
  'Brentford': '布伦特福德',
  'Burnley': '伯恩利',
  'Leeds United': '利兹联',
  'Sunderland': '桑德兰',
  'Ipswich Town': '伊普斯维奇',
  'Leicester City': '莱斯特城',
  'Southampton': '南安普顿',

  // 西甲 (ESPN: esp.1)
  'Real Madrid': '皇家马德里',
  'Barcelona': '巴塞罗那',
  'Atlético Madrid': '马德里竞技',
  'Sevilla': '塞维利亚',
  'Real Sociedad': '皇家社会',
  'Valencia': '瓦伦西亚',
  'Villarreal': '比利亚雷亚尔',
  'Athletic Club': '毕尔巴鄂竞技',
  'Real Betis': '皇家贝蒂斯',
  'Girona': '赫罗纳',
  'Mallorca': '马洛卡',
  'Celta Vigo': '塞尔塔',
  'Osasuna': '奥萨苏纳',
  'Getafe': '赫塔费',
  'Rayo Vallecano': '巴列卡诺',
  'Alavés': '阿拉维斯',
  'Espanyol': '西班牙人',
  'Las Palmas': '拉斯帕尔马斯',
  'Levante': '莱万特',
  'Elche': '埃尔切',
  'Real Oviedo': '奥维耶多',

  // 德甲 (ESPN: ger.1)
  'Bayern Munich': '拜仁慕尼黑',
  'Borussia Dortmund': '多特蒙德',
  'RB Leipzig': '莱比锡红牛',
  'Bayer Leverkusen': '勒沃库森',
  '1. FC Union Berlin': '柏林联合',
  'SC Freiburg': '弗赖堡',
  'Eintracht Frankfurt': '法兰克福',
  'VfB Stuttgart': '斯图加特',
  'VfL Wolfsburg': '沃尔夫斯堡',
  'Borussia Mönchengladbach': '门兴格拉德巴赫',
  'TSG Hoffenheim': '霍芬海姆',
  'Mainz': '美因茨',
  'Werder Bremen': '不来梅',
  'FC Augsburg': '奥格斯堡',
  '1. FC Heidenheim 1846': '海登海姆',
  'FC Cologne': '科隆',
  'St. Pauli': '圣保利',
  'Hamburg SV': '汉堡',

  // 意甲 (ESPN: ita.1)
  'Internazionale': '国际米兰',
  'AC Milan': 'AC米兰',
  'Juventus': '尤文图斯',
  'Napoli': '那不勒斯',
  'AS Roma': '罗马',
  'Lazio': '拉齐奥',
  'Atalanta': '亚特兰大',
  'Fiorentina': '佛罗伦萨',
  'Bologna': '博洛尼亚',
  'Torino': '都灵',
  'Como': '科莫',
  'Genoa': '热那亚',
  'Cagliari': '卡利亚里',
  'Lecce': '莱切',
  'Udinese': '乌迪内斯',
  'Sassuolo': '萨索洛',
  'Hellas Verona': '维罗纳',
  'Parma': '帕尔马',
  'Cremonese': '克雷莫纳',
  'Pisa': '比萨',

  // 法甲 (ESPN: fra.1)
  'Paris Saint-Germain': '巴黎圣日耳曼',
  'Marseille': '马赛',
  'AS Monaco': '摩纳哥',
  'Lyon': '里昂',
  'Lille': '里尔',
  'Lens': '朗斯',
  'Nice': '尼斯',
  'Stade Rennais': '雷恩',
  'Strasbourg': '斯特拉斯堡',
  'Nantes': '南特',
  'Toulouse': '图卢兹',
  'Brest': '布雷斯特',
  'Le Havre AC': '勒阿弗尔',
  'Lorient': '洛里昂',
  'Metz': '梅斯',
  'Angers': '昂热',
  'AJ Auxerre': '欧塞尔',
  'Paris FC': '巴黎FC',

  // 国家队
  'France': '法国',
  'Germany': '德国',
  'Spain': '西班牙',
  'Italy': '意大利',
  'England': '英格兰',
  'Brazil': '巴西',
  'Argentina': '阿根廷',
  'Portugal': '葡萄牙',
  'Netherlands': '荷兰',
  'Belgium': '比利时',
  'Croatia': '克罗地亚',
  'Uruguay': '乌拉圭',
  'Colombia': '哥伦比亚',
  'Japan': '日本',
  'South Korea': '韩国',
  'Morocco': '摩洛哥',
  'United States': '美国',
  'Mexico': '墨西哥',
  'Switzerland': '瑞士',
  'Denmark': '丹麦',
  'Austria': '奥地利',
  'Turkey': '土耳其',
  'Türkiye': '土耳其',
  'Poland': '波兰',
  'Sweden': '瑞典',
  'Serbia': '塞尔维亚',
  'Czech Republic': '捷克',
  'Czechia': '捷克',
  'Scotland': '苏格兰',
  'Wales': '威尔士',
  'Ukraine': '乌克兰',
  'China PR': '中国',
  'Gibraltar': '直布罗陀',
  'Latvia': '拉脱维亚',
  'Malta': '马耳他',
  'Luxembourg': '卢森堡',
}

// 自动反转生成中文 -> 英文映射
export const footballTeamsEn: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const [en, zh] of Object.entries(footballTeamsZh)) {
    if (!map[zh]) {
      map[zh] = en
    }
  }
  return map
})()

// 电竞战队名称映射（全名 -> 缩写/中文简称）
// 参考 nba-predict-dapp 项目的翻译规则，使用 lowercase key 进行模糊匹配
const esportsTeamsMap: Record<string, string> = {
  // ========== League of Legends - LPL ==========
  'bilibili gaming': 'BLG',
  'blg': 'BLG',
  'jd gaming': 'JDG',
  'jdg': 'JDG',
  'top esports': 'TES',
  'tes': 'TES',
  'weibo gaming': 'WBG',
  'wbg': 'WBG',
  'lng esports': 'LNG',
  'lng': 'LNG',
  'edward gaming': 'EDG',
  'edg': 'EDG',
  'funplus phoenix': 'FPX',
  'fpx': 'FPX',
  'royal never give up': 'RNG',
  'rng': 'RNG',
  'invictus gaming': 'IG',
  'ig': 'IG',
  'team we': 'WE',
  'we': 'WE',
  'omg': 'OMG',
  'oh my god': 'OMG',
  'suning': 'SN',
  'rare atom': 'RA',
  'ra': 'RA',
  "anyone's legend": 'AL',
  'al': 'AL',
  'tt gaming': 'TT',
  'tt': 'TT',
  'up gaming': 'UP',
  'ninjas in pyjamas': 'NIP',
  'nip': 'NIP',
  'ultra prime': 'UP',
  'ctbc flying oyster': 'CFO',

  // ========== League of Legends - LCK ==========
  't1': 'T1',
  'gen.g': 'GEN',
  'gen.g esports': 'GEN',
  'geng': 'GEN',
  'hanwha life esports': 'HLE',
  'hle': 'HLE',
  'kt rolster': 'KT',
  'kt': 'KT',
  'dplus kia': 'DK',
  'dk': 'DK',
  'damwon': 'DK',
  'damwon kia': 'DK',
  'drx': 'DRX',
  'kwangdong freecs': 'KDF',
  'kdf': 'KDF',
  'liiv sandbox': 'LSB',
  'lsb': 'LSB',
  'nongshim redforce': 'NS',
  'ns': 'NS',
  'brion': 'BRO',
  'ok brion': 'BRO',
  'fearx': 'FearX',
  'fukuoka softbank hawks': 'SHG',

  // ========== League of Legends - LEC/International ==========
  'fnatic': 'FNC',
  'fnc': 'FNC',
  'g2 esports': 'G2',
  'g2': 'G2',
  'mad lions': 'MAD',
  'mad': 'MAD',
  'team vitality': 'VIT',
  'vitality': 'VIT',
  'team heretics': 'TH',
  'sk gaming': 'SK',
  'team bds': 'BDS',
  'bds': 'BDS',
  'karmine corp': 'KC',
  'kc': 'KC',
  'rogue': 'RGE',
  'rge': 'RGE',
  'excel esports': 'XL',
  'xl': 'XL',
  'astralis': 'AST',
  'cloud9': 'C9',
  'c9': 'C9',
  'team liquid': 'TL',
  'tl': 'TL',
  'liquid': 'TL',
  '100 thieves': '100T',
  '100t': '100T',
  'evil geniuses': 'EG',
  'eg': 'EG',
  'flyquest': 'FLY',
  'fly': 'FLY',

  // ========== CS2 ==========
  'natus vincere': 'NAVI',
  'navi': 'NAVI',
  'faze clan': 'FaZe',
  'faze': 'FaZe',
  'heroic': 'Heroic',
  'ence': 'ENCE',
  'mouz': 'MOUZ',
  'mousesports': 'MOUZ',
  'virtus.pro': 'VP',
  'vp': 'VP',
  'team spirit': 'Spirit',
  'spirit': 'Spirit',
  'outsiders': 'Outsiders',
  'complexity': 'COL',
  'col': 'COL',
  'big': 'BIG',
  'eternal fire': 'EF',
  'monte': 'Monte',
  'apeks': 'Apeks',
  'imperial': 'Imperial',
  'the mongolz': 'MGL',
  'pain gaming': 'paiN',
  'pain': 'paiN',

  // ========== Valorant ==========
  'sentinels': 'SEN',
  'sen': 'SEN',
  'loud': 'LOUD',
  'paper rex': 'PRX',
  'prx': 'PRX',
  'nrg esports': 'NRG',
  'nrg': 'NRG',
  'leviatán': 'LEV',
  'lev': 'LEV',
  'fut esports': 'FUT',
  'fut': 'FUT',
  'th': 'TH',
  'kr esports': 'KRU',
  'kru': 'KRU',
  'global esports': 'GE',
  'ge': 'GE',
  'trace esports': 'TE',
  'te': 'TE',

  // ========== Dota 2 ==========
  'tundra esports': 'Tundra',
  'tundra': 'Tundra',
  'og': 'OG',
  'psg.lgd': 'LGD',
  'lgd': 'LGD',
  'lgd gaming': 'LGD',
  'gaimin gladiators': 'GG',
  'gg': 'GG',
  '9pandas': '9P',
  '9p': '9P',
  'beastcoast': 'BC',
  'bc': 'BC',
  'entity': 'Entity',
  'talon esports': 'TLN',
  'tln': 'TLN',
  'xtreme gaming': 'XG',
  'xg': 'XG',
  'azure ray': 'AR',
  'ar': 'AR',
  'quest esports': 'Quest',
  'betboom team': 'BB',
  'aurora': 'Aurora',
  'zero tenacity': 'ZT',
  'avulus': 'AVULUS',
}

// 兼容旧 API：保留原始大小写 key 映射
export const esportsTeamsZh: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const [key, value] of Object.entries(esportsTeamsMap)) {
    map[key] = value
  }
  return map
})()

// 自动反转生成缩写 -> 全名映射
export const esportsTeamsEn: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  // 使用 esportsTeamsMap 中较长的 key 作为全名
  for (const [key, value] of Object.entries(esportsTeamsMap)) {
    if (!map[value] || key.length > map[value].length) {
      map[value] = key
    }
  }
  return map
})()

// 翻译函数（支持模糊匹配）
export function translateTeamName(teamName: string, locale: 'zh' | 'en', sportType: 'football' | 'esports' | 'nba'): string {
  if (sportType === 'nba') return teamName

  if (sportType === 'football') {
    if (locale === 'zh') {
      return footballTeamsZh[teamName] || teamName
    } else {
      return footballTeamsEn[teamName] || teamName
    }
  } else {
    // 电竞：使用 lowercase 模糊匹配
    const normalized = teamName.toLowerCase().trim()
    if (locale === 'zh') {
      return esportsTeamsMap[normalized] || esportsTeamsZh[teamName] || teamName
    } else {
      // 英文模式下，如果有缩写映射就用缩写对应的全名，否则原样返回
      const abbr = esportsTeamsMap[normalized]
      if (abbr) {
        return esportsTeamsEn[abbr] || teamName
      }
      return esportsTeamsEn[teamName] || teamName
    }
  }
}

// 获取英文队名（用于 API 查询）
export function getEnglishTeamName(teamName: string, sportType: 'football' | 'esports'): string {
  if (sportType === 'football') {
    if (footballTeamsZh[teamName]) return teamName
    return footballTeamsEn[teamName] || teamName
  } else {
    const normalized = teamName.toLowerCase().trim()
    const abbr = esportsTeamsMap[normalized]
    if (abbr) {
      return esportsTeamsEn[abbr] || teamName
    }
    if (esportsTeamsZh[teamName]) return teamName
    return esportsTeamsEn[teamName] || teamName
  }
}
