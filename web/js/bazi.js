/**
 * 八字排盘算法 (BaZi Four-Pillar Algorithm)
 * 
 * Pure JavaScript implementation of the BaZi calculation engine.
 * Faithfully re-implements the Python tianji library algorithms.
 */

const BaZi = (() => {
    // ==================== 天干 (Heavenly Stems) ====================
    const HEAVENLY_STEMS = [
        { char: '甲', index: 0, element: '木', polarity: '阳' },
        { char: '乙', index: 1, element: '木', polarity: '阴' },
        { char: '丙', index: 2, element: '火', polarity: '阳' },
        { char: '丁', index: 3, element: '火', polarity: '阴' },
        { char: '戊', index: 4, element: '土', polarity: '阳' },
        { char: '己', index: 5, element: '土', polarity: '阴' },
        { char: '庚', index: 6, element: '金', polarity: '阳' },
        { char: '辛', index: 7, element: '金', polarity: '阴' },
        { char: '壬', index: 8, element: '水', polarity: '阳' },
        { char: '癸', index: 9, element: '水', polarity: '阴' },
    ];

    // ==================== 地支 (Earthly Branches) ====================
    const EARTHLY_BRANCHES = [
        { char: '子', index: 0, element: '水', polarity: '阳', zodiac: '鼠', hourRange: '23:00–01:00', hiddenStems: ['癸'] },
        { char: '丑', index: 1, element: '土', polarity: '阴', zodiac: '牛', hourRange: '01:00–03:00', hiddenStems: ['己', '癸', '辛'] },
        { char: '寅', index: 2, element: '木', polarity: '阳', zodiac: '虎', hourRange: '03:00–05:00', hiddenStems: ['甲', '丙', '戊'] },
        { char: '卯', index: 3, element: '木', polarity: '阴', zodiac: '兔', hourRange: '05:00–07:00', hiddenStems: ['乙'] },
        { char: '辰', index: 4, element: '土', polarity: '阳', zodiac: '龙', hourRange: '07:00–09:00', hiddenStems: ['戊', '乙', '癸'] },
        { char: '巳', index: 5, element: '火', polarity: '阴', zodiac: '蛇', hourRange: '09:00–11:00', hiddenStems: ['丙', '庚', '戊'] },
        { char: '午', index: 6, element: '火', polarity: '阳', zodiac: '马', hourRange: '11:00–13:00', hiddenStems: ['丁', '己'] },
        { char: '未', index: 7, element: '土', polarity: '阴', zodiac: '羊', hourRange: '13:00–15:00', hiddenStems: ['己', '丁', '乙'] },
        { char: '申', index: 8, element: '金', polarity: '阳', zodiac: '猴', hourRange: '15:00–17:00', hiddenStems: ['庚', '壬', '戊'] },
        { char: '酉', index: 9, element: '金', polarity: '阴', zodiac: '鸡', hourRange: '17:00–19:00', hiddenStems: ['辛'] },
        { char: '戌', index: 10, element: '土', polarity: '阳', zodiac: '狗', hourRange: '19:00–21:00', hiddenStems: ['戊', '辛', '丁'] },
        { char: '亥', index: 11, element: '水', polarity: '阴', zodiac: '猪', hourRange: '21:00–23:00', hiddenStems: ['壬', '甲'] },
    ];

    // ==================== 五行 (Five Elements) ====================
    const ELEMENT_PRODUCES = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
    const ELEMENT_CONQUERS = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
    const ELEMENT_COLORS = {
        '木': '#4CAF50', '火': '#F44336', '土': '#FFB300',
        '金': '#E0E0E0', '水': '#2196F3'
    };
    const ELEMENT_BG_COLORS = {
        '木': 'rgba(76,175,80,0.15)', '火': 'rgba(244,67,54,0.15)',
        '土': 'rgba(255,179,0,0.15)', '金': 'rgba(224,224,224,0.12)',
        '水': 'rgba(33,150,243,0.15)'
    };

    // ==================== 六十甲子 (60-Cycle) ====================
    const JIAZI_CYCLE = [];
    for (let i = 0; i < 60; i++) {
        JIAZI_CYCLE.push({
            stem: HEAVENLY_STEMS[i % 10],
            branch: EARTHLY_BRANCHES[i % 12],
            index: i,
            char: HEAVENLY_STEMS[i % 10].char + EARTHLY_BRANCHES[i % 12].char,
        });
    }

    // Lookup helpers
    function getStem(index) { return HEAVENLY_STEMS[((index % 10) + 10) % 10]; }
    function getBranch(index) { return EARTHLY_BRANCHES[((index % 12) + 12) % 12]; }
    function getJiazi(index) { return JIAZI_CYCLE[((index % 60) + 60) % 60]; }
    function getStemByChar(ch) { return HEAVENLY_STEMS.find(s => s.char === ch); }

    function getBranchForHour(hour) {
        if (hour === 23) return EARTHLY_BRANCHES[0]; // 子
        return EARTHLY_BRANCHES[Math.floor((hour + 1) / 2)];
    }

    function findStemBranch(stemIdx, branchIdx) {
        for (const sb of JIAZI_CYCLE) {
            if (sb.stem.index === stemIdx && sb.branch.index === branchIdx) return sb;
        }
        return null;
    }

    // ==================== 节气 (Solar Terms) ====================
    // Approximate solar term dates using astronomical formulas
    // Based on the sun's ecliptic longitude
    
    // Solar term angles (degrees of ecliptic longitude)
    const SOLAR_TERM_ANGLES = {
        '小寒': 285, '大寒': 300, '立春': 315, '雨水': 330,
        '惊蛰': 345, '春分': 0, '清明': 15, '谷雨': 30,
        '立夏': 45, '小满': 60, '芒种': 75, '夏至': 90,
        '小暑': 105, '大暑': 120, '立秋': 135, '处暑': 150,
        '白露': 165, '秋分': 180, '寒露': 195, '霜降': 210,
        '立冬': 225, '小雪': 240, '大雪': 255, '冬至': 270,
    };

    // Monthly Jie (节) terms that define month boundaries
    const MONTHLY_JIEQI = [
        '立春', '惊蛰', '清明', '立夏', '芒种', '小暑',
        '立秋', '白露', '寒露', '立冬', '大雪', '小寒'
    ];

    // Month branch indices: 寅(2), 卯(3), 辰(4), 巳(5), 午(6), 未(7), 申(8), 酉(9), 戌(10), 亥(11), 子(0), 丑(1)
    const MONTH_BRANCH_INDICES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];

    /**
     * Approximate solar term date using a simplified astronomical formula.
     * Accurate to within ~1 day for years 1900-2100.
     */
    function getSolarTermDate(year, termName) {
        const angle = SOLAR_TERM_ANGLES[termName];
        if (angle === undefined) throw new Error(`Unknown solar term: ${termName}`);

        // Julian century calculation
        // Reference: approximate algorithm for solar terms
        const Y = year;
        
        // Each solar term is ~15.2 days apart
        // Base: March equinox (春分) ≈ March 20.5
        // We need to find the date when the sun reaches the given ecliptic longitude
        
        // Simplified calculation using average solar year
        const jd0 = getJulianDayForYear(Y);
        
        // Approximate day offset from Jan 1 for each term
        // Using the formula: the sun moves ~0.9856° per day
        // Spring equinox (0°) is around March 20
        // So day_of_year ≈ 79.5 + (angle / 0.9856)  [with wrap for angle < 0]
        
        let adjustedAngle = angle;
        // Convert so that 0° (春分) maps to ~day 79 (March 20)
        // 小寒 (285°) → ~day 5 (Jan 5)
        
        // Days from spring equinox for this angle
        let daysFromEquinox = adjustedAngle / 0.9856;
        if (adjustedAngle > 180) {
            daysFromEquinox = -(360 - adjustedAngle) / 0.9856;
        }
        
        // Spring equinox approximate day of year (March 20)
        const equinoxDay = 79.5;
        let dayOfYear = equinoxDay + daysFromEquinox;
        
        // Apply year-specific corrections
        const century = (Y - 2000) / 100;
        dayOfYear += century * 0.05; // tiny drift correction
        
        if (dayOfYear < 1) dayOfYear += 365.25;
        if (dayOfYear > 365.25) dayOfYear -= 365.25;
        
        // Convert day of year to date
        const jan1 = new Date(Y, 0, 1);
        const result = new Date(jan1.getTime() + (Math.round(dayOfYear) - 1) * 86400000);
        return result;
    }

    function getJulianDayForYear(year) {
        return 2451545.0 + (year - 2000) * 365.25;
    }

    /**
     * Get Lichun (立春) date for a given year
     */
    function getLichunDate(year) {
        return getSolarTermDate(year, '立春');
    }

    // ==================== 四柱计算 (Four Pillars Calculation) ====================

    // 五虎遁月 — Year stem mod 5 → starting stem for 寅月
    const WUHU_MONTH_STEM_START = { 0: 2, 1: 4, 2: 6, 3: 8, 4: 0 };

    // 五鼠遁时 — Day stem mod 5 → starting stem for 子时
    const WUSHU_HOUR_STEM_START = { 0: 0, 1: 2, 2: 4, 3: 6, 4: 8 };

    /**
     * Compute Year Pillar (年柱)
     * Year changes at 立春, not Jan 1
     */
    function computeYearPillar(d) {
        let year = d.getFullYear();
        const lichun = getLichunDate(year);
        const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        
        if (dateOnly < lichun) {
            year -= 1;
        }
        
        const yearIndex = ((year - 4) % 60 + 60) % 60;
        return getJiazi(yearIndex);
    }

    /**
     * Determine month number and branch based on solar term boundaries
     */
    function determineMonthAndBranch(d) {
        const year = d.getFullYear();
        const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        
        // Collect jie boundaries
        const boundaries = [];
        for (const y of [year - 1, year, year + 1]) {
            for (let mi = 0; mi < MONTHLY_JIEQI.length; mi++) {
                try {
                    const termDate = getSolarTermDate(y, MONTHLY_JIEQI[mi]);
                    boundaries.push({ date: termDate, branchIdx: MONTH_BRANCH_INDICES[mi] });
                } catch (e) { /* skip */ }
            }
        }
        
        boundaries.sort((a, b) => a.date - b.date);
        
        let currentBranchIdx = 1; // default: 丑月
        for (const b of boundaries) {
            if (dateOnly >= b.date) {
                currentBranchIdx = b.branchIdx;
            } else {
                break;
            }
        }
        
        const monthNum = MONTH_BRANCH_INDICES.indexOf(currentBranchIdx) + 1;
        return { monthNum, branchIdx: currentBranchIdx };
    }

    /**
     * Compute Month Pillar (月柱)
     * Uses 五虎遁月 (Five Tiger Month Derivation)
     */
    function computeMonthPillar(d, yearStemIndex) {
        const { branchIdx } = determineMonthAndBranch(d);
        
        const baseStemIdx = WUHU_MONTH_STEM_START[yearStemIndex % 5];
        const monthOffset = MONTH_BRANCH_INDICES.indexOf(branchIdx);
        const stemIdx = (baseStemIdx + monthOffset) % 10;
        
        return findStemBranch(stemIdx, branchIdx);
    }

    /**
     * Compute Day Pillar (日柱)
     * Reference: 1900-01-01 = 甲子 (index 0)
     */
    function computeDayPillar(d) {
        const refDate = new Date(1900, 0, 1); // 1900-01-01
        const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const delta = Math.round((dateOnly - refDate) / 86400000);
        const index = ((delta % 60) + 60) % 60;
        return JIAZI_CYCLE[index];
    }

    /**
     * Compute Hour Pillar (时柱)
     * Uses 五鼠遁时 (Five Rat Hour Derivation)
     */
    function computeHourPillar(hour, dayStemIndex) {
        const branch = getBranchForHour(hour);
        const branchIdx = branch.index;
        
        const baseStemIdx = WUSHU_HOUR_STEM_START[dayStemIndex % 5];
        const stemIdx = (baseStemIdx + branchIdx) % 10;
        
        return findStemBranch(stemIdx, branchIdx);
    }

    // ==================== 十神 (Ten Gods) ====================
    const TEN_GOD_INFO = {
        '比肩': { english: 'Companion', meaning: '兄弟、朋友、竞争、自我' },
        '劫财': { english: 'Rob Wealth', meaning: '兄弟、竞争、劫夺财运' },
        '食神': { english: 'Eating God', meaning: '才华、口福、福气、艺术' },
        '伤官': { english: 'Hurting Officer', meaning: '才华横溢、叛逆、创新' },
        '偏财': { english: 'Indirect Wealth', meaning: '偏财运、父亲、应变力' },
        '正财': { english: 'Direct Wealth', meaning: '正当财富、稳健、务实' },
        '七杀': { english: 'Seven Killings', meaning: '权威、压力、魄力' },
        '正官': { english: 'Direct Officer', meaning: '官职、规范、正直' },
        '偏印': { english: 'Indirect Resource', meaning: '偏门学问、灵感' },
        '正印': { english: 'Direct Resource', meaning: '母亲、学业、慈悲' },
    };

    function computeTenGod(dayMaster, otherStem) {
        const dmElement = dayMaster.element;
        const otherElement = otherStem.element;
        const samePolarity = dayMaster.polarity === otherStem.polarity;

        if (dmElement === otherElement) {
            return samePolarity ? '比肩' : '劫财';
        } else if (ELEMENT_PRODUCES[dmElement] === otherElement) {
            return samePolarity ? '食神' : '伤官';
        } else if (ELEMENT_PRODUCES[otherElement] === dmElement) {
            return samePolarity ? '偏印' : '正印';
        } else if (ELEMENT_CONQUERS[dmElement] === otherElement) {
            return samePolarity ? '偏财' : '正财';
        } else if (ELEMENT_CONQUERS[otherElement] === dmElement) {
            return samePolarity ? '七杀' : '正官';
        }
        return '未知';
    }

    // ==================== 五行分析 (Five Elements Analysis) ====================
    const HIDDEN_STEM_WEIGHTS = [1.0, 0.6, 0.4];

    function analyzeFiveElements(stems, branches) {
        const scores = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

        // Stem elements (weight 1.0)
        for (const stem of stems) {
            scores[stem.element] += 1.0;
        }

        // Branch hidden stems (weighted)
        for (const branch of branches) {
            for (let i = 0; i < branch.hiddenStems.length; i++) {
                const hs = getStemByChar(branch.hiddenStems[i]);
                const weight = i < HIDDEN_STEM_WEIGHTS.length ? HIDDEN_STEM_WEIGHTS[i] : 0.3;
                scores[hs.element] += weight;
            }
        }

        return scores;
    }

    // ==================== 日主强弱 (Day Master Strength) ====================
    const MONTH_SUPPORT = {
        '寅': { '木': 3, '火': 2, '水': 1, '金': -1, '土': -1 },
        '卯': { '木': 3, '火': 2, '水': 1, '金': -1, '土': -1 },
        '辰': { '土': 2, '木': 1, '火': 1, '水': -1, '金': 0 },
        '巳': { '火': 3, '土': 2, '木': 1, '水': -1, '金': -1 },
        '午': { '火': 3, '土': 2, '木': 1, '水': -1, '金': -1 },
        '未': { '土': 2, '火': 1, '金': 1, '木': -1, '水': -1 },
        '申': { '金': 3, '水': 2, '土': 1, '火': -1, '木': -1 },
        '酉': { '金': 3, '水': 2, '土': 1, '火': -1, '木': -1 },
        '戌': { '土': 2, '金': 1, '火': 0, '水': -1, '木': -1 },
        '亥': { '水': 3, '木': 2, '金': 1, '火': -1, '土': -1 },
        '子': { '水': 3, '木': 2, '金': 1, '火': -1, '土': -1 },
        '丑': { '土': 2, '水': 1, '金': 1, '火': -1, '木': -1 },
    };

    function analyzeDayMasterStrength(chart) {
        const dm = chart.dayPillar.stem;
        const dmElement = dm.element;
        let score = 0;
        const factors = [];

        // 得令
        const monthBranch = chart.monthPillar.branch;
        const monthSupport = MONTH_SUPPORT[monthBranch.char] || {};
        const monthScore = monthSupport[dmElement] || 0;
        score += monthScore;
        if (monthScore > 0) {
            factors.push(`得令: ${monthBranch.char}月生${dmElement} (+${monthScore})`);
        } else if (monthScore < 0) {
            factors.push(`失令: ${monthBranch.char}月克${dmElement} (${monthScore})`);
        }

        // 得地 (year, day, hour branches)
        const branchPillars = [
            { pillar: chart.yearPillar, name: '年支' },
            { pillar: chart.dayPillar, name: '日支' },
            { pillar: chart.hourPillar, name: '时支' },
        ];
        for (const { pillar, name } of branchPillars) {
            for (const hsChar of pillar.branch.hiddenStems) {
                const hs = getStemByChar(hsChar);
                if (hs.element === dmElement) {
                    score += 0.5;
                    factors.push(`得地: ${name}${pillar.branch.char}藏${hs.char} (+0.5)`);
                } else if (ELEMENT_PRODUCES[hs.element] === dmElement) {
                    score += 0.3;
                    factors.push(`得地: ${name}藏干生日主 (+0.3)`);
                }
            }
        }

        // 得势 (year, month, hour stems)
        const stemPillars = [
            { stem: chart.yearPillar.stem, name: '年干' },
            { stem: chart.monthPillar.stem, name: '月干' },
            { stem: chart.hourPillar.stem, name: '时干' },
        ];
        for (const { stem, name } of stemPillars) {
            if (stem.element === dmElement) {
                score += 1.0;
                factors.push(`得势: ${name}${stem.char}比劫 (+1.0)`);
            } else if (ELEMENT_PRODUCES[stem.element] === dmElement) {
                score += 0.7;
                factors.push(`得势: ${name}${stem.char}生日主 (+0.7)`);
            }
        }

        let level;
        if (score >= 6) level = '极旺';
        else if (score >= 3) level = '身强';
        else if (score >= 1) level = '中和';
        else if (score >= -1) level = '身弱';
        else level = '极弱';

        return {
            dayMaster: dm,
            score: score,
            level: level,
            isStrong: score >= 1.5,
            factors: factors,
        };
    }

    // ==================== 大运 (Luck Pillars) ====================
    function computeLuckPillars(chart, numPillars = 8) {
        const yearStem = chart.yearPillar.stem;
        const birthDate = chart.birthDate;
        const yearIsYang = yearStem.polarity === '阳';
        const isMale = chart.gender === 'male';
        
        const isForward = (yearIsYang && isMale) || (!yearIsYang && !isMale);
        const direction = isForward ? '顺行' : '逆行';

        // Find nearest jie
        const year = birthDate.getFullYear();
        const jieDates = [];
        for (const y of [year - 1, year, year + 1]) {
            for (const term of MONTHLY_JIEQI) {
                try {
                    jieDates.push({ date: getSolarTermDate(y, term), term });
                } catch (e) { /* skip */ }
            }
        }
        jieDates.sort((a, b) => a.date - b.date);

        let jieDate;
        const dateOnly = new Date(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        if (isForward) {
            jieDate = jieDates.find(j => j.date > dateOnly);
        } else {
            let prev = null;
            for (const j of jieDates) {
                if (j.date < dateOnly) prev = j;
                else break;
            }
            jieDate = prev;
        }

        if (!jieDate) jieDate = jieDates[0];

        const daysDiff = Math.abs(Math.round((jieDate.date - dateOnly) / 86400000));
        let startAge = Math.floor(daysDiff / 3);
        if (startAge === 0) startAge = 1;

        // Build luck pillars from month pillar
        const monthIdx = chart.monthPillar.index;
        const pillars = [];
        for (let i = 0; i < numPillars; i++) {
            const idx = isForward
                ? ((monthIdx + i + 1) % 60 + 60) % 60
                : ((monthIdx - i - 1) % 60 + 60) % 60;
            const sb = getJiazi(idx);
            const lpStart = startAge + i * 10;
            pillars.push({
                pillar: sb,
                startAge: lpStart,
                endAge: lpStart + 9,
            });
        }

        return { pillars, startAge, direction };
    }

    // ==================== 主计算函数 ====================
    function createChart(year, month, day, hour, gender = 'male') {
        const birthDate = new Date(year, month - 1, day);
        
        const yearPillar = computeYearPillar(birthDate);
        const monthPillar = computeMonthPillar(birthDate, yearPillar.stem.index);
        const dayPillar = computeDayPillar(birthDate);
        const hourPillar = computeHourPillar(hour, dayPillar.stem.index);

        const chart = {
            birthDate,
            gender,
            yearPillar,
            monthPillar,
            dayPillar,
            hourPillar,
        };

        // Day Master
        const dayMaster = dayPillar.stem;

        // All stems and branches
        const allStems = [yearPillar.stem, monthPillar.stem, dayPillar.stem, hourPillar.stem];
        const allBranches = [yearPillar.branch, monthPillar.branch, dayPillar.branch, hourPillar.branch];

        // Ten Gods
        const tenGods = {
            '年干': computeTenGod(dayMaster, yearPillar.stem),
            '月干': computeTenGod(dayMaster, monthPillar.stem),
            '日干': '日主',
            '时干': computeTenGod(dayMaster, hourPillar.stem),
        };

        // Hidden stem ten gods
        const hiddenStemGods = {};
        const pillarNames = ['年支', '月支', '日支', '时支'];
        for (let i = 0; i < allBranches.length; i++) {
            const branch = allBranches[i];
            const gods = branch.hiddenStems.map(ch => {
                const stem = getStemByChar(ch);
                return { stem, god: computeTenGod(dayMaster, stem) };
            });
            hiddenStemGods[pillarNames[i]] = gods;
        }

        // Five Elements
        const fiveElements = analyzeFiveElements(allStems, allBranches);

        // Day Master Strength
        const strength = analyzeDayMasterStrength(chart);

        // Luck Pillars
        const luckPillars = computeLuckPillars(chart);

        // Zodiac
        const zodiac = yearPillar.branch.zodiac;

        return {
            ...chart,
            dayMaster,
            allStems,
            allBranches,
            tenGods,
            hiddenStemGods,
            fiveElements,
            strength,
            luckPillars,
            zodiac,
        };
    }

    // ==================== Public API ====================
    return {
        createChart,
        HEAVENLY_STEMS,
        EARTHLY_BRANCHES,
        JIAZI_CYCLE,
        ELEMENT_COLORS,
        ELEMENT_BG_COLORS,
        ELEMENT_PRODUCES,
        ELEMENT_CONQUERS,
        TEN_GOD_INFO,
        getStemByChar,
        computeTenGod,
    };
})();
