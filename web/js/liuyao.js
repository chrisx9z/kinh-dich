/**
 * 六爻占卜算法 (LiuYao Divination Algorithm)
 * 
 * Pure JavaScript implementation of Six Lines divination.
 */

const LiuYao = (() => {
    // ==================== 八卦 (Trigrams) ====================
    const TRIGRAMS = {
        7: { name: '乾', symbol: '☰', lines: 7, element: '金', nature: '天' },
        6: { name: '兑', symbol: '☱', lines: 6, element: '金', nature: '泽' },
        5: { name: '离', symbol: '☲', lines: 5, element: '火', nature: '火' },
        4: { name: '震', symbol: '☳', lines: 4, element: '木', nature: '雷' },
        3: { name: '巽', symbol: '☴', lines: 3, element: '木', nature: '风' },
        2: { name: '坎', symbol: '☵', lines: 2, element: '水', nature: '水' },
        1: { name: '艮', symbol: '☶', lines: 1, element: '土', nature: '山' },
        0: { name: '坤', symbol: '☷', lines: 0, element: '土', nature: '地' },
    };

    // Order for number mapping (先天八卦序)
    const TRIGRAM_ORDER = [7, 6, 5, 4, 3, 2, 1, 0];

    // ==================== 六十四卦 (64 Hexagrams) ====================
    const HEXAGRAM_DATA = [
        [1,'乾','䷀',7,7,'天行健，君子以自强不息'],
        [2,'坤','䷁',0,0,'地势坤，君子以厚德载物'],
        [3,'屯','䷂',2,4,'刚柔始交而难生'],
        [4,'蒙','䷃',1,2,'山下有险，蒙'],
        [5,'需','䷄',2,7,'需，有孚，光亨'],
        [6,'讼','䷅',7,2,'天与水违行，讼'],
        [7,'师','䷆',0,2,'地中有水，师'],
        [8,'比','䷇',2,0,'地上有水，比'],
        [9,'小畜','䷈',3,7,'风行天上，小畜'],
        [10,'履','䷉',7,6,'上天下泽，履'],
        [11,'泰','䷊',0,7,'天地交，泰'],
        [12,'否','䷋',7,0,'天地不交，否'],
        [13,'同人','䷌',7,5,'天与火，同人'],
        [14,'大有','䷍',5,7,'火在天上，大有'],
        [15,'谦','䷎',0,1,'地中有山，谦'],
        [16,'豫','䷏',4,0,'雷出地奋，豫'],
        [17,'随','䷐',6,4,'泽中有雷，随'],
        [18,'蛊','䷑',1,3,'山下有风，蛊'],
        [19,'临','䷒',0,6,'泽上有地，临'],
        [20,'观','䷓',3,0,'风行地上，观'],
        [21,'噬嗑','䷔',5,4,'雷电，噬嗑'],
        [22,'贲','䷕',1,5,'山下有火，贲'],
        [23,'剥','䷖',1,0,'山附于地，剥'],
        [24,'复','䷗',0,4,'雷在地中，复'],
        [25,'无妄','䷘',7,4,'天下雷行，无妄'],
        [26,'大畜','䷙',1,7,'天在山中，大畜'],
        [27,'颐','䷚',1,4,'山下有雷，颐'],
        [28,'大过','䷛',6,3,'泽灭木，大过'],
        [29,'坎','䷜',2,2,'水洊至，习坎'],
        [30,'离','䷝',5,5,'明两作，离'],
        [31,'咸','䷞',6,1,'山上有泽，咸'],
        [32,'恒','䷟',4,3,'雷风，恒'],
        [33,'遁','䷠',7,1,'天下有山，遁'],
        [34,'大壮','䷡',4,7,'雷在天上，大壮'],
        [35,'晋','䷢',5,0,'明出地上，晋'],
        [36,'明夷','䷣',0,5,'明入地中，明夷'],
        [37,'家人','䷤',3,5,'风自火出，家人'],
        [38,'睽','䷥',5,6,'上火下泽，睽'],
        [39,'蹇','䷦',2,1,'山上有水，蹇'],
        [40,'解','䷧',4,2,'雷雨作，解'],
        [41,'损','䷨',1,6,'山下有泽，损'],
        [42,'益','䷩',3,4,'风雷，益'],
        [43,'夬','䷪',6,7,'泽上于天，夬'],
        [44,'姤','䷫',7,3,'天下有风，姤'],
        [45,'萃','䷬',6,0,'泽上于地，萃'],
        [46,'升','䷭',0,3,'地中生木，升'],
        [47,'困','䷮',6,2,'泽无水，困'],
        [48,'井','䷯',2,3,'木上有水，井'],
        [49,'革','䷰',6,5,'泽中有火，革'],
        [50,'鼎','䷱',5,3,'木上有火，鼎'],
        [51,'震','䷲',4,4,'洊雷，震'],
        [52,'艮','䷳',1,1,'兼山，艮'],
        [53,'渐','䷴',3,1,'山上有木，渐'],
        [54,'归妹','䷵',4,6,'泽上有雷，归妹'],
        [55,'丰','䷶',4,5,'雷电皆至，丰'],
        [56,'旅','䷷',5,1,'山上有火，旅'],
        [57,'巽','䷸',3,3,'随风，巽'],
        [58,'兑','䷹',6,6,'丽泽，兑'],
        [59,'涣','䷺',3,2,'风行水上，涣'],
        [60,'节','䷻',2,6,'泽上有水，节'],
        [61,'中孚','䷼',3,6,'泽上有风，中孚'],
        [62,'小过','䷽',4,1,'山上有雷，小过'],
        [63,'既济','䷾',2,5,'水在火上，既济'],
        [64,'未济','䷿',5,2,'火在水上，未济'],
    ];

    // Build hexagram lookup
    const HEXAGRAMS = {};
    const HEXAGRAM_BY_TRIGRAMS = {};
    for (const [num, name, symbol, upper, lower, desc] of HEXAGRAM_DATA) {
        const hex = {
            number: num, name, symbol,
            upper: TRIGRAMS[upper], lower: TRIGRAMS[lower],
            description: desc,
            getLines() {
                const lowerLines = [(lower >> 0) & 1, (lower >> 1) & 1, (lower >> 2) & 1];
                const upperLines = [(upper >> 0) & 1, (upper >> 1) & 1, (upper >> 2) & 1];
                return [...lowerLines, ...upperLines];
            }
        };
        HEXAGRAMS[num] = hex;
        HEXAGRAM_BY_TRIGRAMS[`${upper},${lower}`] = hex;
    }

    function getHexagramByTrigrams(upperCode, lowerCode) {
        return HEXAGRAM_BY_TRIGRAMS[`${upperCode},${lowerCode}`];
    }

    function linesToHexagram(lines) {
        const normalized = lines.map(l => {
            if (l === 6 || l === 0 || l === 8) return 0;
            return 1;
        });
        const lowerCode = normalized[0] | (normalized[1] << 1) | (normalized[2] << 2);
        const upperCode = normalized[3] | (normalized[4] << 1) | (normalized[5] << 2);
        return getHexagramByTrigrams(upperCode, lowerCode);
    }

    // ==================== 世应 (Shi-Ying) positions ====================
    // World (世) and Response (应) line positions for each hexagram type
    // Based on the 八宫 (Eight Palaces) system
    function computeShiYing(hexagram) {
        const lines = hexagram.getLines();
        const upper = hexagram.upper;
        const lower = hexagram.lower;
        
        // Same trigrams (纯卦/八纯卦): 世=6, 应=3
        if (upper.lines === lower.lines) {
            return { shi: 6, ying: 3 };
        }
        
        // Check differing lines from bottom
        let diffCount = 0;
        for (let i = 0; i < 3; i++) {
            const lowerLine = (lower.lines >> i) & 1;
            const upperLine = (upper.lines >> i) & 1;
            if (lowerLine !== upperLine) diffCount++;
        }

        // Simplified shi-ying based on the palace system
        // This is an approximation; full implementation needs 八宫归属
        const shiMap = { 1: 1, 2: 2, 3: 3 };
        let shi = shiMap[diffCount] || 4;
        let ying = ((shi - 1 + 3) % 6) + 1;
        
        // Ensure shi != ying
        if (shi === ying) ying = (shi % 6) + 1;

        return { shi, ying };
    }

    // ==================== 起卦方法 (Casting Methods) ====================

    /**
     * Process raw lines into primary/changed hexagrams
     */
    function processLines(rawLines) {
        // Primary hexagram
        const primaryLines = rawLines.map(l => {
            if (l === 6 || l === 8) return 0; // Yin
            return 1; // Yang
        });
        const primary = linesToHexagram(primaryLines);

        // Moving lines
        const movingLines = [];
        for (let i = 0; i < rawLines.length; i++) {
            if (rawLines[i] === 6 || rawLines[i] === 7) {
                movingLines.push(i + 1);
            }
        }

        // Changed hexagram
        let changed = null;
        if (movingLines.length > 0) {
            const changedLines = rawLines.map(l => {
                if (l === 6) return 1;  // Old Yin → Yang
                if (l === 7) return 0;  // Old Yang → Yin
                if (l === 8) return 0;  // Young Yin stays
                return 1;              // Young Yang stays
            });
            changed = linesToHexagram(changedLines);
        }

        const shiYing = computeShiYing(primary);

        return {
            primary,
            changed,
            rawLines,
            movingLines,
            shiYing,
        };
    }

    /**
     * 时间起卦 (Time-based casting)
     */
    function castByTime(dt = null) {
        if (!dt) dt = new Date();
        
        const year = dt.getFullYear();
        const month = dt.getMonth() + 1;
        const day = dt.getDate();
        const hour = dt.getHours();
        const total = year + month + day + hour;

        const upperIdx = (year + month + day) % 8;
        const lowerIdx = total % 8;
        const movingPos = total % 6 + 1;

        const upperCode = TRIGRAM_ORDER[upperIdx];
        const lowerCode = TRIGRAM_ORDER[lowerIdx];

        // Build raw lines
        const rawLines = [];
        for (let i = 0; i < 3; i++) {
            rawLines.push(((lowerCode >> i) & 1) ? 9 : 8);
        }
        for (let i = 0; i < 3; i++) {
            rawLines.push(((upperCode >> i) & 1) ? 9 : 8);
        }

        // Apply moving line
        const mlIdx = movingPos - 1;
        rawLines[mlIdx] = rawLines[mlIdx] === 9 ? 7 : 6;

        const result = processLines(rawLines);
        return { ...result, method: '时间起卦', input: { datetime: dt.toISOString() } };
    }

    /**
     * 数字起卦 (Number-based casting)
     */
    function castByNumbers(num1, num2, num3 = null) {
        const upperIdx = num1 % 8;
        const lowerIdx = num2 % 8;
        const movingPos = (num3 !== null ? num3 : (num1 + num2)) % 6 + 1;

        const upperCode = TRIGRAM_ORDER[upperIdx];
        const lowerCode = TRIGRAM_ORDER[lowerIdx];

        const rawLines = [];
        for (let i = 0; i < 3; i++) {
            rawLines.push(((lowerCode >> i) & 1) ? 9 : 8);
        }
        for (let i = 0; i < 3; i++) {
            rawLines.push(((upperCode >> i) & 1) ? 9 : 8);
        }

        const mlIdx = movingPos - 1;
        rawLines[mlIdx] = rawLines[mlIdx] === 9 ? 7 : 6;

        const result = processLines(rawLines);
        return { ...result, method: '数字起卦', input: { num1, num2, num3 } };
    }

    /**
     * 铜钱摇卦 (Coin-based casting)
     * Returns one line per shake
     */
    function shakeCoins() {
        // 3 coins: heads=3, tails=2
        const coins = [
            Math.random() < 0.5 ? 2 : 3,
            Math.random() < 0.5 ? 2 : 3,
            Math.random() < 0.5 ? 2 : 3,
        ];
        const total = coins[0] + coins[1] + coins[2]; // 6,7,8,9
        return { coins, total };
    }

    function castByCoins(results) {
        // results: array of 6 totals (6/7/8/9)
        const rawLines = results.map(r => r);
        const result = processLines(rawLines);
        return { ...result, method: '铜钱摇卦', input: { results } };
    }

    // ==================== Public API ====================
    return {
        TRIGRAMS,
        HEXAGRAMS,
        castByTime,
        castByNumbers,
        castByCoins,
        shakeCoins,
        processLines,
        getHexagramByTrigrams,
        computeShiYing,
    };
})();
