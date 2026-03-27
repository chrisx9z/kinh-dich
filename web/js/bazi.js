/**
 * bazi.js — 八字四柱排盘 (BaZi Four-Pillar Chart) JavaScript Port
 *
 * Ports the Python tianji.bazi package to browser-side JavaScript.
 * Depends on the `Calendar` global from calendar.js for stems, branches,
 * the 60-cycle, stem_relationship, solar terms, and hidden stems.
 *
 * Usage:
 *   const chart = BaZi.createChart(1990, 3, 15, 10, 'male');
 *   const tenGods = BaZi.tenGodsFromChart(chart);
 *   const elements = BaZi.analyzeFiveElements(chart.allStems, chart.allBranches);
 *   const strength = BaZi.analyzeDayMasterStrength(chart);
 *   const luck = BaZi.computeLuckPillars(chart);
 *   const flow = BaZi.computeFlowYears(chart, 2024, 10);
 *   const rels = BaZi.analyzeRelationships(chart.allBranches);
 */
const BaZi = (function () {
  'use strict';

  // ────────────────────────────────────────────────────────────────
  // Helpers — shorthand access to Calendar globals
  // ────────────────────────────────────────────────────────────────

  /** Safely resolve the Calendar global (allows late binding). */
  function _C() {
    if (typeof Calendar === 'undefined') {
      throw new Error('BaZi: Calendar global not found. Load calendar.js first.');
    }
    return Calendar;
  }

  // ────────────────────────────────────────────────────────────────
  // 五虎遁月法 (Five Tiger Month Derivation)
  // Maps year-stem index (mod 5) → starting stem index for 寅月
  // 甲/己年→丙寅(2), 乙/庚年→戊寅(4), 丙/辛年→庚寅(6),
  // 丁/壬年→壬寅(8), 戊/癸年→甲寅(0)
  // ────────────────────────────────────────────────────────────────
  var WUHU_TABLE = { 0: 2, 1: 4, 2: 6, 3: 8, 4: 0 };

  // ────────────────────────────────────────────────────────────────
  // 五鼠遁时法 (Five Rat Hour Derivation)
  // Maps day-stem index (mod 5) → starting stem index for 子时
  // 甲/己日→甲子(0), 乙/庚日→丙子(2), 丙/辛日→戊子(4),
  // 丁/壬日→庚子(6), 戊/癸日→壬子(8)
  // ────────────────────────────────────────────────────────────────
  var WUSHU_TABLE = { 0: 0, 1: 2, 2: 4, 3: 6, 4: 8 };

  // ────────────────────────────────────────────────────────────────
  // Monthly branch indices: 寅(2)→丑(1) — month 1..12 maps to branch index
  // ────────────────────────────────────────────────────────────────
  var MONTH_BRANCH_INDICES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];

  // 12 monthly 节 (jié) in standard order (each marks start of a BaZi month)
  var MONTHLY_JIEQI = [
    '立春', '惊蛰', '清明', '立夏', '芒种', '小暑',
    '立秋', '白露', '寒露', '立冬', '大雪', '小寒'
  ];

  // ════════════════════════════════════════════════════════════════
  //  Four Pillar Calculation — 四柱计算
  // ════════════════════════════════════════════════════════════════

  /**
   * computeYearPillar — 年柱
   *
   * Year changes at 立春 (Start of Spring), NOT Jan 1.
   * Formula: (year - 4) % 60 → index into 六十甲子.
   *
   * @param {Date} date  JavaScript Date object
   * @returns {{ stemIndex: number, branchIndex: number, char: string, jiaziIndex: number }}
   */
  function computeYearPillar(date) {
    var C = _C();
    var year = date.getFullYear();

    // 立春 date for this year (from Calendar)
    var lichun = C.getLiChunDate(year);

    // If before 立春 this year, the BaZi year is previous year
    if (date < lichun) {
      year -= 1;
    }

    var idx = ((year - 4) % 60 + 60) % 60; // ensure positive
    var stemIdx = idx % 10;
    var branchIdx = idx % 12;
    return {
      stemIndex: stemIdx,
      branchIndex: branchIdx,
      char: C.STEMS[stemIdx] + C.BRANCHES[branchIdx],
      jiaziIndex: idx
    };
  }

  /**
   * computeMonthPillar — 月柱 (uses 五虎遁月法)
   *
   * The BaZi month is determined by which 节 the date falls after.
   * Stem is derived from the year stem via the WUHU table.
   *
   * @param {Date} date
   * @param {number} yearStemIndex  0–9, the stem index of the year pillar
   * @returns {{ stemIndex: number, branchIndex: number, char: string, jiaziIndex: number }}
   */
  function computeMonthPillar(date, yearStemIndex) {
    var C = _C();

    // Determine which BaZi month the date falls in
    var branchIdx = _determineMonthBranch(date);

    // 五虎遁月: base stem for 寅月
    var baseStem = WUHU_TABLE[yearStemIndex % 5];

    // Offset = position of branchIdx in MONTH_BRANCH_INDICES
    var monthOffset = MONTH_BRANCH_INDICES.indexOf(branchIdx);
    if (monthOffset === -1) monthOffset = 0;

    var stemIdx = (baseStem + monthOffset) % 10;
    var jiaziIdx = _stemBranchToJiazi(stemIdx, branchIdx);

    return {
      stemIndex: stemIdx,
      branchIndex: branchIdx,
      char: C.STEMS[stemIdx] + C.BRANCHES[branchIdx],
      jiaziIndex: jiaziIdx
    };
  }

  /**
   * Determine the BaZi month branch index for a date.
   * Scans 节 boundaries in surrounding years to find where the date falls.
   * @private
   */
  function _determineMonthBranch(date) {
    var C = _C();
    var year = date.getFullYear();
    var boundaries = [];

    // Gather 节 boundaries for year-1, year, year+1
    for (var dy = -1; dy <= 1; dy++) {
      var y = year + dy;
      for (var mi = 0; mi < MONTHLY_JIEQI.length; mi++) {
        try {
          var termDate = C.getSolarTermDate(y, MONTHLY_JIEQI[mi]);
          if (termDate) {
            boundaries.push({ date: termDate, branchIdx: MONTH_BRANCH_INDICES[mi] });
          }
        } catch (e) { /* skip */ }
      }
    }

    // Sort ascending
    boundaries.sort(function (a, b) { return a.date - b.date; });

    // Find the latest boundary <= date
    var currentBranch = 1; // default 丑月
    for (var i = 0; i < boundaries.length; i++) {
      if (date >= boundaries[i].date) {
        currentBranch = boundaries[i].branchIdx;
      } else {
        break;
      }
    }
    return currentBranch;
  }

  /**
   * computeDayPillar — 日柱
   *
   * Reference: 1900-01-01 = 甲子 (index 0 in the 60-cycle).
   *
   * @param {Date} date
   * @returns {{ stemIndex: number, branchIndex: number, char: string, jiaziIndex: number }}
   */
  function computeDayPillar(date) {
    var C = _C();

    // Reference date: 1900-01-01 = index 0
    var refDate = new Date(1900, 0, 1); // month is 0-based in JS
    var diffMs = date.getTime() - refDate.getTime();
    var diffDays = Math.floor(diffMs / 86400000);

    var idx = ((diffDays % 60) + 60) % 60;
    var stemIdx = idx % 10;
    var branchIdx = idx % 12;

    return {
      stemIndex: stemIdx,
      branchIndex: branchIdx,
      char: C.STEMS[stemIdx] + C.BRANCHES[branchIdx],
      jiaziIndex: idx
    };
  }

  /**
   * computeHourPillar — 时柱 (uses 五鼠遁时法)
   *
   * 子时 = 23:00–01:00, 丑时 = 01:00–03:00, ...
   *
   * @param {number} hour       Clock hour 0–23
   * @param {number} dayStemIndex  0–9, the stem index of the day pillar
   * @returns {{ stemIndex: number, branchIndex: number, char: string, jiaziIndex: number }}
   */
  function computeHourPillar(hour, dayStemIndex) {
    var C = _C();

    // Map clock hour → branch index (双时辰)
    var branchIdx;
    if (hour === 23) {
      branchIdx = 0; // 子时
    } else {
      branchIdx = Math.floor((hour + 1) / 2);
    }

    // 五鼠遁时: base stem for 子时
    var baseStem = WUSHU_TABLE[dayStemIndex % 5];
    var stemIdx = (baseStem + branchIdx) % 10;
    var jiaziIdx = _stemBranchToJiazi(stemIdx, branchIdx);

    return {
      stemIndex: stemIdx,
      branchIndex: branchIdx,
      char: C.STEMS[stemIdx] + C.BRANCHES[branchIdx],
      jiaziIndex: jiaziIdx
    };
  }

  /**
   * Find the 60-cycle index for a given stem/branch combination.
   * @private
   */
  function _stemBranchToJiazi(stemIdx, branchIdx) {
    // In the 60-cycle, index i has stem i%10 and branch i%12.
    // Solve: i ≡ stemIdx (mod 10) AND i ≡ branchIdx (mod 12), 0 ≤ i < 60
    for (var i = 0; i < 60; i++) {
      if (i % 10 === stemIdx && i % 12 === branchIdx) return i;
    }
    return 0; // should never happen for valid pairs
  }

  /**
   * createChart — build a complete BaZi four-pillar chart.
   *
   * @param {number} year    Gregorian birth year
   * @param {number} month   Birth month 1–12
   * @param {number} day     Birth day 1–31
   * @param {number} hour    Birth hour 0–23 (default 12)
   * @param {string} gender  "male" or "female" (default "male")
   * @returns {object} Chart object with yearPillar, monthPillar, dayPillar, hourPillar, etc.
   */
  function createChart(year, month, day, hour, gender) {
    if (hour === undefined || hour === null) hour = 12;
    if (!gender) gender = 'male';

    var C = _C();
    var dt = new Date(year, month - 1, day, hour);

    var yearP = computeYearPillar(dt);
    var monthP = computeMonthPillar(dt, yearP.stemIndex);
    var dayP = computeDayPillar(dt);
    var hourP = computeHourPillar(hour, dayP.stemIndex);

    var dayMasterIdx = dayP.stemIndex;

    return {
      birthDatetime: dt,
      gender: gender,
      yearPillar: yearP,
      monthPillar: monthP,
      dayPillar: dayP,
      hourPillar: hourP,
      dayMasterIndex: dayMasterIdx,
      dayMaster: C.STEMS[dayMasterIdx],

      /** All four stem indices. */
      get allStems() {
        return [yearP.stemIndex, monthP.stemIndex, dayP.stemIndex, hourP.stemIndex];
      },
      /** All four branch indices. */
      get allBranches() {
        return [yearP.branchIndex, monthP.branchIndex, dayP.branchIndex, hourP.branchIndex];
      },
      /** All four pillars as an array. */
      get pillars() {
        return [yearP, monthP, dayP, hourP];
      }
    };
  }

  // ════════════════════════════════════════════════════════════════
  //  Ten Gods (十神)
  // ════════════════════════════════════════════════════════════════

  /**
   * computeTenGod — compute the Ten God (十神) of `otherStem` relative to Day Master.
   *
   * Uses Calendar.stemRelationship (wraps the element-relationship logic).
   *
   * @param {number} dayMasterIdx  Stem index 0–9 of the Day Master
   * @param {number} otherStemIdx  Stem index 0–9 of the other stem
   * @returns {string}  Chinese Ten-God name (比肩, 劫财, 食神, 伤官, 偏财, 正财, 七杀, 正官, 偏印, 正印)
   */
  function computeTenGod(dayMasterIdx, otherStemIdx) {
    var C = _C();
    return C.stemRelationship(dayMasterIdx, otherStemIdx);
  }

  /**
   * tenGodsFromChart — compute Ten Gods for every stem position in the chart,
   * including hidden stems in each branch (藏干).
   *
   * @param {object} chart  Chart returned by createChart
   * @returns {object}  { "年干": { stemIndex, god }, "月干": ..., "时干": ...,
   *                       "年支藏干": [...], "月支藏干": [...], ... }
   */
  function tenGodsFromChart(chart) {
    var C = _C();
    var dm = chart.dayMasterIndex;
    var result = {};

    // Main stems (年干, 月干, 时干 — skip 日干 as it IS the day master)
    var pillarNames = ['年干', '月干', '日干', '时干'];
    var stemIndices = chart.allStems;
    for (var i = 0; i < 4; i++) {
      if (i === 2) continue; // skip 日干
      result[pillarNames[i]] = {
        stemIndex: stemIndices[i],
        stem: C.STEMS[stemIndices[i]],
        god: computeTenGod(dm, stemIndices[i])
      };
    }

    // Hidden stems for each branch (年支, 月支, 日支, 时支)
    var branchLabels = ['年支藏干', '月支藏干', '日支藏干', '时支藏干'];
    var branchIndices = chart.allBranches;
    for (var b = 0; b < 4; b++) {
      var hidden = C.getHiddenStems(branchIndices[b]);
      if (hidden && hidden.length > 0) {
        var arr = [];
        for (var h = 0; h < hidden.length; h++) {
          arr.push({
            stemIndex: hidden[h],
            stem: C.STEMS[hidden[h]],
            god: computeTenGod(dm, hidden[h])
          });
        }
        result[branchLabels[b]] = arr;
      }
    }

    return result;
  }

  // ════════════════════════════════════════════════════════════════
  //  Five Elements Analysis (五行分析)
  // ════════════════════════════════════════════════════════════════

  /**
   * Hidden-stem weights: main stem = 1.0, middle = 0.6, residual = 0.4
   */
  var HIDDEN_STEM_WEIGHTS = [1.0, 0.6, 0.4];

  /** Element names indexed 0–4: 木火土金水 */
  var ELEMENT_NAMES = ['木', '火', '土', '金', '水'];

  /**
   * analyzeFiveElements — weighted score of Five Elements across stems and branches.
   *
   * Stem elements contribute 1.0 each.
   * Branch hidden stems contribute according to HIDDEN_STEM_WEIGHTS.
   *
   * @param {number[]} stemIndices    Array of stem indices (0–9)
   * @param {number[]} branchIndices  Array of branch indices (0–11)
   * @returns {{ scores: number[], strongest: number, weakest: number, missing: number[] }}
   */
  function analyzeFiveElements(stemIndices, branchIndices) {
    var C = _C();
    var scores = [0, 0, 0, 0, 0]; // 木, 火, 土, 金, 水

    // Stems: each contributes 1.0 to its element
    for (var s = 0; s < stemIndices.length; s++) {
      var el = C.stemElement(stemIndices[s]);
      scores[el] += 1.0;
    }

    // Branches: hidden stems contribute weighted scores
    for (var b = 0; b < branchIndices.length; b++) {
      var hidden = C.getHiddenStems(branchIndices[b]);
      for (var h = 0; h < hidden.length; h++) {
        var w = h < HIDDEN_STEM_WEIGHTS.length ? HIDDEN_STEM_WEIGHTS[h] : 0.3;
        var hel = C.stemElement(hidden[h]);
        scores[hel] += w;
      }
    }

    // Derived stats
    var strongest = 0, weakest = 0;
    var missing = [];
    for (var i = 0; i < 5; i++) {
      if (scores[i] > scores[strongest]) strongest = i;
      if (scores[i] < scores[weakest]) weakest = i;
      if (scores[i] === 0) missing.push(i);
    }

    return {
      scores: scores,
      strongest: strongest,
      weakest: weakest,
      missing: missing,
      /** Formatted summary string. */
      summary: function () {
        var parts = [];
        for (var i = 0; i < 5; i++) {
          parts.push(ELEMENT_NAMES[i] + ':' + scores[i].toFixed(1));
        }
        return parts.join('  ');
      }
    };
  }

  // ════════════════════════════════════════════════════════════════
  //  Day Master Strength (日主强弱判断)
  // ════════════════════════════════════════════════════════════════

  /**
   * Month support table: for each branch (by character) the support score
   * of each element (木0, 火1, 土2, 金3, 水4).
   *
   * Positive = supportive (旺/相), negative = suppressive (囚/死).
   */
  var MONTH_SUPPORT = {
    // 寅卯 — Spring (Wood旺)
    '寅': [3, 2, -1, -1, 1],
    '卯': [3, 2, -1, -1, 1],
    // 辰 — Earth旺 (transitional)
    '辰': [1, 1, 2, 0, -1],
    // 巳午 — Summer (Fire旺)
    '巳': [1, 3, 2, -1, -1],
    '午': [1, 3, 2, -1, -1],
    // 未 — Earth旺
    '未': [-1, 1, 2, 1, -1],
    // 申酉 — Autumn (Metal旺)
    '申': [-1, -1, 1, 3, 2],
    '酉': [-1, -1, 1, 3, 2],
    // 戌 — Earth旺
    '戌': [-1, 0, 2, 1, -1],
    // 亥子 — Winter (Water旺)
    '亥': [2, -1, -1, 1, 3],
    '子': [2, -1, -1, 1, 3],
    // 丑 — Earth旺
    '丑': [-1, -1, 2, 1, 1]
  };

  /** Strength level labels. */
  var STRENGTH_LEVELS = {
    VERY_STRONG: '极旺',
    STRONG: '身强',
    NEUTRAL: '中和',
    WEAK: '身弱',
    VERY_WEAK: '极弱'
  };

  /**
   * analyzeDayMasterStrength — determine Day Master strength.
   *
   * Factors:
   *   1. 得令 — month branch support
   *   2. 得地 — hidden stems in year/day/hour branches
   *   3. 得势 — year/month/hour stem support
   *
   * @param {object} chart  Chart from createChart
   * @returns {{ score: number, level: string, isStrong: boolean, factors: string[] }}
   */
  function analyzeDayMasterStrength(chart) {
    var C = _C();
    var dmElement = C.stemElement(chart.dayMasterIndex);
    var score = 0;
    var factors = [];

    // 1. 得令 — Month branch support
    var monthBranchChar = C.BRANCHES[chart.monthPillar.branchIndex];
    var support = MONTH_SUPPORT[monthBranchChar];
    if (support) {
      var monthScore = support[dmElement];
      score += monthScore;
      if (monthScore > 0) {
        factors.push('得令: ' + monthBranchChar + '月生' + ELEMENT_NAMES[dmElement] + ' (+' + monthScore + ')');
      } else if (monthScore < 0) {
        factors.push('失令: ' + monthBranchChar + '月克' + ELEMENT_NAMES[dmElement] + ' (' + monthScore + ')');
      }
    }

    // 2. 得地 — Branch hidden-stem support (year, day, hour — exclude month)
    var branchChecks = [
      { label: '年支', branchIdx: chart.yearPillar.branchIndex },
      { label: '日支', branchIdx: chart.dayPillar.branchIndex },
      { label: '时支', branchIdx: chart.hourPillar.branchIndex }
    ];
    for (var bi = 0; bi < branchChecks.length; bi++) {
      var bCheck = branchChecks[bi];
      var hidden = C.getHiddenStems(bCheck.branchIdx);
      for (var hi = 0; hi < hidden.length; hi++) {
        var hsEl = C.stemElement(hidden[hi]);
        if (hsEl === dmElement) {
          score += 0.5;
          factors.push('得地: ' + bCheck.label + C.BRANCHES[bCheck.branchIdx] +
            '藏' + C.STEMS[hidden[hi]] + '(' + ELEMENT_NAMES[dmElement] + ') (+0.5)');
        } else if (C.elementProduces(hsEl) === dmElement) {
          score += 0.3;
          factors.push('得地: ' + bCheck.label + '藏干生日主 (+0.3)');
        }
      }
    }

    // 3. 得势 — Stem support (year, month, hour)
    var stemChecks = [
      { label: '年干', stemIdx: chart.yearPillar.stemIndex },
      { label: '月干', stemIdx: chart.monthPillar.stemIndex },
      { label: '时干', stemIdx: chart.hourPillar.stemIndex }
    ];
    for (var si = 0; si < stemChecks.length; si++) {
      var sCheck = stemChecks[si];
      var sEl = C.stemElement(sCheck.stemIdx);
      if (sEl === dmElement) {
        score += 1.0;
        factors.push('得势: ' + sCheck.label + C.STEMS[sCheck.stemIdx] + '比劫 (+1.0)');
      } else if (C.elementProduces(sEl) === dmElement) {
        score += 0.7;
        factors.push('得势: ' + sCheck.label + C.STEMS[sCheck.stemIdx] + '生日主 (+0.7)');
      }
    }

    // Determine level
    var level;
    if (score >= 6) level = STRENGTH_LEVELS.VERY_STRONG;
    else if (score >= 3) level = STRENGTH_LEVELS.STRONG;
    else if (score >= 1) level = STRENGTH_LEVELS.NEUTRAL;
    else if (score >= -1) level = STRENGTH_LEVELS.WEAK;
    else level = STRENGTH_LEVELS.VERY_WEAK;

    return {
      score: score,
      level: level,
      isStrong: score >= 1.5,
      factors: factors
    };
  }

  // ════════════════════════════════════════════════════════════════
  //  Luck Pillars (大运)
  // ════════════════════════════════════════════════════════════════

  /**
   * computeLuckPillars — calculate 大运 (10-year fortune cycles).
   *
   * Direction:
   *   male + yang year stem → forward (顺行)
   *   male + yin year stem  → backward (逆行)
   *   female → opposite
   *
   * Start age: days to nearest 节 ÷ 3 (3 days ≈ 1 year).
   *
   * @param {object} chart        Chart from createChart
   * @param {number} [numPillars] Number of pillars to compute (default 8)
   * @returns {{ pillars: object[], startAge: number, direction: string }}
   */
  function computeLuckPillars(chart, numPillars) {
    if (!numPillars) numPillars = 8;
    var C = _C();

    var yearStemIdx = chart.yearPillar.stemIndex;
    var yearIsYang = (yearStemIdx % 2 === 0); // even index = 阳
    var isMale = (chart.gender.toLowerCase() === 'male' || chart.gender === '男');

    // Direction: male+yang or female+yin = forward
    var isForward = (yearIsYang && isMale) || (!yearIsYang && !isMale);
    var direction = isForward ? '顺行' : '逆行';

    // Find nearest 节 boundary
    var birthDate = chart.birthDatetime;
    var jieDate = _findNearestJie(birthDate, isForward);

    // Days difference
    var daysDiff = Math.abs(Math.round((jieDate.getTime() - birthDate.getTime()) / 86400000));

    // Start age: 3 days = 1 year
    var startAge = Math.floor(daysDiff / 3);
    if (startAge === 0) startAge = 1;

    // Build pillars from month pillar's 60-cycle index
    var monthIdx = chart.monthPillar.jiaziIndex;
    var pillars = [];
    for (var i = 0; i < numPillars; i++) {
      var idx;
      if (isForward) {
        idx = ((monthIdx + i + 1) % 60 + 60) % 60;
      } else {
        idx = ((monthIdx - i - 1) % 60 + 60) % 60;
      }
      var stemIdx = idx % 10;
      var branchIdx = idx % 12;
      pillars.push({
        stemIndex: stemIdx,
        branchIndex: branchIdx,
        char: C.STEMS[stemIdx] + C.BRANCHES[branchIdx],
        jiaziIndex: idx,
        startAge: startAge + i * 10,
        endAge: startAge + i * 10 + 9
      });
    }

    return {
      pillars: pillars,
      startAge: startAge,
      direction: direction
    };
  }

  /**
   * Find the nearest monthly 节 (jié) to a birth date.
   * @private
   * @param {Date} birthDate
   * @param {boolean} isForward  true → look for next 节; false → look for previous 节
   * @returns {Date}
   */
  function _findNearestJie(birthDate, isForward) {
    var C = _C();
    var year = birthDate.getFullYear();
    var jieDates = [];

    for (var dy = -1; dy <= 1; dy++) {
      var y = year + dy;
      for (var mi = 0; mi < MONTHLY_JIEQI.length; mi++) {
        try {
          var d = C.getSolarTermDate(y, MONTHLY_JIEQI[mi]);
          if (d) jieDates.push(d);
        } catch (e) { /* skip */ }
      }
    }

    jieDates.sort(function (a, b) { return a - b; });

    if (isForward) {
      for (var i = 0; i < jieDates.length; i++) {
        if (jieDates[i] > birthDate) return jieDates[i];
      }
    } else {
      var prev = null;
      for (var i = 0; i < jieDates.length; i++) {
        if (jieDates[i] < birthDate) {
          prev = jieDates[i];
        } else {
          break;
        }
      }
      if (prev) return prev;
    }

    return jieDates[0]; // fallback
  }

  // ════════════════════════════════════════════════════════════════
  //  Flow Years (流年) — NEW
  // ════════════════════════════════════════════════════════════════

  /**
   * computeFlowYears — calculate yearly stem-branch for a range of years.
   *
   * Each year in the sexagenary cycle: index = (year - 4) % 60.
   *
   * @param {object} chart       Chart from createChart (used for context, e.g., day master)
   * @param {number} startYear   First Gregorian year to compute
   * @param {number} [count]     Number of years (default 10)
   * @returns {object[]}  Array of { year, stemIndex, branchIndex, char, tenGod }
   */
  function computeFlowYears(chart, startYear, count) {
    if (!count) count = 10;
    var C = _C();
    var dm = chart.dayMasterIndex;
    var results = [];

    for (var i = 0; i < count; i++) {
      var y = startYear + i;
      var idx = ((y - 4) % 60 + 60) % 60;
      var stemIdx = idx % 10;
      var branchIdx = idx % 12;
      results.push({
        year: y,
        stemIndex: stemIdx,
        branchIndex: branchIdx,
        char: C.STEMS[stemIdx] + C.BRANCHES[branchIdx],
        jiaziIndex: idx,
        tenGod: computeTenGod(dm, stemIdx)
      });
    }

    return results;
  }

  // ════════════════════════════════════════════════════════════════
  //  Branch Relationships (刑冲合害)
  // ════════════════════════════════════════════════════════════════

  /**
   * Six Harmonies (六合): branch-char pairs that combine into an element.
   * Format: [branch1, branch2, resultElement]
   */
  var SIX_HARMONIES = [
    ['子', '丑', '土'], ['寅', '亥', '木'], ['卯', '戌', '火'],
    ['辰', '酉', '金'], ['巳', '申', '水'], ['午', '未', '火']
  ];

  /**
   * Three Harmonies (三合): triads forming a strong element.
   * Format: [b1, b2, b3, resultElement]
   */
  var THREE_HARMONIES = [
    ['申', '子', '辰', '水'], ['亥', '卯', '未', '木'],
    ['寅', '午', '戌', '火'], ['巳', '酉', '丑', '金']
  ];

  /** Six Conflicts (六冲): opposing branches. */
  var SIX_CONFLICTS = [
    ['子', '午'], ['丑', '未'], ['寅', '申'],
    ['卯', '酉'], ['辰', '戌'], ['巳', '亥']
  ];

  /** Three Punishments (三刑). */
  var THREE_PUNISHMENTS = [
    ['寅', '巳', '申'],   // 无恩之刑
    ['丑', '戌', '未'],   // 持势之刑
    ['子', '卯'],          // 无礼之刑
    ['辰', '辰'],          // 自刑
    ['午', '午'],
    ['酉', '酉'],
    ['亥', '亥']
  ];

  /** Six Harms (六害). */
  var SIX_HARMS = [
    ['子', '未'], ['丑', '午'], ['寅', '巳'],
    ['卯', '辰'], ['申', '亥'], ['酉', '戌']
  ];

  /**
   * analyzeRelationships — check all branch relationship types in a set of branches.
   *
   * @param {number[]} branchIndices  Array of branch indices (0–11)
   * @returns {{ relationships: object[] }}
   */
  function analyzeRelationships(branchIndices) {
    var C = _C();
    var chars = [];
    for (var i = 0; i < branchIndices.length; i++) {
      chars.push(C.BRANCHES[branchIndices[i]]);
    }

    var relationships = [];

    // 六合 (Six Harmonies)
    for (var h = 0; h < SIX_HARMONIES.length; h++) {
      var sh = SIX_HARMONIES[h];
      if (chars.indexOf(sh[0]) !== -1 && chars.indexOf(sh[1]) !== -1) {
        relationships.push({
          kind: '六合',
          branches: [sh[0], sh[1]],
          resultElement: sh[2],
          description: sh[0] + sh[1] + '合' + sh[2]
        });
      }
    }

    // 三合 (Three Harmonies)
    for (var t = 0; t < THREE_HARMONIES.length; t++) {
      var th = THREE_HARMONIES[t];
      var found = [];
      for (var ti = 0; ti < 3; ti++) {
        if (chars.indexOf(th[ti]) !== -1) found.push(th[ti]);
      }
      if (found.length >= 2) {
        relationships.push({
          kind: found.length === 3 ? '三合' : '半三合',
          branches: found,
          resultElement: th[3],
          description: found.join('') + (found.length === 3 ? '三合' : '半合') + th[3] + '局'
        });
      }
    }

    // 六冲 (Six Conflicts)
    for (var c = 0; c < SIX_CONFLICTS.length; c++) {
      var sc = SIX_CONFLICTS[c];
      if (chars.indexOf(sc[0]) !== -1 && chars.indexOf(sc[1]) !== -1) {
        relationships.push({
          kind: '六冲',
          branches: [sc[0], sc[1]],
          description: sc[0] + sc[1] + '相冲'
        });
      }
    }

    // 三刑 (Three Punishments)
    for (var p = 0; p < THREE_PUNISHMENTS.length; p++) {
      var pg = THREE_PUNISHMENTS[p];
      if (pg.length === 3) {
        var pFound = [];
        for (var pi = 0; pi < 3; pi++) {
          if (chars.indexOf(pg[pi]) !== -1) pFound.push(pg[pi]);
        }
        if (pFound.length >= 2) {
          relationships.push({
            kind: '三刑',
            branches: pFound,
            description: pFound.join('') + '相刑'
          });
        }
      } else if (pg.length === 2) {
        if (pg[0] === pg[1]) {
          // Self-punishment (自刑)
          var count = 0;
          for (var ci = 0; ci < chars.length; ci++) {
            if (chars[ci] === pg[0]) count++;
          }
          if (count >= 2) {
            relationships.push({
              kind: '自刑',
              branches: [pg[0], pg[1]],
              description: pg[0] + '自刑'
            });
          }
        } else {
          if (chars.indexOf(pg[0]) !== -1 && chars.indexOf(pg[1]) !== -1) {
            relationships.push({
              kind: '相刑',
              branches: [pg[0], pg[1]],
              description: pg[0] + pg[1] + '相刑'
            });
          }
        }
      }
    }

    // 六害 (Six Harms)
    for (var hr = 0; hr < SIX_HARMS.length; hr++) {
      var shm = SIX_HARMS[hr];
      if (chars.indexOf(shm[0]) !== -1 && chars.indexOf(shm[1]) !== -1) {
        relationships.push({
          kind: '六害',
          branches: [shm[0], shm[1]],
          description: shm[0] + shm[1] + '相害'
        });
      }
    }

    return { branches: chars, relationships: relationships };
  }

  // ════════════════════════════════════════════════════════════════
  //  Public API
  // ════════════════════════════════════════════════════════════════

  return {
    // Four Pillars 四柱
    computeYearPillar: computeYearPillar,
    computeMonthPillar: computeMonthPillar,
    computeDayPillar: computeDayPillar,
    computeHourPillar: computeHourPillar,
    createChart: createChart,

    // Ten Gods 十神
    computeTenGod: computeTenGod,
    tenGodsFromChart: tenGodsFromChart,

    // Five Elements 五行
    analyzeFiveElements: analyzeFiveElements,

    // Day Master Strength 日主强弱
    analyzeDayMasterStrength: analyzeDayMasterStrength,

    // Luck Pillars 大运
    computeLuckPillars: computeLuckPillars,

    // Flow Years 流年
    computeFlowYears: computeFlowYears,

    // Branch Relationships 刑冲合害
    analyzeRelationships: analyzeRelationships,

    // Constants (exposed for testing / advanced use)
    WUHU_TABLE: WUHU_TABLE,
    WUSHU_TABLE: WUSHU_TABLE,
    MONTH_BRANCH_INDICES: MONTH_BRANCH_INDICES,
    ELEMENT_NAMES: ELEMENT_NAMES,
    HIDDEN_STEM_WEIGHTS: HIDDEN_STEM_WEIGHTS,
    STRENGTH_LEVELS: STRENGTH_LEVELS
  };
})();
