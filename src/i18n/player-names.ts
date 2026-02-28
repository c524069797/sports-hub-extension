// NBA 球员英文名 → 中文名映射
// 覆盖 2024-2025 赛季所有 30 支球队主力及知名球员
// 格式：'English Name': '中文名'
// 名称匹配使用 firstName + familyName 拼接

export const NBA_PLAYER_NAMES_CN: Record<string, string> = {
  // ===== 东部联盟 =====

  // 波士顿凯尔特人
  'Jayson Tatum': '杰森·塔图姆',
  'Jaylen Brown': '杰伦·布朗',
  'Kristaps Porzingis': '克里斯塔普斯·波尔津吉斯',
  'Derrick White': '德里克·怀特',
  'Jrue Holiday': '朱·霍勒迪',
  'Al Horford': '阿尔·霍福德',
  'Payton Pritchard': '佩顿·普里查德',
  'Sam Hauser': '萨姆·豪瑟',
  'Luke Kornet': '卢克·科内特',
  'Neemias Queta': '内米亚斯·奎塔',

  // 纽约尼克斯
  'Jalen Brunson': '杰伦·布伦森',
  'Karl-Anthony Towns': '卡尔-安东尼·唐斯',
  'Mikal Bridges': '米卡尔·布里奇斯',
  'OG Anunoby': 'OG·阿努诺比',
  'Josh Hart': '乔什·哈特',
  'Miles McBride': '迈尔斯·麦克布莱德',
  'Mitchell Robinson': '米切尔·罗宾逊',
  'Precious Achiuwa': '普雷舍斯·阿丘瓦',
  'Cameron Payne': '卡梅伦·佩恩',

  // 密尔沃基雄鹿
  'Giannis Antetokounmpo': '扬尼斯·安特托昆博',
  'Damian Lillard': '达米安·利拉德',
  'Khris Middleton': '克里斯·米德尔顿',
  'Brook Lopez': '布鲁克·洛佩兹',
  'Bobby Portis': '鲍比·波蒂斯',
  'Pat Connaughton': '帕特·康诺顿',
  'Gary Trent Jr.': '加里·特伦特二世',
  'Andre Jackson Jr.': '安德烈·杰克逊二世',
  'Taurean Prince': '陶里安·普林斯',

  // 克利夫兰骑士
  'Donovan Mitchell': '多诺万·米切尔',
  'Darius Garland': '达里厄斯·加兰',
  'Evan Mobley': '埃文·莫布里',
  'Jarrett Allen': '贾瑞特·艾伦',
  'Max Strus': '马克斯·斯特鲁斯',
  'Caris LeVert': '卡里斯·勒韦尔',
  'Isaac Okoro': '艾萨克·奥科罗',
  'Sam Merrill': '萨姆·梅里尔',
  'Dennis Schröder': '丹尼斯·施罗德',
  'James Harden': '詹姆斯·哈登',
  'Jaylon Tyson': '杰伦·泰森',
  'Larry Nance Jr.': '拉里·南斯二世',
  'Craig Porter Jr.': '克雷格·波特二世',
  'Thomas Bryant': '托马斯·布莱恩特',
  'Keon Ellis': '基恩·艾利斯',

  // 奥兰多魔术
  'Paolo Banchero': '保罗·班凯罗',
  'Franz Wagner': '弗朗茨·瓦格纳',
  'Jalen Suggs': '杰伦·萨格斯',
  'Wendell Carter Jr.': '温德尔·卡特二世',
  'Cole Anthony': '科尔·安东尼',
  'Moritz Wagner': '莫里茨·瓦格纳',
  'Jonathan Isaac': '乔纳森·艾萨克',
  'Gary Harris': '加里·哈里斯',
  'Kentavious Caldwell-Pope': '肯塔维奥斯·考德威尔-波普',

  // 费城76人
  'Joel Embiid': '乔尔·恩比德',
  'Tyrese Maxey': '泰雷斯·马克西',
  'Paul George': '保罗·乔治',
  'Kelly Oubre Jr.': '凯利·乌布雷二世',
  'Kyle Lowry': '凯尔·洛瑞',
  'Andre Drummond': '安德烈·德拉蒙德',
  'Caleb Martin': '凯勒布·马丁',
  'Eric Gordon': '埃里克·戈登',
  'Guerschon Yabusele': '格尔雄·亚布塞莱',

  // 印第安纳步行者
  'Tyrese Haliburton': '泰雷斯·哈利伯顿',
  'Pascal Siakam': '帕斯卡尔·西亚卡姆',
  'Myles Turner': '迈尔斯·特纳',
  'Andrew Nembhard': '安德鲁·内姆哈德',
  'Bennedict Mathurin': '贝内迪克特·马瑟林',
  'Aaron Nesmith': '阿隆·内史密斯',
  'TJ McConnell': 'TJ·麦康奈尔',
  'Obi Toppin': '奥比·托平',

  // 迈阿密热火
  'Jimmy Butler': '吉米·巴特勒',
  'Bam Adebayo': '巴姆·阿德巴约',
  'Tyler Herro': '泰勒·希罗',
  'Terry Rozier': '特里·罗齐尔',
  'Jaime Jaquez Jr.': '海梅·哈克斯二世',
  'Nikola Jovic': '尼古拉·约维奇',
  'Duncan Robinson': '邓肯·罗宾逊',
  'Haywood Highsmith': '海伍德·海史密斯',
  'Kevin Love': '凯文·乐福',

  // 芝加哥公牛
  'Zach LaVine': '扎克·拉文',
  'DeMar DeRozan': '德马尔·德罗赞',
  'Nikola Vucevic': '尼古拉·武切维奇',
  'Coby White': '科比·怀特',
  'Patrick Williams': '帕特里克·威廉姆斯',
  'Alex Caruso': '亚历克斯·卡鲁索',
  'Ayo Dosunmu': '阿约·多桑木',
  'Josh Giddey': '乔什·吉迪',
  'Lonzo Ball': '朗佐·鲍尔',

  // 亚特兰大老鹰
  'Trae Young': '特雷·杨',
  'Dejounte Murray': '德章泰·默里',
  'Jalen Johnson': '杰伦·约翰逊',
  'De\'Andre Hunter': '德安德烈·亨特',
  'Clint Capela': '克林特·卡佩拉',
  'Bogdan Bogdanovic': '博格丹·博格达诺维奇',
  'Onyeka Okongwu': '奥尼卡·奥孔武',
  'Dyson Daniels': '戴森·丹尼尔斯',

  // 布鲁克林篮网
  'Cam Thomas': '卡姆·托马斯',
  'Dennis Smith Jr.': '丹尼斯·史密斯二世',
  'Nic Claxton': '尼克·克拉克斯顿',
  'Dorian Finney-Smith': '多里安·芬尼-史密斯',
  'Ben Simmons': '本·西蒙斯',
  'Day\'Ron Sharpe': '戴朗·夏普',
  'Cameron Johnson': '卡梅伦·约翰逊',

  // 多伦多猛龙
  'Scottie Barnes': '斯科蒂·巴恩斯',
  'RJ Barrett': 'RJ·巴雷特',
  'Immanuel Quickley': '伊曼纽尔·奎克利',
  'Jakob Poeltl': '雅各布·珀尔特尔',
  'Gradey Dick': '格雷迪·迪克',
  'Chris Boucher': '克里斯·布歇',
  'Kelly Olynyk': '凯利·奥利尼克',

  // 夏洛特黄蜂
  'LaMelo Ball': '拉梅洛·鲍尔',
  'Brandon Miller': '布兰登·米勒',
  'Miles Bridges': '迈尔斯·布里奇斯',
  'Mark Williams': '马克·威廉姆斯',
  'Nick Richards': '尼克·理查兹',
  'Grant Williams': '格兰特·威廉姆斯',
  'Tre Mann': '特雷·曼恩',

  // 底特律活塞
  'Cade Cunningham': '凯德·坎宁安',
  'Jalen Duren': '杰伦·杜伦',
  'Ausar Thompson': '奥萨尔·汤普森',
  'Tobias Harris': '托比亚斯·哈里斯',
  'Marcus Sasser': '马库斯·萨瑟',
  'Kevin Huerter': '凯文·休尔特',
  'Paul Reed': '保罗·里德',
  'Ronald Holland II': '罗纳德·霍兰德二世',
  'Isaiah Stewart': '以赛亚·斯图尔特',

  // 华盛顿奇才
  'Kyle Kuzma': '凯尔·库兹马',
  'Jordan Poole': '乔丹·普尔',
  'Deni Avdija': '德尼·阿夫迪亚',
  'Tyus Jones': '泰厄斯·琼斯',
  'Daniel Gafford': '丹尼尔·加福德',
  'Bilal Coulibaly': '比拉尔·库利巴利',
  'Alex Sarr': '亚历克斯·萨尔',

  // ===== 西部联盟 =====

  // 俄克拉荷马城雷霆
  'Shai Gilgeous-Alexander': '谢伊·吉尔杰斯-亚历山大',
  'Jalen Williams': '杰伦·威廉姆斯',
  'Chet Holmgren': '切特·霍姆格伦',
  'Luguentz Dort': '卢根茨·多特',
  'Isaiah Hartenstein': '以赛亚·哈滕施泰因',
  'Aaron Wiggins': '阿隆·威金斯',
  'Alex Caruso': '亚历克斯·卡鲁索',
  'Kenrich Williams': '肯里奇·威廉姆斯',
  'Isaiah Joe': '以赛亚·乔',

  // 达拉斯独行侠
  'Luka Doncic': '卢卡·东契奇',
  'Kyrie Irving': '凯里·欧文',
  'PJ Washington': 'PJ·华盛顿',
  'Dereck Lively II': '德里克·莱夫利二世',
  'Daniel Gafford': '丹尼尔·加福德',
  'Naji Marshall': '纳吉·马歇尔',
  'Klay Thompson': '克莱·汤普森',
  'Quentin Grimes': '昆廷·格莱姆斯',
  'Spencer Dinwiddie': '斯潘塞·丁威迪',

  // 丹佛掘金
  'Nikola Jokic': '尼古拉·约基奇',
  'Jamal Murray': '贾马尔·穆雷',
  'Michael Porter Jr.': '迈克尔·波特二世',
  'Aaron Gordon': '阿隆·戈登',
  'Christian Braun': '克里斯蒂安·布劳恩',
  'Kentavious Caldwell-Pope': '肯塔维奥斯·考德威尔-波普',
  'Reggie Jackson': '雷吉·杰克逊',
  'Peyton Watson': '佩顿·沃森',
  'DeAndre Jordan': '德安德烈·乔丹',
  'Russell Westbrook': '拉塞尔·威斯布鲁克',
  'Dario Saric': '达里奥·萨里奇',
  'Julian Strawther': '朱利安·斯特劳瑟',

  // 明尼苏达森林狼
  'Anthony Edwards': '安东尼·爱德华兹',
  'Karl-Anthony Towns': '卡尔-安东尼·唐斯',
  'Rudy Gobert': '鲁迪·戈贝尔',
  'Mike Conley': '迈克·康利',
  'Jaden McDaniels': '杰登·麦克丹尼尔斯',
  'Naz Reid': '纳兹·里德',
  'Nickeil Alexander-Walker': '尼基尔·亚历山大-沃克',
  'Julius Randle': '朱利叶斯·兰德尔',
  'Donte DiVincenzo': '唐特·迪温琴佐',

  // 洛杉矶湖人
  'LeBron James': '勒布朗·詹姆斯',
  'Anthony Davis': '安东尼·戴维斯',
  'Austin Reaves': '奥斯汀·里夫斯',
  'D\'Angelo Russell': '德安杰洛·拉塞尔',
  'Rui Hachimura': '八村塁',
  'Gabe Vincent': '加布·文森特',
  'Jaxson Hayes': '贾克森·海斯',
  'Max Christie': '马克斯·克里斯蒂',
  'Jarred Vanderbilt': '贾雷德·范德比尔特',
  'Dalton Knecht': '道尔顿·克内希特',

  // 洛杉矶快船
  'James Harden': '詹姆斯·哈登',
  'Kawhi Leonard': '科怀·伦纳德',
  'Ivica Zubac': '伊维察·祖巴茨',
  'Norman Powell': '诺曼·鲍威尔',
  'Terance Mann': '特伦斯·曼恩',
  'Derrick Jones Jr.': '德里克·琼斯二世',
  'Bones Hyland': '博恩斯·海兰德',
  'Amir Coffey': '阿米尔·科菲',

  // 菲尼克斯太阳
  'Kevin Durant': '凯文·杜兰特',
  'Devin Booker': '德文·布克',
  'Bradley Beal': '布拉德利·比尔',
  'Jusuf Nurkic': '尤素夫·努尔基奇',
  'Grayson Allen': '格雷森·艾伦',
  'Royce O\'Neale': '罗伊斯·奥尼尔',
  'Bol Bol': '博尔·博尔',
  'Eric Gordon': '埃里克·戈登',
  'Nick Smith Jr.': '尼克·史密斯二世',

  // 萨克拉门托国王
  'De\'Aaron Fox': '德阿龙·福克斯',
  'Domantas Sabonis': '多曼塔斯·萨博尼斯',
  'DeMar DeRozan': '德马尔·德罗赞',
  'Keegan Murray': '基根·穆雷',
  'Malik Monk': '马利克·蒙克',
  'Kevin Huerter': '凯文·休尔特',
  'Harrison Barnes': '哈里森·巴恩斯',
  'Trey Lyles': '特雷·莱尔斯',

  // 金州勇士
  'Stephen Curry': '斯蒂芬·库里',
  'Draymond Green': '德雷蒙德·格林',
  'Andrew Wiggins': '安德鲁·威金斯',
  'Jonathan Kuminga': '乔纳森·库明加',
  'Kevon Looney': '凯文·鲁尼',
  'Brandin Podziemski': '布兰丁·波杰姆斯基',
  'Buddy Hield': '巴迪·希尔德',
  'Gary Payton II': '加里·佩顿二世',
  'Moses Moody': '摩西·穆迪',
  'Trayce Jackson-Davis': '特雷斯·杰克逊-戴维斯',

  // 孟菲斯灰熊
  'Ja Morant': '贾·莫兰特',
  'Desmond Bane': '德斯蒙德·贝恩',
  'Marcus Smart': '马库斯·斯马特',
  'Jaren Jackson Jr.': '贾伦·杰克逊二世',
  'Brandon Clarke': '布兰登·克拉克',
  'Luke Kennard': '卢克·肯纳德',
  'Santi Aldama': '桑蒂·阿尔达马',
  'GG Jackson II': 'GG·杰克逊二世',
  'Zach Edey': '扎克·埃迪',
  'Scotty Pippen Jr.': '斯科蒂·皮蓬二世',
  'Jake LaRavia': '杰克·拉拉维亚',
  'Jay Huff': '杰伊·赫夫',

  // 新奥尔良鹈鹕
  'Zion Williamson': '锡安·威廉姆森',
  'Brandon Ingram': '布兰登·英格拉姆',
  'CJ McCollum': 'CJ·麦科勒姆',
  'Herbert Jones': '赫伯特·琼斯',
  'Jonas Valanciunas': '乔纳斯·瓦兰丘纳斯',
  'Trey Murphy III': '特雷·墨菲三世',
  'Jose Alvarado': '何塞·阿尔瓦拉多',
  'Dejounte Murray': '德章泰·默里',

  // 休斯顿火箭
  'Jalen Green': '杰伦·格林',
  'Alperen Sengun': '阿尔佩伦·森根',
  'Jabari Smith Jr.': '贾巴里·史密斯二世',
  'Fred VanVleet': '弗雷德·范弗利特',
  'Dillon Brooks': '迪龙·布鲁克斯',
  'Amen Thompson': '阿门·汤普森',
  'Tari Eason': '塔里·伊森',
  'Cam Whitmore': '卡姆·惠特莫尔',
  'Reed Sheppard': '里德·谢帕德',

  // 圣安东尼奥马刺
  'Victor Wembanyama': '维克托·文班亚马',
  'Devin Vassell': '德文·瓦塞尔',
  'Jeremy Sochan': '杰里米·索汉',
  'Keldon Johnson': '凯尔登·约翰逊',
  'Tre Jones': '特雷·琼斯',
  'Zach Collins': '扎克·柯林斯',
  'Malaki Branham': '马拉基·布拉纳姆',
  'Doug McDermott': '道格·麦克德莫特',
  'Chris Paul': '克里斯·保罗',
  'Harrison Barnes': '哈里森·巴恩斯',
  'Stephon Castle': '斯蒂芬·卡斯尔',

  // 波特兰开拓者
  'Anfernee Simons': '安弗尼·西蒙斯',
  'Scoot Henderson': '斯库特·亨德森',
  'Shaedon Sharpe': '谢登·夏普',
  'Jerami Grant': '杰拉米·格兰特',
  'Deandre Ayton': '德安德烈·艾顿',
  'Robert Williams III': '罗伯特·威廉姆斯三世',
  'Matisse Thybulle': '马蒂斯·塞布尔',
  'Toumani Camara': '图马尼·卡马拉',
  'Donovan Clingan': '多诺万·克林根',

  // 犹他爵士
  'Lauri Markkanen': '劳里·马尔卡宁',
  'Collin Sexton': '科林·塞克斯顿',
  'Jordan Clarkson': '乔丹·克拉克森',
  'John Collins': '约翰·柯林斯',
  'Walker Kessler': '沃克·凯斯勒',
  'Keyonte George': '基昂特·乔治',
  'Taylor Hendricks': '泰勒·亨德里克斯',
}

