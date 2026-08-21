/**
 * i18n.js -- Internationalization module for Tianji (Chinese/English)
 *
 * IIFE that exposes I18n with:
 *   t(key)       - translate a key to current language
 *   setLang(l)   - switch language ('zh' or 'en')
 *   getLang()    - get current language code
 *   toggle()     - flip between zh/en, return new code
 *   translations - raw translation objects (for iteration)
 */
const I18n = (function () {
  'use strict';

  let currentLang = 'vi';

  const translations = {
    /* ================================================================ */
    /*  CHINESE                                                         */
    /* ================================================================ */
    zh: {
      // -- App chrome --
      appTitle: '天机',
      appSubtitle: '中国传统玄学计算',

      // -- Tabs --
      tabBazi: '八字排盘',
      tabLiuyao: '六爻占卜',
      tabZiwei: '紫微斗数',

      // -- BaZi general --
      birthDate: '出生日期',
      birthTime: '出生时辰',
      gender: '性别',
      male: '男',
      female: '女',
      yearPillar: '年柱',
      monthPillar: '月柱',
      dayPillar: '日柱',
      hourPillar: '时柱',
      heavenlyStem: '天干',
      earthlyBranch: '地支',
      dayMaster: '日主',
      tenGods: '十神',
      fiveElements: '五行分析',
      dayMasterStrength: '日主强弱',
      luckPillars: '大运',
      flowYears: '流年',
      relationships: '刑冲合害',
      strong: '身强',
      weak: '身弱',
      neutral: '中和',
      hiddenStems: '藏干',
      nayin: '纳音',
      elementCount: '五行统计',

      // -- Five Elements --
      wood: '木',
      fire: '火',
      earth: '土',
      metal: '金',
      water: '水',

      // -- Heavenly Stems --
      stemJia: '甲', stemYi: '乙', stemBing: '丙', stemDing: '丁',
      stemWu: '戊', stemJi: '己', stemGeng: '庚', stemXin: '辛',
      stemRen: '壬', stemGui: '癸',

      // -- Earthly Branches --
      branchZi: '子', branchChou: '丑', branchYin: '寅', branchMao: '卯',
      branchChen: '辰', branchSi: '巳', branchWu2: '午', branchWei: '未',
      branchShen: '申', branchYou: '酉', branchXu: '戌', branchHai: '亥',

      // -- Zodiac --
      rat: '鼠', ox: '牛', tiger: '虎', rabbit: '兔',
      dragon: '龙', snake: '蛇', horse: '马', goat: '羊',
      monkey: '猴', rooster: '鸡', dog: '狗', pig: '猪',

      // -- Ten Gods --
      bijian: '比肩', jiecai: '劫财', shishen: '食神', shangguan: '伤官',
      piancai: '偏财', zhengcai: '正财', qisha: '七杀', zhengguan: '正官',
      pianyin: '偏印', zhengyin: '正印',

      // -- Polarity --
      yang: '阳',
      yin: '阴',

      // -- Shi-chen (double-hour) names --
      shiChen0: '子时 (23:00-01:00)',
      shiChen1: '丑时 (01:00-03:00)',
      shiChen2: '寅时 (03:00-05:00)',
      shiChen3: '卯时 (05:00-07:00)',
      shiChen4: '辰时 (07:00-09:00)',
      shiChen5: '巳时 (09:00-11:00)',
      shiChen6: '午时 (11:00-13:00)',
      shiChen7: '未时 (13:00-15:00)',
      shiChen8: '申时 (15:00-17:00)',
      shiChen9: '酉时 (17:00-19:00)',
      shiChen10: '戌时 (19:00-21:00)',
      shiChen11: '亥时 (21:00-23:00)',

      // -- Liu Yao --
      castMethod: '起卦方法',
      timeCast: '时间起卦',
      numberCast: '数字起卦',
      coinCast: '铜钱摇卦',
      primaryHex: '本卦',
      changedHex: '变卦',
      movingLines: '动爻',
      worldLine: '世爻',
      responseLine: '应爻',
      sixRelatives: '六亲',
      sixGods: '六神',
      castNow: '起卦',
      hexagram: '卦象',
      hexDescription: '卦辞',
      linePosition: '爻位',
      lineYang: '阳爻',
      lineYin: '阴爻',
      movingMark: '动',
      num1Label: '数字一',
      num2Label: '数字二',
      num3Label: '数字三（可选）',
      noMovingLines: '无动爻',

      // -- Six Gods detail --
      qinglong: '青龙',
      zhuque: '朱雀',
      gouchen: '勾陈',
      tengshe: '腾蛇',
      baihu: '白虎',
      xuanwu: '玄武',

      // -- Six Relatives detail --
      xiongdi: '兄弟',
      zisun: '子孙',
      fumu: '父母',
      qicai: '妻财',
      guangui: '官鬼',

      // -- Zi Wei Dou Shu --
      lunarDate: '农历日期',
      lunarYear: '年',
      lunarMonth: '月',
      lunarDay: '日',
      palace: '宫',
      stars: '星曜',
      convertSolar: '从公历转换',

      // -- 12 Palace names --
      palaceLife: '命宫',
      palaceSiblings: '兄弟宫',
      palaceSpouse: '夫妻宫',
      palaceChildren: '子女宫',
      palaceWealth: '财帛宫',
      palaceHealth: '疾厄宫',
      palaceTravel: '迁移宫',
      palaceServants: '奴仆宫',
      palaceCareer: '官禄宫',
      palaceProperty: '田宅宫',
      palaceFortune: '福德宫',
      palaceParents: '父母宫',

      // -- Palace meanings (tooltip) --
      palaceLifeDesc: '命主本人，性格、外貌、整体运势',
      palaceSiblingsDesc: '兄弟姐妹、朋友、合作关系',
      palaceSpouseDesc: '婚姻、感情、配偶',
      palaceChildrenDesc: '子女、下属、创意',
      palaceWealthDesc: '财运、理财、金钱',
      palaceHealthDesc: '健康、疾病、意外',
      palaceTravelDesc: '出行、搬迁、外在表现',
      palaceServantsDesc: '朋友、下属、人际关系',
      palaceCareerDesc: '事业、名誉、官职',
      palacePropertyDesc: '房产、家宅、家庭环境',
      palaceFortuneDesc: '福气、精神生活、享受',
      palaceParentsDesc: '父母、上司、长辈',

      // -- Major stars --
      starZiwei: '紫微', starTianji: '天机', starTaiyang: '太阳',
      starWuqu: '武曲', starTiantong: '天同', starLianzhen: '廉贞',
      starTianfu: '天府', starTaiyin: '太阴', starTanlang: '贪狼',
      starJumen: '巨门', starTianxiang: '天相', starTianliang: '天梁',
      starQisha2: '七杀', starPojun: '破军',
      noMajorStar: '（无主星）',

      // -- Branch relationships --
      liuhe: '六合',
      sanhe: '三合',
      liuchong: '六冲',
      sanxing: '三刑',
      liuhai: '六害',

      // -- Common UI --
      calculate: '排盘',
      reset: '重置',
      share: '分享',
      copyLink: '复制链接',
      saveImage: '保存图片',
      darkTheme: '暗色主题',
      lightTheme: '亮色主题',
      language: '语言',
      privacy: '隐私声明',
      privacyText: '本工具完全在浏览器本地运行，不收集任何个人数据，不发送任何网络请求。您的出生信息仅用于本地计算，不会被存储或传输。',
      noData: '无数据',
      loading: '计算中...',
      copied: '已复制',
      sharePrompt: '分享此命盘',
      age: '岁',
      year2: '年',
      startAge: '起运年龄',
    },

    /* ================================================================ */
    /*  ENGLISH                                                         */
    /* ================================================================ */
    en: {
      appTitle: 'Tianji',
      appSubtitle: 'Chinese Metaphysics Calculator',

      tabBazi: 'BaZi (Four Pillars)',
      tabLiuyao: 'Liu Yao (I Ching)',
      tabZiwei: 'Zi Wei Dou Shu',

      birthDate: 'Birth Date',
      birthTime: 'Birth Hour',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      yearPillar: 'Year',
      monthPillar: 'Month',
      dayPillar: 'Day',
      hourPillar: 'Hour',
      heavenlyStem: 'Stem',
      earthlyBranch: 'Branch',
      dayMaster: 'Day Master',
      tenGods: 'Ten Gods',
      fiveElements: 'Five Elements',
      dayMasterStrength: 'Day Master Strength',
      luckPillars: 'Luck Pillars',
      flowYears: 'Flow Years',
      relationships: 'Relationships',
      strong: 'Strong',
      weak: 'Weak',
      neutral: 'Neutral',
      hiddenStems: 'Hidden Stems',
      nayin: 'Nayin',
      elementCount: 'Element Count',

      wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water',

      stemJia: 'Jia', stemYi: 'Yi', stemBing: 'Bing', stemDing: 'Ding',
      stemWu: 'Wu', stemJi: 'Ji', stemGeng: 'Geng', stemXin: 'Xin',
      stemRen: 'Ren', stemGui: 'Gui',

      branchZi: 'Zi', branchChou: 'Chou', branchYin: 'Yin', branchMao: 'Mao',
      branchChen: 'Chen', branchSi: 'Si', branchWu2: 'Wu', branchWei: 'Wei',
      branchShen: 'Shen', branchYou: 'You', branchXu: 'Xu', branchHai: 'Hai',

      rat: 'Rat', ox: 'Ox', tiger: 'Tiger', rabbit: 'Rabbit',
      dragon: 'Dragon', snake: 'Snake', horse: 'Horse', goat: 'Goat',
      monkey: 'Monkey', rooster: 'Rooster', dog: 'Dog', pig: 'Pig',

      bijian: 'Companion', jiecai: 'Rob Wealth', shishen: 'Eating God', shangguan: 'Hurting Officer',
      piancai: 'Indirect Wealth', zhengcai: 'Direct Wealth', qisha: 'Seven Killings', zhengguan: 'Direct Officer',
      pianyin: 'Indirect Resource', zhengyin: 'Direct Resource',

      yang: 'Yang',
      yin: 'Yin',

      shiChen0: 'Zi (23:00-01:00)',
      shiChen1: 'Chou (01:00-03:00)',
      shiChen2: 'Yin (03:00-05:00)',
      shiChen3: 'Mao (05:00-07:00)',
      shiChen4: 'Chen (07:00-09:00)',
      shiChen5: 'Si (09:00-11:00)',
      shiChen6: 'Wu (11:00-13:00)',
      shiChen7: 'Wei (13:00-15:00)',
      shiChen8: 'Shen (15:00-17:00)',
      shiChen9: 'You (17:00-19:00)',
      shiChen10: 'Xu (19:00-21:00)',
      shiChen11: 'Hai (21:00-23:00)',

      castMethod: 'Casting Method',
      timeCast: 'Time-based',
      numberCast: 'Number-based',
      coinCast: 'Coin Toss',
      primaryHex: 'Primary',
      changedHex: 'Changed',
      movingLines: 'Moving Lines',
      worldLine: 'World',
      responseLine: 'Response',
      sixRelatives: 'Six Relatives',
      sixGods: 'Six Gods',
      castNow: 'Cast',
      hexagram: 'Hexagram',
      hexDescription: 'Description',
      linePosition: 'Line',
      lineYang: 'Yang',
      lineYin: 'Yin',
      movingMark: 'Moving',
      num1Label: 'Number 1',
      num2Label: 'Number 2',
      num3Label: 'Number 3 (optional)',
      noMovingLines: 'No moving lines',

      qinglong: 'Azure Dragon',
      zhuque: 'Vermilion Bird',
      gouchen: 'Hook Snake',
      tengshe: 'Soaring Snake',
      baihu: 'White Tiger',
      xuanwu: 'Black Tortoise',

      xiongdi: 'Sibling',
      zisun: 'Offspring',
      fumu: 'Parent',
      qicai: 'Wealth',
      guangui: 'Officer',

      lunarDate: 'Lunar Date',
      lunarYear: 'Year',
      lunarMonth: 'Month',
      lunarDay: 'Day',
      palace: 'Palace',
      stars: 'Stars',
      convertSolar: 'Convert from Solar',

      palaceLife: 'Life',
      palaceSiblings: 'Siblings',
      palaceSpouse: 'Spouse',
      palaceChildren: 'Children',
      palaceWealth: 'Wealth',
      palaceHealth: 'Health',
      palaceTravel: 'Travel',
      palaceServants: 'Friends',
      palaceCareer: 'Career',
      palaceProperty: 'Property',
      palaceFortune: 'Fortune',
      palaceParents: 'Parents',

      palaceLifeDesc: 'Character, appearance, overall destiny',
      palaceSiblingsDesc: 'Siblings, friends, partnerships',
      palaceSpouseDesc: 'Marriage, romance, partner',
      palaceChildrenDesc: 'Children, subordinates, creativity',
      palaceWealthDesc: 'Finance, money, assets',
      palaceHealthDesc: 'Health, illness, accidents',
      palaceTravelDesc: 'Travel, relocation, public image',
      palaceServantsDesc: 'Friends, subordinates, social circle',
      palaceCareerDesc: 'Career, reputation, rank',
      palacePropertyDesc: 'Property, home, family environment',
      palaceFortuneDesc: 'Blessings, spiritual life, enjoyment',
      palaceParentsDesc: 'Parents, superiors, elders',

      starZiwei: 'Zi Wei', starTianji: 'Tian Ji', starTaiyang: 'Tai Yang',
      starWuqu: 'Wu Qu', starTiantong: 'Tian Tong', starLianzhen: 'Lian Zhen',
      starTianfu: 'Tian Fu', starTaiyin: 'Tai Yin', starTanlang: 'Tan Lang',
      starJumen: 'Ju Men', starTianxiang: 'Tian Xiang', starTianliang: 'Tian Liang',
      starQisha2: 'Qi Sha', starPojun: 'Po Jun',
      noMajorStar: '(No major star)',

      liuhe: 'Six Harmony',
      sanhe: 'Three Harmony',
      liuchong: 'Six Clash',
      sanxing: 'Three Punishment',
      liuhai: 'Six Harm',

      calculate: 'Calculate',
      reset: 'Reset',
      share: 'Share',
      copyLink: 'Copy Link',
      saveImage: 'Save Image',
      darkTheme: 'Dark',
      lightTheme: 'Light',
      language: 'Language',
      privacy: 'Privacy',
      privacyText: 'This tool runs entirely in your browser. No personal data is collected, no network requests are made. Your birth information is used only for local calculation and is never stored or transmitted.',
      noData: 'No data',
      loading: 'Calculating...',
      copied: 'Copied',
      sharePrompt: 'Share this chart',
      age: 'yrs',
      year2: '',
      startAge: 'Start Age',
    }
  };

  translations.vi = Object.assign({}, translations.en, {
    appTitle: 'Thiên Cơ',
    appSubtitle: 'Công cụ Kinh Dịch và huyền học Trung Hoa',
    quickStart: 'Bắt đầu nhanh', lunarHint: 'Nhập ngày sinh âm lịch',
    lunarMonth1: 'Tháng Giêng', lunarMonth2: 'Tháng Hai', lunarMonth3: 'Tháng Ba', lunarMonth4: 'Tháng Tư',
    lunarMonth5: 'Tháng Năm', lunarMonth6: 'Tháng Sáu', lunarMonth7: 'Tháng Bảy', lunarMonth8: 'Tháng Tám',
    lunarMonth9: 'Tháng Chín', lunarMonth10: 'Tháng Mười', lunarMonth11: 'Tháng Một âm lịch', lunarMonth12: 'Tháng Chạp',
    tabBazi: 'Lập lá số Bát Tự', tabLiuyao: 'Gieo quẻ Lục Hào', tabZiwei: 'Tử Vi Đẩu Số',
    birthDate: 'Ngày sinh', birthTime: 'Giờ sinh', gender: 'Giới tính', male: 'Nam', female: 'Nữ',
    yearPillar: 'Trụ năm', monthPillar: 'Trụ tháng', dayPillar: 'Trụ ngày', hourPillar: 'Trụ giờ',
    heavenlyStem: 'Thiên can', earthlyBranch: 'Địa chi', dayMaster: 'Nhật chủ', tenGods: 'Thập thần',
    fiveElements: 'Phân tích Ngũ hành', dayMasterStrength: 'Thân mạnh/yếu', luckPillars: 'Đại vận',
    flowYears: 'Lưu niên', relationships: 'Hình xung hợp hại', strong: 'Thân mạnh', weak: 'Thân yếu',
    neutral: 'Trung hòa', hiddenStems: 'Tàng can', nayin: 'Nạp âm', elementCount: 'Thống kê Ngũ hành',
    wood: 'Mộc', fire: 'Hỏa', earth: 'Thổ', metal: 'Kim', water: 'Thủy',
    stemJia: 'Giáp', stemYi: 'Ất', stemBing: 'Bính', stemDing: 'Đinh', stemWu: 'Mậu',
    stemJi: 'Kỷ', stemGeng: 'Canh', stemXin: 'Tân', stemRen: 'Nhâm', stemGui: 'Quý',
    branchZi: 'Tý', branchChou: 'Sửu', branchYin: 'Dần', branchMao: 'Mão', branchChen: 'Thìn',
    branchSi: 'Tỵ', branchWu2: 'Ngọ', branchWei: 'Mùi', branchShen: 'Thân', branchYou: 'Dậu',
    branchXu: 'Tuất', branchHai: 'Hợi',
    rat: 'Chuột', ox: 'Trâu', tiger: 'Hổ', rabbit: 'Mèo', dragon: 'Rồng', snake: 'Rắn',
    horse: 'Ngựa', goat: 'Dê', monkey: 'Khỉ', rooster: 'Gà', dog: 'Chó', pig: 'Heo',
    bijian: 'Tỷ kiên', jiecai: 'Kiếp tài', shishen: 'Thực thần', shangguan: 'Thương quan',
    piancai: 'Thiên tài', zhengcai: 'Chính tài', qisha: 'Thất sát', zhengguan: 'Chính quan',
    pianyin: 'Thiên ấn', zhengyin: 'Chính ấn', yang: 'Dương', yin: 'Âm',
    shiChen0: 'Giờ Tý (23:00–01:00)', shiChen1: 'Giờ Sửu (01:00–03:00)',
    shiChen2: 'Giờ Dần (03:00–05:00)', shiChen3: 'Giờ Mão (05:00–07:00)',
    shiChen4: 'Giờ Thìn (07:00–09:00)', shiChen5: 'Giờ Tỵ (09:00–11:00)',
    shiChen6: 'Giờ Ngọ (11:00–13:00)', shiChen7: 'Giờ Mùi (13:00–15:00)',
    shiChen8: 'Giờ Thân (15:00–17:00)', shiChen9: 'Giờ Dậu (17:00–19:00)',
    shiChen10: 'Giờ Tuất (19:00–21:00)', shiChen11: 'Giờ Hợi (21:00–23:00)',
    castMethod: 'Phương pháp khởi quẻ', timeCast: 'Theo thời gian', numberCast: 'Theo số',
    coinCast: 'Tung đồng xu', primaryHex: 'Quẻ chủ', changedHex: 'Quẻ biến',
    movingLines: 'Hào động', worldLine: 'Hào Thế', responseLine: 'Hào Ứng',
    sixRelatives: 'Lục thân', sixGods: 'Lục thần', castNow: 'Gieo quẻ', hexagram: 'Quẻ',
    hexDescription: 'Lời quẻ', linePosition: 'Vị trí hào', lineYang: 'Hào Dương',
    lineYin: 'Hào Âm', movingMark: 'Động', num1Label: 'Số thứ nhất', num2Label: 'Số thứ hai',
    num3Label: 'Số thứ ba (tùy chọn)', noMovingLines: 'Không có hào động',
    qinglong: 'Thanh Long', zhuque: 'Chu Tước', gouchen: 'Câu Trần', tengshe: 'Đằng Xà',
    baihu: 'Bạch Hổ', xuanwu: 'Huyền Vũ', xiongdi: 'Huynh đệ', zisun: 'Tử tôn',
    fumu: 'Phụ mẫu', qicai: 'Thê tài', guangui: 'Quan quỷ',
    lunarDate: 'Ngày âm lịch', lunarYear: 'Năm', lunarMonth: 'Tháng', lunarDay: 'Ngày',
    palace: 'Cung', stars: 'Sao', convertSolar: 'Đổi từ dương lịch',
    palaceLife: 'Cung Mệnh', palaceSiblings: 'Cung Huynh Đệ', palaceSpouse: 'Cung Phu Thê',
    palaceChildren: 'Cung Tử Tức', palaceWealth: 'Cung Tài Bạch', palaceHealth: 'Cung Tật Ách',
    palaceTravel: 'Cung Thiên Di', palaceServants: 'Cung Nô Bộc', palaceCareer: 'Cung Quan Lộc',
    palaceProperty: 'Cung Điền Trạch', palaceFortune: 'Cung Phúc Đức', palaceParents: 'Cung Phụ Mẫu',
    palaceLifeDesc: 'Bản thân, tính cách, ngoại hình và vận trình tổng thể',
    palaceSiblingsDesc: 'Anh chị em, bạn bè và quan hệ hợp tác', palaceSpouseDesc: 'Hôn nhân, tình cảm và bạn đời',
    palaceChildrenDesc: 'Con cái, cấp dưới và sức sáng tạo', palaceWealthDesc: 'Tài vận, quản lý tiền bạc và tài sản',
    palaceHealthDesc: 'Sức khỏe, bệnh tật và sự cố', palaceTravelDesc: 'Di chuyển, chuyển nơi ở và hình ảnh bên ngoài',
    palaceServantsDesc: 'Bạn bè, cấp dưới và các mối quan hệ', palaceCareerDesc: 'Sự nghiệp, danh tiếng và vị thế',
    palacePropertyDesc: 'Bất động sản, nhà cửa và môi trường gia đình',
    palaceFortuneDesc: 'Phúc khí, đời sống tinh thần và sự an hưởng', palaceParentsDesc: 'Cha mẹ, cấp trên và bậc trưởng thượng',
    starZiwei: 'Tử Vi', starTianji: 'Thiên Cơ', starTaiyang: 'Thái Dương', starWuqu: 'Vũ Khúc',
    starTiantong: 'Thiên Đồng', starLianzhen: 'Liêm Trinh', starTianfu: 'Thiên Phủ', starTaiyin: 'Thái Âm',
    starTanlang: 'Tham Lang', starJumen: 'Cự Môn', starTianxiang: 'Thiên Tướng', starTianliang: 'Thiên Lương',
    starQisha2: 'Thất Sát', starPojun: 'Phá Quân', noMajorStar: '(Không có chính tinh)',
    liuhe: 'Lục hợp', sanhe: 'Tam hợp', liuchong: 'Lục xung', sanxing: 'Tam hình', liuhai: 'Lục hại',
    calculate: 'Lập lá số', reset: 'Đặt lại', share: 'Chia sẻ', copyLink: 'Sao chép liên kết',
    saveImage: 'Lưu ảnh', darkTheme: 'Giao diện tối', lightTheme: 'Giao diện sáng', language: 'Ngôn ngữ',
    privacy: 'Tuyên bố quyền riêng tư',
    privacyText: 'Công cụ này hoạt động hoàn toàn cục bộ trên trình duyệt, không thu thập dữ liệu cá nhân và không gửi yêu cầu mạng. Thông tin ngày sinh chỉ dùng để tính toán cục bộ, không được lưu trữ hay truyền đi.',
    noData: 'Chưa có dữ liệu', loading: 'Đang tính toán...', copied: 'Đã sao chép',
    sharePrompt: 'Chia sẻ lá số này', age: 'tuổi', year2: 'năm', startAge: 'Tuổi khởi vận'
  });

  const hexagramNamesVi = {
    1:'Càn',2:'Khôn',3:'Truân',4:'Mông',5:'Nhu',6:'Tụng',7:'Sư',8:'Tỷ',9:'Tiểu Súc',10:'Lý',
    11:'Thái',12:'Bĩ',13:'Đồng Nhân',14:'Đại Hữu',15:'Khiêm',16:'Dự',17:'Tùy',18:'Cổ',19:'Lâm',20:'Quan',
    21:'Phệ Hạp',22:'Bí',23:'Bác',24:'Phục',25:'Vô Vọng',26:'Đại Súc',27:'Di',28:'Đại Quá',29:'Khảm',30:'Ly',
    31:'Hàm',32:'Hằng',33:'Độn',34:'Đại Tráng',35:'Tấn',36:'Minh Di',37:'Gia Nhân',38:'Khuê',39:'Kiển',40:'Giải',
    41:'Tổn',42:'Ích',43:'Quải',44:'Cấu',45:'Tụy',46:'Thăng',47:'Khốn',48:'Tỉnh',49:'Cách',50:'Đỉnh',
    51:'Chấn',52:'Cấn',53:'Tiệm',54:'Quy Muội',55:'Phong',56:'Lữ',57:'Tốn',58:'Đoài',59:'Hoán',60:'Tiết',
    61:'Trung Phu',62:'Tiểu Quá',63:'Ký Tế',64:'Vị Tế'
  };

  const hexagramDescriptionsVi = {
    1:'Trời vận hành mạnh mẽ; quân tử tự cường không ngừng.',2:'Đất dày nâng đỡ vạn vật; quân tử lấy đức dày chở vật.',3:'Cương nhu mới giao, muôn việc khởi đầu nhiều gian nan.',4:'Dưới núi có hiểm; biết dừng trước hiểm là Mông.',
    5:'Nhu chờ thời, giữ lòng thành tín thì hanh thông và cát.',6:'Trời nước đi ngược chiều; chủ về tranh tụng.',7:'Trong đất có nước; tượng của Sư, lấy kỷ luật mà hành.',8:'Trên đất có nước; tượng của Tỷ, lấy thân cận và hòa hợp.',
    9:'Gió đi trên trời; tiểu súc, tích lũy nhỏ mà chưa thể tiến xa.',10:'Trên trời dưới đầm; bước đi thận trọng.',11:'Trời đất giao cảm; Thái, hanh thông.',12:'Trời đất không giao; Bĩ, bế tắc.',
    13:'Trời cùng lửa; Đồng Nhân, đồng lòng với người.',14:'Lửa ở trên trời; Đại Hữu, sở hữu lớn.',15:'Trong đất có núi; Khiêm, khiêm nhường.',16:'Sấm phát từ đất; Dự, vui thuận mà chuẩn bị.',
    17:'Trong đầm có sấm; Tùy, thuận theo thời thế.',18:'Dưới núi có gió; Cổ, sửa trị điều hư hỏng.',19:'Trên đầm có đất; Lâm, đến gần và dẫn dắt.',20:'Gió đi trên đất; Quan, quan sát và soi xét.',
    21:'Sấm lửa cùng hiện; Phệ Hạp, cần quyết đoán để thông trở ngại.',22:'Dưới núi có lửa; Bí, trang sức nhưng lấy thực chất làm gốc.',23:'Núi tựa đất; Bác, suy tàn và bóc bỏ.',24:'Sấm ở trong đất; Phục, trở về đúng đường.',
    25:'Sấm vận hành dưới trời; Vô Vọng, chân thành không vọng động.',26:'Trời ở trong núi; Đại Súc, chứa dưỡng sức mạnh lớn.',27:'Dưới núi có sấm; Di, nuôi dưỡng thân tâm.',28:'Đầm ngập cây; Đại Quá, gánh nặng vượt mức.',
    29:'Nước chồng lên nước; Khảm, hiểm trở lặp lại.',30:'Ánh sáng nối tiếp; Ly, bám vào điều sáng rõ.',31:'Trên núi có đầm; Hàm, cảm ứng lẫn nhau.',32:'Sấm gió cùng hành; Hằng, bền vững lâu dài.',
    33:'Dưới trời có núi; Độn, biết lui đúng lúc.',34:'Sấm ở trên trời; Đại Tráng, mạnh mẽ nhưng phải chính đáng.',35:'Mặt trời lên khỏi đất; Tấn, tiến triển.',36:'Ánh sáng vào trong đất; Minh Di, giữ sáng trong cảnh tối.',
    37:'Gió từ lửa sinh; Gia Nhân, chỉnh đốn gia đạo.',38:'Trên lửa dưới đầm; Khuê, khác biệt mà tìm đồng thuận.',39:'Trên núi có nước; Kiển, khó khăn cần vượt qua.',40:'Sấm mưa nổi lên; Giải, giải trừ bế tắc.',
    41:'Dưới núi có đầm; Tổn, biết giảm bớt để thành tựu.',42:'Gió sấm cùng hành; Ích, tăng ích và giúp đỡ.',43:'Đầm dâng lên trời; Quải, quyết đoán loại bỏ điều xấu.',44:'Dưới trời có gió; Cấu, gặp gỡ bất ngờ.',
    45:'Đầm ở trên đất; Tụy, hội tụ nhân tâm.',46:'Trong đất sinh cây; Thăng, từng bước vươn lên.',47:'Đầm không có nước; Khốn, cảnh cùng quẫn.',48:'Cây ở trên nước; Tỉnh, nguồn nuôi dưỡng cộng đồng.',
    49:'Trong đầm có lửa; Cách, cải cách đúng thời.',50:'Cây ở trên lửa; Đỉnh, đổi mới và dưỡng hiền.',51:'Sấm chồng lên sấm; Chấn, kinh động để tự xét mình.',52:'Núi chồng lên núi; Cấn, biết dừng đúng chỗ.',
    53:'Trên núi có cây; Tiệm, tiến dần từng bước.',54:'Trên đầm có sấm; Quy Muội, hôn phối cần đúng lễ.',55:'Sấm lửa đều đến; Phong, thịnh lớn nhưng khó bền.',56:'Trên núi có lửa; Lữ, sống cảnh lữ hành.',
    57:'Gió theo gió; Tốn, thâm nhập mềm dẻo.',58:'Đầm nối tiếp đầm; Đoài, niềm vui hòa duyệt.',59:'Gió đi trên nước; Hoán, tan rã rồi quy tụ.',60:'Trên đầm có nước; Tiết, biết tiết chế.',
    61:'Trên đầm có gió; Trung Phu, thành tín ở bên trong.',62:'Trên núi có sấm; Tiểu Quá, việc nhỏ thì nên làm.',63:'Nước ở trên lửa; Ký Tế, đã thành nhưng phải giữ gìn.',64:'Lửa ở trên nước; Vị Tế, chưa xong, cần thận trọng.'
  };

  const hexagramPlainAdviceVi = {
    1:'Hãy chủ động và tự tin, nhưng đừng cố làm mọi việc một mình.',2:'Ưu tiên hợp tác, kiên nhẫn và tạo nền tảng vững chắc.',3:'Việc mới bắt đầu thường rối; hãy chia nhỏ việc và đi từng bước.',4:'Nên học hỏi hoặc hỏi người có kinh nghiệm trước khi quyết.',5:'Chưa cần vội; chuẩn bị kỹ và chờ thời điểm rõ ràng hơn.',6:'Có bất đồng; hãy làm rõ nguyên tắc thay vì tranh thắng thua.',7:'Cần kỷ luật, phân vai rõ và một người điều phối đáng tin.',8:'Tìm đồng minh phù hợp, nhưng chọn người cùng giá trị.',9:'Tiến độ đang chậm; cứ tích lũy những bước nhỏ có ích.',10:'Có thể tiến gần việc khó, nhưng phải giữ phép tắc và thận trọng.',
    11:'Điều kiện đang thuận; hãy phối hợp và tranh thủ triển khai.',12:'Đang có chỗ bế tắc; nên thu gọn việc và chờ tín hiệu tốt hơn.',13:'Hãy trao đổi thẳng thắn, tìm người chung mục tiêu.',14:'Có nguồn lực hoặc cơ hội tốt; dùng nó có trách nhiệm.',15:'Càng khiêm nhường, càng dễ được tin cậy và hỗ trợ.',16:'Có khí thế tốt; hãy chuẩn bị cụ thể trước khi bắt đầu.',17:'Linh hoạt theo tình hình, nhưng không đánh mất nguyên tắc.',18:'Có việc cũ cần sửa; hãy xử lý tận gốc thay vì né tránh.',19:'Đây là lúc chủ động đến gần, lắng nghe và dẫn dắt.',20:'Tạm lùi lại quan sát toàn cảnh trước khi can thiệp.',
    21:'Có nút thắt cần gỡ; hãy quyết đoán nhưng dựa trên sự thật.',22:'Hình thức có ích, nhưng đừng để nó che mất nội dung.',23:'Nên bỏ bớt phần không còn phù hợp để giữ cái cốt lõi.',24:'Có thể quay lại hướng đúng; bắt đầu lại từ điều cơ bản.',25:'Cứ chân thành và làm đúng việc, đừng mưu mẹo hay suy diễn.',26:'Hãy tích lũy năng lực; chưa phải lúc dùng hết sức.',27:'Chăm sức khỏe, kiến thức và nguồn lực trước khi lo việc lớn.',28:'Bạn đang gánh hơi quá sức; hãy chia việc hoặc giảm tải.',29:'Khó khăn có thể lặp lại; bình tĩnh, tuân thủ quy trình an toàn.',30:'Cần nhìn rõ dữ kiện và bám vào điều đáng tin cậy.',
    31:'Sức thuyết phục đến từ sự chân thành, không phải ép buộc.',32:'Chọn nhịp đều và giữ cam kết lâu dài.',33:'Biết lui để giữ lực; tránh đối đầu khi thời thế chưa thuận.',34:'Bạn có đà để tiến, nhưng phải đúng mực và biết giới hạn.',35:'Có dấu hiệu tiến triển; hãy tiếp tục làm rõ giá trị của mình.',36:'Trong hoàn cảnh bất lợi, giữ nguyên tắc và bảo vệ điều quan trọng.',37:'Sắp xếp lại vai trò, trách nhiệm và nề nếp trong gia đình/nhóm.',38:'Khác biệt không hẳn xấu; tìm điểm chung để cùng làm việc.',39:'Đường đang khó; nên nhờ hỗ trợ và đổi cách tiếp cận.',40:'Nút thắt có thể được tháo; hãy giải quyết việc tồn đọng.',
    41:'Bớt một phần lợi ích ngắn hạn để giữ mục tiêu lớn hơn.',42:'Nên chia sẻ nguồn lực và tạo lợi ích chung.',43:'Đã đến lúc nói rõ, đặt giới hạn và dứt khoát bỏ điều xấu.',44:'Một cơ hội hoặc người mới xuất hiện; tiếp cận cởi mở nhưng tỉnh táo.',45:'Hãy quy tụ người và nguồn lực quanh một mục tiêu chung.',46:'Cứ tiến đều từ việc nhỏ; sự thăng tiến cần thời gian.',47:'Nguồn lực đang thiếu; ưu tiên việc thiết yếu và xin trợ giúp.',48:'Hãy quay về nguồn lực bền vững, sửa hệ thống thay vì xử lý ngọn.',49:'Cần đổi mới, nhưng chỉ thay đổi khi thời điểm và lý do đã rõ.',50:'Biến kinh nghiệm thành giá trị mới, nuôi dưỡng người có năng lực.',
    51:'Có biến động bất ngờ; bình tĩnh rồi kiểm tra lại nền tảng.',52:'Nên dừng đúng lúc, tránh phản ứng khi cảm xúc còn cao.',53:'Mọi việc nên đi chậm mà chắc; đừng đốt giai đoạn.',54:'Quan hệ hoặc cam kết cần đúng vị trí, đúng thời điểm.',55:'Cơ hội đang lớn nhưng không kéo dài mãi; tập trung việc quan trọng.',56:'Đang ở thế tạm thời; linh hoạt, lịch sự và đừng đặt kỳ vọng quá cao.',57:'Dùng cách mềm dẻo, kiên trì tác động thay vì ép buộc.',58:'Giao tiếp cởi mở và niềm vui chung sẽ giúp việc tiến lên.',59:'Hãy tháo bỏ khoảng cách, khơi thông thông tin và kết nối lại.',60:'Đặt giới hạn rõ ràng để giữ sức, tiền bạc và thời gian.',
    61:'Sự chân thành là then chốt; nói điều mình thực sự có thể làm.',62:'Chỉ nên xử lý việc nhỏ, kỹ và gần; đừng mạo hiểm việc lớn.',63:'Việc tưởng đã xong vẫn cần theo dõi để không phát sinh sai sót.',64:'Chưa đến đích; hoàn thiện từng phần và đừng nóng vội.'
  };

  const hexagramEverydaySituationVi = {
    1:'Bạn đang muốn tự mình mở đường hoặc đẩy mạnh một kế hoạch.',2:'Bạn đang ở vai trò hỗ trợ, cần phối hợp và bồi đắp dần.',3:'Một việc mới vừa bắt đầu nhưng còn nhiều chi tiết rối.',4:'Bạn chưa có đủ kinh nghiệm hoặc thông tin để tự quyết.',5:'Bạn đang chờ phản hồi, phê duyệt, khoản tiền hoặc thời điểm phù hợp.',6:'Bạn đang vướng một cuộc tranh luận, hiểu lầm hoặc điều khoản chưa rõ.',7:'Một nhóm đang cần người điều phối và quy tắc làm việc.',8:'Bạn đang cân nhắc hợp tác, chọn bạn đồng hành hoặc gia nhập một nhóm.',9:'Bạn đã có cố gắng nhưng kết quả chưa đến ngay.',10:'Bạn phải tiếp cận một người/việc khó và cần giữ chừng mực.',
    11:'Công việc, quan hệ hoặc kế hoạch đang có nhiều điều kiện thuận lợi.',12:'Việc đang kẹt vì thiếu kết nối, thiếu đồng thuận hoặc sai thời điểm.',13:'Bạn cần tập hợp người cùng chí hướng để làm một việc chung.',14:'Bạn đang có nguồn lực, cơ hội hoặc vị thế tốt hơn trước.',15:'Bạn đang được chú ý; cách cư xử sẽ quyết định sự ủng hộ lâu dài.',16:'Bạn có hứng khởi để khởi động một việc mới.',17:'Hoàn cảnh thay đổi và bạn cần lựa chọn cách thích nghi.',18:'Có lỗi cũ, việc tồn hoặc quy trình hỏng cần được sửa.',19:'Bạn có cơ hội chủ động tiếp cận, dẫn dắt hoặc chăm sóc một mối quan hệ.',20:'Bạn nên quan sát trước khi ra quyết định hay can thiệp.',
    21:'Có một trở ngại cụ thể đang làm công việc hoặc quan hệ bị tắc.',22:'Bạn đang chú ý nhiều đến vẻ ngoài, cách trình bày hoặc hình ảnh.',23:'Một phần cũ đang không còn hiệu quả và cần được loại bớt.',24:'Bạn đang cân nhắc quay lại một lựa chọn, thói quen hoặc kế hoạch cũ.',25:'Bạn cần đưa ra lựa chọn đúng với lòng mình, không chạy theo tính toán.',26:'Bạn đang tích lũy kỹ năng, tiền bạc hoặc sự chuẩn bị cho việc lớn.',27:'Sức khỏe, kiến thức, tiền bạc hoặc năng lượng cá nhân cần được bồi dưỡng.',28:'Bạn đang gánh quá nhiều trách nhiệm hoặc chịu áp lực vượt sức.',29:'Khó khăn xảy ra lặp lại, như thủ tục rắc rối hay dòng tiền căng.',30:'Bạn cần làm rõ dữ kiện, giấy tờ hoặc điều mình thực sự tin tưởng.',
    31:'Bạn muốn tạo thiện cảm, thuyết phục hoặc kết nối với ai đó.',32:'Bạn cần giữ một cam kết, thói quen hay dự án trong thời gian dài.',33:'Bạn đang gặp thế đối đầu và nên cân nhắc lùi một bước.',34:'Bạn có năng lượng, lợi thế hoặc mong muốn thúc đẩy việc thật nhanh.',35:'Bạn đang có dấu hiệu được ghi nhận hoặc tiến thêm một nấc.',36:'Bạn ở hoàn cảnh không thuận lợi và cần bảo vệ giá trị cốt lõi.',37:'Gia đình hoặc nhóm làm việc đang cần sắp xếp lại vai trò.',38:'Hai bên có quan điểm khác nhau nhưng vẫn phải cùng giải quyết việc.',39:'Bạn gặp trở ngại thực tế và chưa thể đi thẳng đến mục tiêu.',40:'Một việc căng thẳng đang có cơ hội được tháo gỡ.',
    41:'Bạn cần cắt bớt chi tiêu, thời gian hoặc mục tiêu để tập trung.',42:'Bạn có thể giúp người khác hoặc nhận hỗ trợ để cùng có lợi.',43:'Bạn đã nhìn rõ một vấn đề và cần đặt giới hạn dứt khoát.',44:'Một người, lời mời hoặc cơ hội xuất hiện khá bất ngờ.',45:'Bạn đang cần tập hợp người, ý kiến hoặc nguồn lực cho một việc.',46:'Bạn đang đi lên chậm nhưng có nền tảng.',47:'Bạn đang thiếu tiền, thời gian, người hỗ trợ hoặc lựa chọn.',48:'Bạn cần sửa gốc rễ của hệ thống, không chỉ xử lý sự cố trước mắt.',49:'Bạn muốn thay đổi cách làm, công việc hoặc một quy tắc cũ.',50:'Bạn đang biến kinh nghiệm thành sản phẩm, giá trị hoặc năng lực mới.',
    51:'Có tin bất ngờ, sự cố hoặc thay đổi làm bạn giật mình.',52:'Bạn đang bị cảm xúc hoặc áp lực kéo đi và cần một khoảng dừng.',53:'Một quan hệ hoặc dự án đang tiến chậm nhưng đúng hướng.',54:'Một cam kết hay quan hệ đang có sự lệch nhịp hoặc chưa đúng thời điểm.',55:'Bạn đang ở giai đoạn cơ hội nhiều, việc nhiều và dễ bị quá tải.',56:'Bạn đang ở vị trí tạm thời, như đi xa, đổi việc hoặc làm môi trường mới.',57:'Bạn cần thuyết phục ai đó hoặc thay đổi dần một thói quen.',58:'Bạn cần một cuộc trò chuyện cởi mở để giảm căng thẳng.',59:'Nhóm hoặc quan hệ đang xa cách và cần nối lại thông tin.',60:'Bạn cần thiết lập giới hạn cho tiền bạc, thời gian hoặc cảm xúc.',
    61:'Một lời hứa, sự tin cậy hoặc tính trung thực đang là trọng tâm.',62:'Có việc nhỏ, việc gần cần xử lý cẩn thận trước.',63:'Một việc vừa hoàn tất nhưng còn giai đoạn bàn giao, kiểm tra.',64:'Bạn đang gần đến đích nhưng vẫn còn vài bước chưa hoàn thiện.'
  };

  const hanVietTerms = {
    '阳历':'Dương lịch','农历':'Âm lịch','本命':'Bản mệnh','起运':'Khởi vận','顺行':'Thuận hành','逆行':'Nghịch hành',
    '强弱分析详情':'Chi tiết phân tích thân mạnh/yếu','日主偏强':'Nhật chủ thiên mạnh','日主偏弱':'Nhật chủ thiên yếu',
    '胎元':'Thai nguyên','命宫':'Mệnh cung','神煞':'Thần sát','格局':'Cách cục','用神忌神':'Dụng thần và kỵ thần',
    '用神':'Dụng thần','忌神':'Kỵ thần','官杀':'Quan Sát','食伤':'Thực Thương','比劫':'Tỷ Kiếp',
    '正印格':'Chính Ấn cách','偏印格':'Thiên Ấn cách','正官格':'Chính Quan cách','七杀格':'Thất Sát cách',
    '建禄格':'Kiến Lộc cách','羊刃格':'Dương Nhận cách','杂气格':'Tạp Khí cách',
    '正财':'Chính Tài','偏财':'Thiên Tài','正官':'Chính Quan','七杀':'Thất Sát','正印':'Chính Ấn','偏印':'Thiên Ấn',
    '比肩':'Tỷ Kiên','劫财':'Kiếp Tài','食神':'Thực Thần','伤官':'Thương Quan','身强':'Thân mạnh','身弱':'Thân yếu','中和':'Trung hòa',
    '天乙贵人':'Thiên Ất Quý Nhân','文昌贵人':'Văn Xương Quý Nhân','驿马':'Dịch Mã','桃花':'Đào Hoa','华盖':'Hoa Cái','将星':'Tướng Tinh','天德':'Thiên Đức','月德':'Nguyệt Đức','禄神':'Lộc Thần','羊刃':'Dương Nhận',
    '命宫':'Cung Mệnh','兄弟宫':'Cung Huynh Đệ','夫妻宫':'Cung Phu Thê','子女宫':'Cung Tử Tức','财帛宫':'Cung Tài Bạch','疾厄宫':'Cung Tật Ách','迁移宫':'Cung Thiên Di','奴仆宫':'Cung Nô Bộc','官禄宫':'Cung Quan Lộc','田宅宫':'Cung Điền Trạch','福德宫':'Cung Phúc Đức','父母宫':'Cung Phụ Mẫu',
    '紫微':'Tử Vi','天机':'Thiên Cơ','太阳':'Thái Dương','武曲':'Vũ Khúc','天同':'Thiên Đồng','廉贞':'Liêm Trinh','天府':'Thiên Phủ','太阴':'Thái Âm','贪狼':'Tham Lang','巨门':'Cự Môn','天相':'Thiên Tướng','天梁':'Thiên Lương','破军':'Phá Quân',
    '主仁厚好学，文昌之命。':'Chủ nhân hậu hiếu học, có mệnh Văn Xương.','宜用':'Nên dùng','克泄耗之':'để khắc, tiết và hao','得分':'Điểm số',
    '六合':'Lục hợp','半三合':'Bán tam hợp','三合':'Tam hợp','六害':'Lục hại','六冲':'Lục xung','相害':'tương hại','合火':'hợp Hỏa','合木局':'hợp Mộc cục',
    '天河水':'Thiên Hà Thủy','山下火':'Sơn Hạ Hỏa','大海水':'Đại Hải Thủy','天上火':'Thiên Thượng Hỏa','屋上土':'Ốc Thượng Thổ','长流水':'Trường Lưu Thủy','平地木':'Bình Địa Mộc','壁上土':'Bích Thượng Thổ','金箔金':'Kim Bạc Kim','佛灯火':'Phật Đăng Hỏa','钗钏金':'Thoa Xuyến Kim','桑柘木':'Tang Chá Mộc','大溪水':'Đại Khê Thủy','大驿土':'Đại Dịch Thổ',
    '初':'Sơ','二':'Nhị','三':'Tam','四':'Tứ','五':'Ngũ','六':'Lục','七':'Bảy','八':'Tám','九':'Chín','十':'Mười','上':'Thượng','下':'Hạ','年':'Năm','月':'Tháng','日':'Ngày','时':'Giờ','岁':'tuổi','柱':'Trụ','干':'Can','支':'Chi','藏':'Tàng','局':'Cục','财':'Tài','印':'Ấn','半':'Bán','，':', ','。':'.',
    '甲':'Giáp','乙':'Ất','丙':'Bính','丁':'Đinh','戊':'Mậu','己':'Kỷ','庚':'Canh','辛':'Tân','壬':'Nhâm','癸':'Quý',
    '子':'Tý','丑':'Sửu','寅':'Dần','卯':'Mão','辰':'Thìn','巳':'Tỵ','午':'Ngọ','未':'Mùi','申':'Thân','酉':'Dậu','戌':'Tuất','亥':'Hợi',
    '木':'Mộc','火':'Hỏa','土':'Thổ','金':'Kim','水':'Thủy','旺':'Vượng','弱':'Nhược','中':'Trung',
    '鼠':'Chuột','牛':'Trâu','虎':'Hổ','兔':'Mèo','龙':'Rồng','蛇':'Rắn','马':'Ngựa','羊':'Dê','猴':'Khỉ','鸡':'Gà','狗':'Chó','猪':'Heo',
    '天机':'Thiên Cơ','贡献指南':'Hướng dẫn đóng góp','跳到主要内容':'Chuyển đến nội dung chính','易 · 道 · 术':'Dịch · Đạo · Thuật'
  };

  const hanVietPattern = new RegExp(Object.keys(hanVietTerms).sort(function(a, b) { return b.length - a.length; }).join('|'), 'g');

  function localizeText(value) {
    return currentLang === 'vi' ? value.replace(hanVietPattern, function(term) { return hanVietTerms[term]; }) : value;
  }

  function localizeDocument(root) {
    if (currentLang !== 'vi' || !root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (node.parentElement && !node.parentElement.closest('[data-preserve-han]') && !/^(SCRIPT|STYLE)$/i.test(node.parentElement.tagName)) node.nodeValue = localizeText(node.nodeValue);
    }
  }

  function hexagramName(number, fallback) {
    return currentLang === 'vi' ? (hexagramNamesVi[number] || fallback) : fallback;
  }

  function hexagramDescription(number, fallback) {
    return currentLang === 'vi' ? (hexagramDescriptionsVi[number] || fallback) : fallback;
  }

  function hexagramPlainAdvice(number, fallback) {
    return currentLang === 'vi' ? (hexagramPlainAdviceVi[number] || fallback) : fallback;
  }

  function hexagramEverydaySituation(number, fallback) {
    return currentLang === 'vi' ? (hexagramEverydaySituationVi[number] || fallback) : fallback;
  }

  /**
   * Translate a key. Returns the key itself if no translation found.
   * @param {string} key
   * @returns {string}
   */
  function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) || key;
  }

  /**
   * Set the active language.
   * @param {'vi'|'en'} lang
   */
  function setLang(lang) {
    if (translations[lang]) {
      currentLang = lang;
    }
  }

  /** @returns {'vi'|'en'} */
  function getLang() {
    return currentLang;
  }

  /**
   * Toggle between vi and en. Returns new language code.
   * @returns {'vi'|'en'}
   */
  function toggle() {
    currentLang = currentLang === 'vi' ? 'en' : 'vi';
    return currentLang;
  }

  return { t, setLang, getLang, toggle, hexagramName, hexagramDescription, hexagramPlainAdvice, hexagramEverydaySituation, hanViet: localizeText, localizeDocument, translations };
})();
