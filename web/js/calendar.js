/**
 * tianji/calendar — 干支历法引擎 (Stem-Branch Calendar Engine)
 *
 * JavaScript port of the Python tianji.calendar package.
 *
 * Provides:
 *   - 天干 (Heavenly Stems): 甲乙丙丁戊己庚辛壬癸
 *   - 地支 (Earthly Branches): 子丑寅卯辰巳午未申酉戌亥
 *   - 干支 (Stem-Branch pairs): 六十甲子 cycle
 *   - 24节气 (Solar Terms) approximate calculation
 *   - 农历 (Lunar Calendar) via compressed lookup table
 *
 * Module pattern (IIFE) — exposes a single `Calendar` global.
 */
const Calendar = (function () {
  "use strict";

  // ────────────────────────────────────────────────────────────────────────
  // Five Elements (五行)
  // ────────────────────────────────────────────────────────────────────────

  var ELEMENTS = ["木", "火", "土", "金", "水"];

  /** 相生 — generation / production cycle */
  var ELEMENT_PRODUCES = {
    "木": "火",
    "火": "土",
    "土": "金",
    "金": "水",
    "水": "木"
  };

  /** 相克 — conquest / destruction cycle */
  var ELEMENT_CONQUERS = {
    "木": "土",
    "土": "水",
    "水": "火",
    "火": "金",
    "金": "木"
  };

  // ────────────────────────────────────────────────────────────────────────
  // Heavenly Stems (天干)
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Each stem: { char, index, element, polarity }
   * polarity: "阳" (yang) or "阴" (yin)
   */
  var STEMS = [
    { char: "甲", index: 0, element: "木", polarity: "阳" },
    { char: "乙", index: 1, element: "木", polarity: "阴" },
    { char: "丙", index: 2, element: "火", polarity: "阳" },
    { char: "丁", index: 3, element: "火", polarity: "阴" },
    { char: "戊", index: 4, element: "土", polarity: "阳" },
    { char: "己", index: 5, element: "土", polarity: "阴" },
    { char: "庚", index: 6, element: "金", polarity: "阳" },
    { char: "辛", index: 7, element: "金", polarity: "阴" },
    { char: "壬", index: 8, element: "水", polarity: "阳" },
    { char: "癸", index: 9, element: "水", polarity: "阴" }
  ];

  /** Lookup map: char → stem object */
  var _stemByChar = {};
  STEMS.forEach(function (s) { _stemByChar[s.char] = s; });

  function getStem(index) {
    return STEMS[((index % 10) + 10) % 10];
  }

  function getStemByChar(ch) {
    if (!_stemByChar[ch]) { throw new Error("Unknown heavenly stem: " + ch); }
    return _stemByChar[ch];
  }

  // ────────────────────────────────────────────────────────────────────────
  // Earthly Branches (地支)
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Each branch: { char, index, element, polarity, zodiac, hourRange, hiddenStems }
   * hiddenStems is an array of stem characters (藏干).
   */
  var BRANCHES = [
    { char: "子", index: 0,  element: "水", polarity: "阳", zodiac: "鼠", hourRange: "23:00-01:00", hiddenStems: ["癸"] },
    { char: "丑", index: 1,  element: "土", polarity: "阴", zodiac: "牛", hourRange: "01:00-03:00", hiddenStems: ["己", "癸", "辛"] },
    { char: "寅", index: 2,  element: "木", polarity: "阳", zodiac: "虎", hourRange: "03:00-05:00", hiddenStems: ["甲", "丙", "戊"] },
    { char: "卯", index: 3,  element: "木", polarity: "阴", zodiac: "兔", hourRange: "05:00-07:00", hiddenStems: ["乙"] },
    { char: "辰", index: 4,  element: "土", polarity: "阳", zodiac: "龙", hourRange: "07:00-09:00", hiddenStems: ["戊", "乙", "癸"] },
    { char: "巳", index: 5,  element: "火", polarity: "阴", zodiac: "蛇", hourRange: "09:00-11:00", hiddenStems: ["丙", "庚", "戊"] },
    { char: "午", index: 6,  element: "火", polarity: "阳", zodiac: "马", hourRange: "11:00-13:00", hiddenStems: ["丁", "己"] },
    { char: "未", index: 7,  element: "土", polarity: "阴", zodiac: "羊", hourRange: "13:00-15:00", hiddenStems: ["己", "丁", "乙"] },
    { char: "申", index: 8,  element: "金", polarity: "阳", zodiac: "猴", hourRange: "15:00-17:00", hiddenStems: ["庚", "壬", "戊"] },
    { char: "酉", index: 9,  element: "金", polarity: "阴", zodiac: "鸡", hourRange: "17:00-19:00", hiddenStems: ["辛"] },
    { char: "戌", index: 10, element: "土", polarity: "阳", zodiac: "狗", hourRange: "19:00-21:00", hiddenStems: ["戊", "辛", "丁"] },
    { char: "亥", index: 11, element: "水", polarity: "阴", zodiac: "猪", hourRange: "21:00-23:00", hiddenStems: ["壬", "甲"] }
  ];

  var _branchByChar = {};
  BRANCHES.forEach(function (b) { _branchByChar[b.char] = b; });

  function getBranch(index) {
    return BRANCHES[((index % 12) + 12) % 12];
  }

  function getBranchByChar(ch) {
    if (!_branchByChar[ch]) { throw new Error("Unknown earthly branch: " + ch); }
    return _branchByChar[ch];
  }

  /**
   * Get the earthly branch for a clock hour (0-23).
   * 子 23,0 | 丑 1,2 | 寅 3,4 | … | 亥 21,22
   */
  function getBranchForHour(hour) {
    if (hour === 23) { return BRANCHES[0]; }
    return BRANCHES[Math.floor((hour + 1) / 2)];
  }

  /**
   * Return the hidden stem objects for a branch.
   */
  function getHiddenStems(branch) {
    return branch.hiddenStems.map(function (ch) { return getStemByChar(ch); });
  }

  // ────────────────────────────────────────────────────────────────────────
  // Branch relationships
  // ────────────────────────────────────────────────────────────────────────

  /** 六合 — Six Harmonies (pairs that combine) */
  var SIX_HARMONIES = [
    { a: "子", b: "丑", element: "土" },
    { a: "寅", b: "亥", element: "木" },
    { a: "卯", b: "戌", element: "火" },
    { a: "辰", b: "酉", element: "金" },
    { a: "巳", b: "申", element: "水" },
    { a: "午", b: "未", element: "火" }
  ];

  /** 三合 — Three Harmonies (triads) */
  var THREE_HARMONIES = [
    { a: "申", b: "子", c: "辰", element: "水" },
    { a: "亥", b: "卯", c: "未", element: "木" },
    { a: "寅", b: "午", c: "戌", element: "火" },
    { a: "巳", b: "酉", c: "丑", element: "金" }
  ];

  /** 六冲 — Six Conflicts (opposing branches) */
  var SIX_CONFLICTS = [
    ["子", "午"], ["丑", "未"], ["寅", "申"],
    ["卯", "酉"], ["辰", "戌"], ["巳", "亥"]
  ];

  /** 三刑 — Three Punishments */
  var THREE_PUNISHMENTS = [
    ["寅", "巳", "申"],   // 无恩之刑
    ["丑", "戌", "未"],   // 持势之刑
    ["子", "卯"],          // 无礼之刑
    ["辰", "辰"],          // 自刑
    ["午", "午"],
    ["酉", "酉"],
    ["亥", "亥"]
  ];

  /** 六害 — Six Harms */
  var SIX_HARMS = [
    ["子", "未"], ["丑", "午"], ["寅", "巳"],
    ["卯", "辰"], ["申", "亥"], ["酉", "戌"]
  ];

  // ────────────────────────────────────────────────────────────────────────
  // Ten Gods (十神) — stem relationship
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Compute the relationship of `other` stem relative to Day Master `dm`.
   * Returns the Chinese name of the Ten God (十神).
   *
   * @param {object} dm    — Day Master stem object
   * @param {object} other — Another stem object
   * @returns {string} Ten God name
   */
  function stemRelationship(dm, other) {
    var sameElement  = dm.element === other.element;
    var samePolarity = dm.polarity === other.polarity;
    var dmProduces   = ELEMENT_PRODUCES[dm.element] === other.element;
    var producesDm   = ELEMENT_PRODUCES[other.element] === dm.element;
    var dmConquers   = ELEMENT_CONQUERS[dm.element] === other.element;
    var conquersDm   = ELEMENT_CONQUERS[other.element] === dm.element;

    if (sameElement)  { return samePolarity ? "比肩" : "劫财"; }
    if (dmProduces)   { return samePolarity ? "食神" : "伤官"; }
    if (producesDm)   { return samePolarity ? "偏印" : "正印"; }
    if (dmConquers)   { return samePolarity ? "偏财" : "正财"; }
    if (conquersDm)   { return samePolarity ? "七杀" : "正官"; }

    throw new Error("Cannot determine relationship between " + dm.char + " and " + other.char);
  }

  // ────────────────────────────────────────────────────────────────────────
  // 六十甲子 (60-Cycle / Jiazi)
  // ────────────────────────────────────────────────────────────────────────

  /** Build all 60 stem-branch pairs. */
  var JIAZI_CYCLE = [];
  (function () {
    for (var i = 0; i < 60; i++) {
      JIAZI_CYCLE.push({
        stem:   getStem(i % 10),
        branch: getBranch(i % 12),
        index:  i,
        char:   getStem(i % 10).char + getBranch(i % 12).char
      });
    }
  })();

  var _jiaziByChar = {};
  JIAZI_CYCLE.forEach(function (sb) { _jiaziByChar[sb.char] = sb; });

  function getJiazi(index) {
    return JIAZI_CYCLE[((index % 60) + 60) % 60];
  }

  function getJiaziByChar(ch) {
    if (!_jiaziByChar[ch]) { throw new Error("Unknown stem-branch: " + ch); }
    return _jiaziByChar[ch];
  }

  // Reference epoch: 1900-01-01 = 甲子 (index 0)
  var _REFERENCE_DATE = new Date(Date.UTC(1900, 0, 1)); // months are 0-based
  var _REFERENCE_INDEX = 0;

  /**
   * Number of whole days between two UTC-midnight Date objects.
   */
  function _daysBetween(a, b) {
    var MS_PER_DAY = 86400000;
    return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
  }

  /**
   * Create a UTC Date from (year, month, day). month is 1-based.
   */
  function _utcDate(y, m, d) {
    return new Date(Date.UTC(y, m - 1, d));
  }

  /**
   * Convert a JS Date (or {year,month,day}) to its 60-cycle index.
   */
  function jiaziIndexForDate(d) {
    if (!(d instanceof Date)) { d = _utcDate(d.year, d.month, d.day); }
    var delta = _daysBetween(_REFERENCE_DATE, d);
    return ((_REFERENCE_INDEX + delta) % 60 + 60) % 60;
  }

  /**
   * Get the StemBranch for a given date (day pillar).
   */
  function dateToJiazi(d) {
    return getJiazi(jiaziIndexForDate(d));
  }

  // ────────────────────────────────────────────────────────────────────────
  // 24 Solar Terms (二十四节气)
  // ────────────────────────────────────────────────────────────────────────

  var SOLAR_TERMS = [
    "小寒", "大寒", "立春", "雨水", "惊蛰", "春分",
    "清明", "谷雨", "立夏", "小满", "芒种", "夏至",
    "小暑", "大暑", "立秋", "处暑", "白露", "秋分",
    "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"
  ];

  /** Solar longitude for each term. 小寒=285°, each +15°. */
  var _TERM_LONGITUDES = {};
  SOLAR_TERMS.forEach(function (name, i) {
    _TERM_LONGITUDES[name] = (285 + i * 15) % 360;
  });

  /**
   * Approximate Julian Day when the sun reaches a given ecliptic longitude.
   * Uses Meeus simplified formula for the vernal equinox + mean-motion offset.
   */
  function _solarLongitudeToJDE(year, targetLon) {
    var Y = (year - 2000) / 1000.0;
    var jdeEquinox = 2451623.80984
                   + 365242.37404 * Y
                   + 0.05169 * Y * Y
                   - 0.00411 * Y * Y * Y
                   - 0.00057 * Y * Y * Y * Y;

    var deltaLon = targetLon;
    if (deltaLon < 0)   { deltaLon += 360; }
    if (deltaLon > 180) { deltaLon -= 360; }

    var daysApprox = deltaLon / (360.0 / 365.25);
    return jdeEquinox + daysApprox;
  }

  /**
   * Convert Julian Day Number to a UTC Date object.
   * JDE 2451545.0 = 2000-01-01 12:00 UTC.
   */
  function _jdeToDate(jde) {
    var MS_PER_DAY = 86400000;
    var deltaDays = jde - 2451545.0;
    // 2000-01-01 12:00 UTC
    var baseMs = Date.UTC(2000, 0, 1, 12, 0, 0);
    var ms = baseMs + deltaDays * MS_PER_DAY;
    return new Date(ms);
  }

  /**
   * Get the approximate date of a solar term for a given year.
   * Accuracy: +/- 1-2 days for 1900-2100.
   *
   * @param {number} year — Gregorian year
   * @param {string} term — Solar term name (e.g. "立春")
   * @returns {{ year, month, day }} date components (UTC)
   */
  function getSolarTermDate(year, term) {
    if (_TERM_LONGITUDES[term] === undefined) {
      throw new Error("Unknown solar term: " + term);
    }
    var lon = _TERM_LONGITUDES[term];
    var jde = _solarLongitudeToJDE(year, lon);
    var d   = _jdeToDate(jde);

    var resultYear = d.getUTCFullYear();

    // If the computed date ended up in a wrong year, try adjusting
    if (resultYear !== year) {
      var tryYear = (resultYear < year) ? year + 1 : year - 1;
      var jde2 = _solarLongitudeToJDE(tryYear, lon);
      var d2   = _jdeToDate(jde2);
      if (Math.abs(d2.getUTCFullYear() - year) < Math.abs(resultYear - year)) {
        d = d2;
      }
    }

    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
  }

  /**
   * Get the approximate date of 立春 (Start of Spring) for a given year.
   * Typically falls on February 3-5.
   */
  function lichunDate(year) {
    var d = getSolarTermDate(year, "立春");
    if (d.month > 3 || d.year !== year) {
      return { year: year, month: 2, day: 4 };
    }
    return d;
  }

  /**
   * Get all 12 monthly boundary solar terms (节) for a given year.
   * These are the terms that start each Chinese month:
   *   立春, 惊蛰, 清明, 立夏, 芒种, 小暑, 立秋, 白露, 寒露, 立冬, 大雪, 小寒
   *
   * @returns {Array<{term: string, year: number, month: number, day: number}>}
   *          sorted by date
   */
  function getMonthBoundaryDates(year) {
    var monthlyTerms = [
      "立春", "惊蛰", "清明", "立夏", "芒种", "小暑",
      "立秋", "白露", "寒露", "立冬", "大雪", "小寒"
    ];

    var results = monthlyTerms.map(function (term) {
      var d = getSolarTermDate(year, term);
      return { term: term, year: d.year, month: d.month, day: d.day };
    });

    results.sort(function (a, b) {
      return _utcDate(a.year, a.month, a.day) - _utcDate(b.year, b.month, b.day);
    });
    return results;
  }

  // ────────────────────────────────────────────────────────────────────────
  // Lunar Calendar (农历) — compressed data table approach
  // ────────────────────────────────────────────────────────────────────────
  //
  // Each entry in LUNAR_DATA is a hex-encoded number for one lunar year.
  //
  // Encoding (20 bits per year):
  //   bits 19-16 : leap month number (0 = no leap month, 1-12 = which month)
  //   bit  15    : if there IS a leap month, 0 = leap month has 29 days,
  //                1 = leap month has 30 days
  //   bits 14-3  : 12 bits for months 1-12 (bit 14 = month 1, bit 3 = month 12);
  //                1 = 30 days, 0 = 29 days
  //   bits 2-0   : unused / reserved (0)
  //
  // New Year dates are stored separately for each year.
  //
  // Source: standard Chinese lunar calendar lookup table (1900-2100).
  // ────────────────────────────────────────────────────────────────────────

  /*
   * Compressed lunar info for 1900-2100.
   *
   * Format per entry (integer):
   *   bits 23-20 : leap month (0 = none, 1-12)
   *   bit  19    : leap month big? (1 = 30 days, 0 = 29 days)
   *   bits 18-7  : months 1-12 big flag (bit 18 = month 1 … bit 7 = month 12)
   *                1 = 30 days, 0 = 29 days
   *   bits 6-5   : unused
   *   bits 4-0   : Lunar New Year day-of-January offset:
   *                value = day of Lunar New Year in Jan or Feb;
   *                if >= 32, subtract 31 to get February day.
   *                (stored as the day number where Jan 1 = 1, Feb 1 = 32)
   *
   * We store this as two parallel arrays to keep it readable:
   *   _LUNAR_YEAR_INFO  — month-length / leap info
   *   _LUNAR_NEW_YEAR   — [month, day] of Lunar New Year (Gregorian)
   */

  // Lunar year info: each element = 0xLMDDDD
  //   L    = leap month number (hex digit, 0-C)
  //   M    = leap month size flag (0 or 8) in top nibble combined with L
  //   DDDD = 12-bit month-length flags, month1 in MSB
  //
  // Compact representation: we store a single integer per year.
  //   Bits 19-16 : leap month (0 = none)
  //   Bit  15    : leap month has 30 days (1) or 29 (0)
  //   Bits 14-3  : month 1..12 lengths (1=30, 0=29), bit14=month1
  //   Bits 2-0   : reserved
  //
  // Lunar New Year is in _LNY as [month, day].

  // We store the well-known lunar data table used by countless JS/C libraries.
  // Each hex value encodes one lunar year (1900..2100).
  //
  // The standard encoding used here (same as the popular "lunar-calendar" libs):
  //   0x04bd8  →  year 1900, etc.
  //
  // Hex value breakdown:
  //   Bits 19..16 = leap month (0 = no leap)
  //   Bit  16     = leap month big (1=30d) — overloaded with leap month number
  //
  // Actually, the most widespread encoding is simpler:
  //   Bits 23..20 (top nibble of 6-hex-digit number): leap month (0=none)
  //   Bit  16: leap month 30-day flag
  //   Bits 15..4: months 1-12 (bit15=month1, bit4=month12), 1=30d 0=29d
  //   Bits 3..0: offset used for new year (or stored separately)
  //
  // For clarity we use the well-established table from the "chinese-lunar" dataset.
  // Each value is 5 hex digits (20 bits). Leap month info is in a separate nibble.

  /**
   * Standard lunar year data 1900-2100.
   * Each entry packs month lengths + leap info into one number.
   *
   * Layout (most-used convention):
   *   0xABCDE where:
   *     A     = leap month number (0=none, 1-C hex = month 1-12)
   *     B     = top 4 bits of month-data; bit3 of B = leap month 30-day flag
   *     CDE   = remaining 12 bits of month-data
   *   month-data (16 bits total, but only 13 used):
   *     bit 12 = month 1, bit 11 = month 2, … bit 1 = month 12
   *     bit 0  = leap month length (1=30, 0=29)  — only meaningful if A != 0
   *
   * Actually, for maximum compatibility, we use the ubiquitous table where:
   *   Each entry has exactly the form used by the Hong Kong Observatory /
   *   popular open-source implementations.
   */
  var _LUNAR_INFO = [
    /* 1900 */ 0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260,
    /* 1905 */ 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    /* 1910 */ 0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255,
    /* 1915 */ 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    /* 1920 */ 0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40,
    /* 1925 */ 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    /* 1930 */ 0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0,
    /* 1935 */ 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    /* 1940 */ 0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4,
    /* 1945 */ 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    /* 1950 */ 0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0,
    /* 1955 */ 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
    /* 1960 */ 0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570,
    /* 1965 */ 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    /* 1970 */ 0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4,
    /* 1975 */ 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
    /* 1980 */ 0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a,
    /* 1985 */ 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    /* 1990 */ 0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50,
    /* 1995 */ 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
    /* 2000 */ 0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552,
    /* 2005 */ 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    /* 2010 */ 0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9,
    /* 2015 */ 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    /* 2020 */ 0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60,
    /* 2025 */ 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    /* 2030 */ 0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0,
    /* 2035 */ 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    /* 2040 */ 0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577,
    /* 2045 */ 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
    /* 2050 */ 0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0,
    /* 2055 */ 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
    /* 2060 */ 0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0,
    /* 2065 */ 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
    /* 2070 */ 0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6,
    /* 2075 */ 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
    /* 2080 */ 0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50,
    /* 2085 */ 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
    /* 2090 */ 0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0,
    /* 2095 */ 0x04ae0, 0x0a9d4, 0x0a4d0, 0x0d150, 0x0f252,
    /* 2100 */ 0x0d520
  ];

  /** Lunar New Year dates (month, day) for 1900-2100, Gregorian. */
  var _LUNAR_NEW_YEAR = [
    /* 1900 */ [1,31],[2,19],[2,8],[1,29],[2,16],[2,4],[1,25],[2,13],[2,2],[1,22],
    /* 1910 */ [2,10],[1,30],[2,18],[2,6],[1,26],[2,14],[2,3],[1,23],[2,11],[2,1],
    /* 1920 */ [2,20],[2,8],[1,28],[2,16],[2,5],[1,24],[2,13],[2,2],[1,23],[2,10],
    /* 1930 */ [1,30],[2,17],[2,6],[1,26],[2,14],[2,4],[1,24],[2,11],[1,31],[2,19],
    /* 1940 */ [2,8],[1,27],[2,15],[2,5],[1,25],[2,13],[2,2],[1,22],[2,10],[1,29],
    /* 1950 */ [2,17],[2,6],[1,27],[2,14],[2,3],[1,24],[2,12],[1,31],[2,18],[2,8],
    /* 1960 */ [1,28],[2,15],[2,5],[1,25],[2,13],[2,2],[1,21],[2,9],[1,30],[2,17],
    /* 1970 */ [2,6],[1,27],[2,15],[2,3],[1,23],[2,11],[1,31],[2,18],[2,7],[1,28],
    /* 1980 */ [2,16],[2,5],[1,25],[2,13],[2,2],[2,20],[2,9],[1,29],[2,17],[2,6],
    /* 1990 */ [1,27],[2,15],[2,4],[1,23],[2,10],[1,31],[2,19],[2,7],[1,28],[2,16],
    /* 2000 */ [2,5],[1,24],[2,12],[2,1],[1,22],[2,9],[1,29],[2,18],[2,7],[1,26],
    /* 2010 */ [2,14],[2,3],[1,23],[2,10],[1,31],[2,19],[2,8],[1,28],[2,16],[2,5],
    /* 2020 */ [1,25],[2,12],[2,1],[1,22],[2,10],[1,29],[2,17],[2,6],[1,26],[2,13],
    /* 2030 */ [2,3],[1,23],[2,11],[1,31],[2,19],[2,8],[1,28],[2,15],[2,4],[1,24],
    /* 2040 */ [2,12],[2,1],[1,22],[2,10],[1,30],[2,17],[2,6],[1,26],[2,14],[2,2],
    /* 2050 */ [1,23],[2,11],[2,1],[1,19],[2,8],[1,28],[2,15],[2,4],[1,24],[2,12],
    /* 2060 */ [2,2],[1,21],[2,9],[1,29],[2,17],[2,5],[1,26],[2,14],[2,3],[1,23],
    /* 2070 */ [2,11],[1,31],[2,19],[2,7],[1,27],[2,15],[2,5],[1,24],[2,12],[2,1],
    /* 2080 */ [1,22],[2,9],[1,29],[2,17],[2,6],[1,26],[2,14],[2,3],[1,24],[2,10],
    /* 2090 */ [1,30],[2,18],[2,7],[1,27],[2,15],[2,5],[1,25],[2,12],[2,1],[1,21],
    /* 2100 */ [2,9]
  ];

  var _LUNAR_BASE_YEAR = 1900;

  /**
   * Extract leap month number from lunar info entry (0 = none).
   */
  function _leapMonth(lunarInfo) {
    return (lunarInfo >> 16) & 0xf;
  }

  /**
   * Number of days in the leap month for a given year (0 if no leap).
   */
  function _leapDays(year) {
    var idx = year - _LUNAR_BASE_YEAR;
    if (idx < 0 || idx >= _LUNAR_INFO.length) { return 0; }
    var info = _LUNAR_INFO[idx];
    if (_leapMonth(info) === 0) { return 0; }
    return (info & 0x10000) ? 30 : 29;
  }

  /**
   * Which month is the leap month for the given lunar year (0 = none).
   */
  function _leapMonthOf(year) {
    var idx = year - _LUNAR_BASE_YEAR;
    if (idx < 0 || idx >= _LUNAR_INFO.length) { return 0; }
    return _leapMonth(_LUNAR_INFO[idx]);
  }

  /**
   * Number of days in a regular (non-leap) month of a lunar year.
   * month: 1-12
   */
  function _monthDays(year, month) {
    var idx = year - _LUNAR_BASE_YEAR;
    if (idx < 0 || idx >= _LUNAR_INFO.length) { return 30; }
    var info = _LUNAR_INFO[idx];
    // Bit for month: month1 is bit 15 counting from bit 0
    // months 1..12 are in bits 15..4
    var bit = 16 - month;  // month 1 → bit 15, month 12 → bit 4
    return (info & (1 << bit)) ? 30 : 29;
  }

  /**
   * Total days in a lunar year.
   */
  function _yearDays(year) {
    var total = 0;
    for (var m = 1; m <= 12; m++) {
      total += _monthDays(year, m);
    }
    total += _leapDays(year);
    return total;
  }

  /**
   * Get Lunar New Year date for a given year as a Date (UTC).
   */
  function _lunarNewYear(year) {
    var idx = year - _LUNAR_BASE_YEAR;
    if (idx < 0 || idx >= _LUNAR_NEW_YEAR.length) {
      throw new Error("Year " + year + " out of lunar calendar range (1900-2100)");
    }
    var md = _LUNAR_NEW_YEAR[idx];
    return _utcDate(year, md[0], md[1]);
  }

  /**
   * Convert Gregorian date to Chinese lunar date.
   *
   * @param {number} year  — Gregorian year
   * @param {number} month — Gregorian month (1-12)
   * @param {number} day   — Gregorian day
   * @returns {{ year: number, month: number, day: number, isLeap: boolean }}
   */
  function solarToLunar(year, month, day) {
    var target = _utcDate(year, month, day);

    // Find the lunar year: the Lunar New Year that is on or before target
    var lunarYear = year;
    var lny = _lunarNewYear(lunarYear);
    if (target < lny) {
      lunarYear--;
      lny = _lunarNewYear(lunarYear);
    }

    var offset = _daysBetween(lny, target); // days since LNY

    var leapMon = _leapMonthOf(lunarYear);
    var lunarMonth = 0;
    var lunarDay = 0;
    var isLeap = false;

    // Walk through months
    for (var m = 1; m <= 12; m++) {
      var days = _monthDays(lunarYear, m);
      if (offset < days) {
        lunarMonth = m;
        lunarDay = offset + 1;
        break;
      }
      offset -= days;

      // Check for leap month after month m
      if (leapMon === m) {
        var ldays = _leapDays(lunarYear);
        if (offset < ldays) {
          lunarMonth = m;
          lunarDay = offset + 1;
          isLeap = true;
          break;
        }
        offset -= ldays;
      }
    }

    // If we exhausted all months (shouldn't happen with valid data)
    if (lunarMonth === 0) {
      lunarMonth = 12;
      lunarDay = offset + 1;
    }

    return { year: lunarYear, month: lunarMonth, day: lunarDay, isLeap: isLeap };
  }

  /**
   * Convert Chinese lunar date to Gregorian date.
   *
   * @param {number}  year    — Lunar year
   * @param {number}  month   — Lunar month (1-12)
   * @param {number}  day     — Lunar day
   * @param {boolean} isLeap  — Is this the leap instance of the month?
   * @returns {{ year: number, month: number, day: number }}
   */
  function lunarToSolar(year, month, day, isLeap) {
    if (isLeap === undefined) { isLeap = false; }

    var leapMon = _leapMonthOf(year);
    var lny = _lunarNewYear(year);

    var offset = 0;

    for (var m = 1; m < month; m++) {
      offset += _monthDays(year, m);
      if (leapMon === m) {
        offset += _leapDays(year);
      }
    }

    // If requesting the leap month itself, add the regular month first
    if (isLeap && leapMon === month) {
      offset += _monthDays(year, month);
    }

    offset += day - 1;

    var result = new Date(lny.getTime() + offset * 86400000);
    return {
      year:  result.getUTCFullYear(),
      month: result.getUTCMonth() + 1,
      day:   result.getUTCDate()
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // Lunar date formatting helpers
  // ────────────────────────────────────────────────────────────────────────

  var _LUNAR_DAY_NAMES = [
    "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
    "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
  ];

  var _LUNAR_MONTH_NAMES = [
    "正", "二", "三", "四", "五", "六",
    "七", "八", "九", "十", "冬", "腊"
  ];

  /**
   * Format a Gregorian date as a Chinese lunar date string.
   * @returns {string} e.g. "农历2024年正月初一"
   */
  function formatLunarDate(year, month, day) {
    var ld = solarToLunar(year, month, day);
    var leapStr = ld.isLeap ? "闰" : "";
    return "农历" + ld.year + "年" + leapStr + ld.month + "月" + ld.day + "日";
  }

  /**
   * Format a Gregorian date as a traditional Chinese lunar date string.
   * @returns {string} e.g. "农历2024年正月初一"
   */
  function formatLunarDateTraditional(year, month, day) {
    var ld = solarToLunar(year, month, day);
    var leapStr = ld.isLeap ? "闰" : "";
    var monthName = _LUNAR_MONTH_NAMES[ld.month - 1];
    var dayName   = _LUNAR_DAY_NAMES[ld.day - 1];
    return "农历" + ld.year + "年" + leapStr + monthName + "月" + dayName;
  }

  // ────────────────────────────────────────────────────────────────────────
  // Public API
  // ────────────────────────────────────────────────────────────────────────

  return {
    // Data tables
    STEMS:              STEMS,
    BRANCHES:           BRANCHES,
    ELEMENTS:           ELEMENTS,
    JIAZI_CYCLE:        JIAZI_CYCLE,
    SOLAR_TERMS:        SOLAR_TERMS,

    // Element cycles
    ELEMENT_PRODUCES:   ELEMENT_PRODUCES,
    ELEMENT_CONQUERS:   ELEMENT_CONQUERS,

    // Stem functions
    getStem:            getStem,
    getStemByChar:      getStemByChar,

    // Branch functions
    getBranch:          getBranch,
    getBranchByChar:    getBranchByChar,
    getBranchForHour:   getBranchForHour,
    getHiddenStems:     getHiddenStems,

    // 60-cycle functions
    getJiazi:           getJiazi,
    getJiaziByChar:     getJiaziByChar,
    dateToJiazi:        dateToJiazi,
    jiaziIndexForDate:  jiaziIndexForDate,

    // Solar terms
    getSolarTermDate:       getSolarTermDate,
    lichunDate:             lichunDate,
    getMonthBoundaryDates:  getMonthBoundaryDates,

    // Lunar calendar
    solarToLunar:               solarToLunar,
    lunarToSolar:               lunarToSolar,
    formatLunarDate:            formatLunarDate,
    formatLunarDateTraditional: formatLunarDateTraditional,

    // Ten Gods
    stemRelationship:   stemRelationship,

    // Branch relationships
    SIX_HARMONIES:      SIX_HARMONIES,
    THREE_HARMONIES:    THREE_HARMONIES,
    SIX_CONFLICTS:      SIX_CONFLICTS,
    THREE_PUNISHMENTS:  THREE_PUNISHMENTS,
    SIX_HARMS:          SIX_HARMS
  };
})();

// Node.js / CommonJS export (no-op in browsers)
if (typeof module !== "undefined" && module.exports) {
  module.exports = Calendar;
}