// 足球球员英文名 → 中文名映射
// 覆盖五大联赛主要球星
export const FOOTBALL_PLAYER_NAMES_CN: Record<string, string> = {
  // ===== 英超 =====
  // 曼城
  'Erling Haaland': '厄林·哈兰德',
  'Kevin De Bruyne': '凯文·德布劳内',
  'Phil Foden': '菲尔·福登',
  'Bernardo Silva': '贝尔纳多·席尔瓦',
  'Rodri': '罗德里',
  'Jack Grealish': '杰克·格里利什',
  'Ederson': '埃德森',
  'Ruben Dias': '鲁本·迪亚斯',
  'John Stones': '约翰·斯通斯',
  'Kyle Walker': '凯尔·沃克',
  'Josko Gvardiol': '约什科·瓜尔迪奥尔',
  'Jeremy Doku': '杰里米·多库',
  'Mateo Kovacic': '马特奥·科瓦契奇',
  'Savinho': '萨维尼奥',

  // 阿森纳
  'Bukayo Saka': '布卡约·萨卡',
  'Martin Odegaard': '马丁·厄德高',
  'Declan Rice': '德克兰·赖斯',
  'Gabriel Jesus': '加布里埃尔·热苏斯',
  'Kai Havertz': '凯·哈弗茨',
  'Gabriel Martinelli': '加布里埃尔·马丁内利',
  'William Saliba': '威廉·萨利巴',
  'Gabriel Magalhaes': '加布里埃尔·马加良斯',
  'David Raya': '大卫·拉亚',
  'Ben White': '本·怀特',
  'Jurrien Timber': '尤里恩·廷贝尔',
  'Leandro Trossard': '莱昂德罗·特罗萨德',

  // 利物浦
  'Mohamed Salah': '穆罕默德·萨拉赫',
  'Virgil van Dijk': '维吉尔·范戴克',
  'Alisson': '阿利松',
  'Trent Alexander-Arnold': '特伦特·亚历山大-阿诺德',
  'Darwin Nunez': '达尔文·努涅斯',
  'Luis Diaz': '路易斯·迪亚斯',
  'Diogo Jota': '迪奥戈·若塔',
  'Dominik Szoboszlai': '多米尼克·索博斯洛伊',
  'Alexis Mac Allister': '阿莱克西斯·麦卡利斯特',
  'Ibrahima Konate': '伊布拉希马·科纳特',
  'Andrew Robertson': '安德鲁·罗伯逊',
  'Ryan Gravenberch': '瑞安·格拉芬贝赫',
  'Cody Gakpo': '科迪·加克波',
  'Curtis Jones': '柯蒂斯·琼斯',

  // 曼联
  'Marcus Rashford': '马库斯·拉什福德',
  'Bruno Fernandes': '布鲁诺·费尔南德斯',
  'Casemiro': '卡塞米罗',
  'Rasmus Hojlund': '拉斯穆斯·霍伊伦',
  'Kobbie Mainoo': '科比·梅努',
  'Andre Onana': '安德烈·奥纳纳',
  'Lisandro Martinez': '利桑德罗·马丁内斯',
  'Luke Shaw': '卢克·肖',
  'Diogo Dalot': '迪奥戈·达洛特',
  'Alejandro Garnacho': '亚历杭德罗·加纳乔',
  'Mason Mount': '梅森·芒特',
  'Matthijs de Ligt': '马泰斯·德利赫特',
  'Joshua Zirkzee': '约书亚·齐尔克泽',
  'Manuel Ugarte': '曼努埃尔·乌加特',
  'Noussair Mazraoui': '努赛尔·马兹拉维',

  // 切尔西
  'Cole Palmer': '科尔·帕尔默',
  'Nicolas Jackson': '尼古拉斯·杰克逊',
  'Enzo Fernandez': '恩佐·费尔南德斯',
  'Moises Caicedo': '莫伊塞斯·凯塞多',
  'Reece James': '里斯·詹姆斯',
  'Noni Madueke': '诺尼·马杜埃克',
  'Robert Sanchez': '罗伯特·桑切斯',
  'Levi Colwill': '利维·科尔威尔',
  'Pedro Neto': '佩德罗·内托',
  'Jadon Sancho': '杰登·桑乔',
  'Marc Cucurella': '马克·库库雷利亚',
  'Wesley Fofana': '韦斯利·福法纳',

  // 热刺
  'Son Heung-min': '孙兴慜',
  'James Maddison': '詹姆斯·麦迪逊',
  'Cristian Romero': '克里斯蒂安·罗梅罗',
  'Micky van de Ven': '米奇·范德文',
  'Guglielmo Vicario': '古列尔莫·维卡里奥',
  'Dejan Kulusevski': '德扬·库卢塞夫斯基',
  'Richarlison': '理查利森',
  'Brennan Johnson': '布伦南·约翰逊',
  'Yves Bissouma': '伊夫·比苏马',
  'Dominic Solanke': '多米尼克·索兰克',

  // ===== 西甲 =====
  // 皇马
  'Kylian Mbappe': '基利安·姆巴佩',
  'Vinicius Jr.': '维尼修斯',
  'Jude Bellingham': '裘德·贝林厄姆',
  'Toni Kroos': '托尼·克罗斯',
  'Luka Modric': '卢卡·莫德里奇',
  'Federico Valverde': '费德里科·巴尔韦德',
  'Thibaut Courtois': '蒂博·库尔图瓦',
  'Antonio Rudiger': '安东尼奥·吕迪格',
  'David Alaba': '大卫·阿拉巴',
  'Dani Carvajal': '达尼·卡瓦哈尔',
  'Eduardo Camavinga': '爱德华多·卡马文加',
  'Aurelien Tchouameni': '奥雷利安·楚阿梅尼',
  'Rodrygo': '罗德里戈',
  'Endrick': '恩德里克',
  'Arda Guler': '阿尔达·居莱尔',

  // 巴萨
  'Robert Lewandowski': '罗伯特·莱万多夫斯基',
  'Lamine Yamal': '拉明·亚马尔',
  'Pedri': '佩德里',
  'Gavi': '加维',
  'Raphinha': '拉菲尼亚',
  'Frenkie de Jong': '弗伦基·德容',
  'Marc-Andre ter Stegen': '马克-安德烈·特尔施特根',
  'Ronald Araujo': '罗纳德·阿劳霍',
  'Jules Kounde': '朱尔斯·孔德',
  'Alejandro Balde': '亚历杭德罗·巴尔德',
  'Dani Olmo': '达尼·奥尔莫',
  'Pau Cubarsi': '保·库巴尔西',
  'Fermin Lopez': '费尔明·洛佩斯',

  // 马竞
  'Antoine Griezmann': '安托万·格列兹曼',
  'Alvaro Morata': '阿尔瓦罗·莫拉塔',
  'Jan Oblak': '扬·奥布拉克',
  'Marcos Llorente': '马科斯·略伦特',
  'Koke': '科克',
  'Angel Correa': '安赫尔·科雷亚',
  'Jose Gimenez': '何塞·希门尼斯',
  'Julian Alvarez': '胡利安·阿尔瓦雷斯',
  'Alexander Sorloth': '亚历山大·索尔洛特',
  'Conor Gallagher': '康纳·加拉格尔',

  // ===== 德甲 =====
  // 拜仁
  'Harry Kane': '哈里·凯恩',
  'Jamal Musiala': '贾马尔·穆西亚拉',
  'Leroy Sane': '勒罗伊·萨内',
  'Thomas Muller': '托马斯·穆勒',
  'Joshua Kimmich': '约书亚·基米希',
  'Leon Goretzka': '莱昂·格雷茨卡',
  'Serge Gnabry': '塞尔日·格纳布里',
  'Dayot Upamecano': '达约·乌帕梅卡诺',
  'Kim Min-jae': '金玟哉',
  'Alphonso Davies': '阿方索·戴维斯',
  'Manuel Neuer': '曼努埃尔·诺伊尔',
  'Michael Olise': '迈克尔·奥利塞',

  // 多特蒙德
  'Marcel Sabitzer': '马塞尔·扎比策',
  'Julian Brandt': '尤利安·布兰特',
  'Karim Adeyemi': '卡里姆·阿德耶米',
  'Nico Schlotterbeck': '尼科·施洛特贝克',
  'Gregor Kobel': '格雷戈尔·科贝尔',
  'Emre Can': '埃姆雷·詹',
  'Donyell Malen': '多尼尔·马伦',
  'Serhou Guirassy': '塞尔胡·吉拉西',
  'Jamie Gittens': '杰米·吉滕斯',

  // 勒沃库森
  'Florian Wirtz': '弗洛里安·维尔茨',
  'Granit Xhaka': '格拉尼特·扎卡',
  'Jeremie Frimpong': '杰里米·弗林蓬',
  'Victor Boniface': '维克托·博尼法斯',
  'Alejandro Grimaldo': '亚历杭德罗·格里马尔多',
  'Jonathan Tah': '约纳坦·塔',
  'Patrik Schick': '帕特里克·希克',
  'Exequiel Palacios': '埃塞基尔·帕拉西奥斯',

  // ===== 意甲 =====
  // 国米
  'Lautaro Martinez': '劳塔罗·马丁内斯',
  'Marcus Thuram': '马库斯·图拉姆',
  'Nicolo Barella': '尼科洛·巴雷拉',
  'Hakan Calhanoglu': '哈坎·恰尔汗奥卢',
  'Alessandro Bastoni': '亚历山德罗·巴斯托尼',
  'Federico Dimarco': '费德里科·迪马尔科',
  'Yann Sommer': '扬·索默',
  'Henrikh Mkhitaryan': '亨里赫·姆希塔良',
  'Denzel Dumfries': '邓泽尔·邓弗里斯',

  // AC米兰
  'Rafael Leao': '拉斐尔·莱昂',
  'Christian Pulisic': '克里斯蒂安·普利希奇',
  'Theo Hernandez': '特奥·埃尔南德斯',
  'Mike Maignan': '迈克·梅尼昂',
  'Tijjani Reijnders': '蒂贾尼·莱因德斯',
  'Ruben Loftus-Cheek': '鲁本·洛夫图斯-奇克',
  'Samuel Chukwueze': '萨缪尔·丘夸泽',
  'Fikayo Tomori': '菲卡约·托莫里',

  // 尤文图斯
  'Dusan Vlahovic': '杜桑·弗拉霍维奇',
  'Federico Chiesa': '费德里科·基耶萨',
  'Adrien Rabiot': '阿德里安·拉比奥',
  'Bremer': '布雷默',
  'Gleison Bremer': '格莱松·布雷默',
  'Manuel Locatelli': '曼努埃尔·洛卡特利',
  'Kenan Yildiz': '凯南·于尔迪兹',
  'Timothy Weah': '蒂莫西·维阿',
  'Teun Koopmeiners': '特温·科普梅纳斯',

  // 那不勒斯
  'Victor Osimhen': '维克托·奥西门',
  'Khvicha Kvaratskhelia': '赫维恰·克瓦拉茨赫利亚',
  'Stanislav Lobotka': '斯坦尼斯拉夫·洛博特卡',
  'Giovanni Di Lorenzo': '乔万尼·迪洛伦佐',
  'Alex Meret': '亚历克斯·梅雷特',
  'Matteo Politano': '马特奥·波利塔诺',
  'Romelu Lukaku': '罗梅卢·卢卡库',
  'Scott McTominay': '斯科特·麦克托米奈',

  // ===== 法甲 =====
  // 巴黎圣日耳曼
  'Ousmane Dembele': '奥斯曼·登贝莱',
  'Achraf Hakimi': '阿什拉夫·哈基米',
  'Marquinhos': '马基尼奥斯',
  'Gianluigi Donnarumma': '詹路易吉·多纳鲁马',
  'Vitinha': '维蒂尼亚',
  'Randal Kolo Muani': '兰达尔·科洛·穆阿尼',
  'Bradley Barcola': '布拉德利·巴尔科拉',
  'Warren Zaire-Emery': '沃伦·扎伊尔-埃默里',
  'Fabian Ruiz': '法比安·鲁伊斯',
  'Nuno Mendes': '努诺·门德斯',

  // ===== 传奇球员 =====
  'Lionel Messi': '利昂内尔·梅西',
  'Cristiano Ronaldo': '克里斯蒂亚诺·罗纳尔多',
  'Neymar': '内马尔',
}
