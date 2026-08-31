/**
 * app.js -- Main application controller for Tianji web app.
 *
 * Wires together UI tabs, theme/language toggles, BaZi, Liu Yao, and Zi Wei
 * Dou Shu panels.  All heavy computation is delegated to the engine scripts
 * (bazi.js, liuyao.js, ziwei.js) that must be loaded before this file.
 * The I18n module (i18n.js) must also be loaded first.
 *
 * Pattern: IIFE, no framework dependencies -- pure DOM + Canvas + SVG.
 */
const TianjiApp = (function () {
  'use strict';

  // -----------------------------------------------------------------------
  //  Constants
  // -----------------------------------------------------------------------

  /** Heavenly stems in order (甲 = index 0). */
  const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  /** Earthly branches in order (子 = index 0). */
  const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  /** Zodiac animals aligned with branches. */
  const ZODIAC = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
  /** Element of each stem (index aligned). */
  const STEM_ELEMENT = ['木','木','火','火','土','土','金','金','水','水'];
  /** Primary element of each branch (index aligned). */
  const BRANCH_ELEMENT = ['水','土','木','木','土','火','火','土','金','金','土','水'];
  /** Element colors for theming. */
  const ELEMENT_COLORS = { '木':'#4caf50', '火':'#f44336', '土':'#ff9800', '金':'#ffd600', '水':'#2196f3' };

  /** 60 Jia-Zi cycle. */
  const JIAZI = (function () {
    const arr = [];
    for (let i = 0; i < 60; i++) arr.push(STEMS[i % 10] + BRANCHES[i % 12]);
    return arr;
  })();

  // (BaZi engine constants removed — now using bazi.js + calendar.js)

  // Liu Yao: trigram codes and hexagram tables
  const TRIGRAM_ORDER = [7,6,5,4,3,2,1,0]; // 先天 order for modular mapping
  const TRIGRAM_NAMES = { 7:'乾', 6:'兑', 5:'离', 4:'震', 3:'巽', 2:'坎', 1:'艮', 0:'坤' };

  // 64 hexagrams: [number, name, symbol, upperCode, lowerCode, description]
  const HEX_DATA = [
    [1,'乾','䷀',7,7,'天行健，君子以自强不息'],[2,'坤','䷁',0,0,'地势坤，君子以厚德载物'],
    [3,'屯','䷂',2,4,'刚柔始交而难生'],[4,'蒙','䷃',1,2,'山下有险，蒙'],
    [5,'需','䷄',2,7,'需，有孚，光亨'],[6,'讼','䷅',7,2,'天与水违行，讼'],
    [7,'师','䷆',0,2,'地中有水，师'],[8,'比','䷇',2,0,'地上有水，比'],
    [9,'小畜','䷈',3,7,'风行天上，小畜'],[10,'履','䷉',7,6,'上天下泽，履'],
    [11,'泰','䷊',0,7,'天地交，泰'],[12,'否','䷋',7,0,'天地不交，否'],
    [13,'同人','䷌',7,5,'天与火，同人'],[14,'大有','䷍',5,7,'火在天上，大有'],
    [15,'谦','䷎',0,1,'地中有山，谦'],[16,'豫','䷏',4,0,'雷出地奋，豫'],
    [17,'随','䷐',6,4,'泽中有雷，随'],[18,'蛊','䷑',1,3,'山下有风，蛊'],
    [19,'临','䷒',0,6,'泽上有地，临'],[20,'观','䷓',3,0,'风行地上，观'],
    [21,'噬嗑','䷔',5,4,'雷电，噬嗑'],[22,'贲','䷕',1,5,'山下有火，贲'],
    [23,'剥','䷖',1,0,'山附于地，剥'],[24,'复','䷗',0,4,'雷在地中，复'],
    [25,'无妄','䷘',7,4,'天下雷行，无妄'],[26,'大畜','䷙',1,7,'天在山中，大畜'],
    [27,'颐','䷚',1,4,'山下有雷，颐'],[28,'大过','䷛',6,3,'泽灭木，大过'],
    [29,'坎','䷜',2,2,'水洊至，习坎'],[30,'离','䷝',5,5,'明两作，离'],
    [31,'咸','䷞',6,1,'山上有泽，咸'],[32,'恒','䷟',4,3,'雷风，恒'],
    [33,'遁','䷠',7,1,'天下有山，遁'],[34,'大壮','䷡',4,7,'雷在天上，大壮'],
    [35,'晋','䷢',5,0,'明出地上，晋'],[36,'明夷','䷣',0,5,'明入地中，明夷'],
    [37,'家人','䷤',3,5,'风自火出，家人'],[38,'睽','䷥',5,6,'上火下泽，睽'],
    [39,'蹇','䷦',2,1,'山上有水，蹇'],[40,'解','䷧',4,2,'雷雨作，解'],
    [41,'损','䷨',1,6,'山下有泽，损'],[42,'益','䷩',3,4,'风雷，益'],
    [43,'夬','䷪',6,7,'泽上于天，夬'],[44,'姤','䷫',7,3,'天下有风，姤'],
    [45,'萃','䷬',6,0,'泽上于地，萃'],[46,'升','䷭',0,3,'地中生木，升'],
    [47,'困','䷮',6,2,'泽无水，困'],[48,'井','䷯',2,3,'木上有水，井'],
    [49,'革','䷰',6,5,'泽中有火，革'],[50,'鼎','䷱',5,3,'木上有火，鼎'],
    [51,'震','䷲',4,4,'洊雷，震'],[52,'艮','䷳',1,1,'兼山，艮'],
    [53,'渐','䷴',3,1,'山上有木，渐'],[54,'归妹','䷵',4,6,'泽上有雷，归妹'],
    [55,'丰','䷶',4,5,'雷电皆至，丰'],[56,'旅','䷷',5,1,'山上有火，旅'],
    [57,'巽','䷸',3,3,'随风，巽'],[58,'兑','䷹',6,6,'丽泽，兑'],
    [59,'涣','䷺',3,2,'风行水上，涣'],[60,'节','䷻',2,6,'泽上有水，节'],
    [61,'中孚','䷼',3,6,'泽上有风，中孚'],[62,'小过','䷽',4,1,'山上有雷，小过'],
    [63,'既济','䷾',2,5,'水在火上，既济'],[64,'未济','䷿',5,2,'火在水上，未济'],
  ];
  /** Lookup hex by (upper, lower) codes. */
  const HEX_BY_TRIGRAMS = {};
  HEX_DATA.forEach(function (h) { HEX_BY_TRIGRAMS[h[3] + ',' + h[4]] = h; });

  function hexagramLines(hex) {
    var lower = hex[4];
    var upper = hex[3];
    return [lower & 1, (lower >> 1) & 1, (lower >> 2) & 1, upper & 1, (upper >> 1) & 1, (upper >> 2) & 1];
  }

  function linesToHexagram(lines) {
    var lower = lines[0] | (lines[1] << 1) | (lines[2] << 2);
    var upper = lines[3] | (lines[4] << 1) | (lines[5] << 2);
    return HEX_BY_TRIGRAMS[upper + ',' + lower] || HEX_DATA[0];
  }

  function hexagramRelations(hex) {
    var lines = hexagramLines(hex);
    return {
      mutual: linesToHexagram([lines[1], lines[2], lines[3], lines[2], lines[3], lines[4]]),
      opposite: linesToHexagram(lines.map(function (line) { return line ? 0 : 1; })),
      inverse: linesToHexagram(lines.slice().reverse()),
      exchange: linesToHexagram([lines[3], lines[4], lines[5], lines[0], lines[1], lines[2]])
    };
  }

  function analyzeLiuyaoResult(result) {
    if (typeof LiuYao === 'undefined' || !result || !result.primaryHex) return null;
    var castDate = result.castDate || new Date();
    var calendar = typeof BaZi !== 'undefined' ? BaZi.createChart(
      castDate.getFullYear(), castDate.getMonth() + 1, castDate.getDate(), castDate.getHours(), 'male'
    ) : null;
    var analysis = LiuYao.analyze({
      primary: LiuYao.getHexagramByNumber(result.primaryHex[0]),
      changed: result.changedHex ? LiuYao.getHexagramByNumber(result.changedHex[0]) : null,
      rawLines: result.rawLines,
      movingLines: result.movingPositions
    }, calendar ? calendar.dayMasterElementIndex : 0);
    analysis.calendar = calendar;
    return analysis;
  }

  function liuyaoTimeStates(line, calendar) {
    if (!calendar) return ['Chưa có lịch'];
    var branchIndex = BRANCHES.indexOf(line.branch);
    var monthBranch = calendar.monthPillar.branchIndex;
    var dayBranch = calendar.dayPillar.branchIndex;
    var dayStem = calendar.dayPillar.stemIndex;
    var states = [];
    var clashes = function (a, b) { return mod(a - b, 12) === 6; };
    if (clashes(branchIndex, monthBranch)) states.push('Nguyệt phá');
    if (clashes(branchIndex, dayBranch)) states.push('Nhật xung');
    var xunStart = mod(dayBranch - dayStem, 12);
    if (branchIndex === mod(xunStart + 10, 12) || branchIndex === mod(xunStart + 11, 12)) states.push('Tuần không');
    var elementIndex = { '木': 0, '火': 1, '土': 2, '金': 3, '水': 4 };
    var lineElement = elementIndex[line.element];
    var monthElement = elementIndex[BRANCH_ELEMENT[monthBranch]];
    if (lineElement === monthElement) states.push('Đồng khí');
    else if (mod(monthElement + 1, 5) === lineElement) states.push('Được sinh');
    else if (mod(lineElement + 1, 5) === monthElement) states.push('Tiết khí');
    else if (mod(monthElement + 2, 5) === lineElement) states.push('Bị khắc');
    else if (mod(lineElement + 2, 5) === monthElement) states.push('Khắc tháng');
    return states.length ? states : ['Bình hòa'];
  }

  // Zi Wei palace names (order matches Python PALACE_NAMES)
  const ZW_PALACES = [
    '命宫','兄弟宫','夫妻宫','子女宫','财帛宫','疾厄宫',
    '迁移宫','奴仆宫','官禄宫','田宅宫','福德宫','父母宫'
  ];
  const ZW_WU_XING_JU = [2,6,5,3,4,2,6,5,3,4,2,6]; // by ming position index

  // Zi Wei star group offsets
  const ZIWEI_GROUP = { '紫微':0,'天机':-1,'太阳':-2,'武曲':-3,'天同':-4,'廉贞':-6 };
  const TIANFU_GROUP = { '天府':0,'太阴':1,'贪狼':2,'巨门':3,'天相':4,'天梁':5,'七杀':6,'破军':10 };

  // -----------------------------------------------------------------------
  //  State
  // -----------------------------------------------------------------------
  let activeTab = 'bazi';
  let darkTheme = false;

  // -----------------------------------------------------------------------
  //  Helpers
  // -----------------------------------------------------------------------

  /** Short alias for getElementById. */
  function $(id) { return document.getElementById(id); }

  /** Create element with optional class and text. */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  /** Mod that always returns non-negative. */
  function mod(n, m) { return ((n % m) + m) % m; }

  /** Convert clock hour (0-23) to branch index. */
  function hourToBranch(h) { return h === 23 ? 0 : Math.floor((h + 1) / 2); }

  // (BaZi engine functions removed — now delegated to bazi.js)

  // -----------------------------------------------------------------------
  //  Liu Yao Engine
  // -----------------------------------------------------------------------

  function liuYaoCastByTime(dt) {
    dt = dt || new Date();
    var y = dt.getFullYear(), m = dt.getMonth() + 1, d = dt.getDate(), h = dt.getHours();
    var total = y + m + d + h;
    var upperIdx = mod(y + m + d, 8);
    var lowerIdx = mod(total, 8);
    var movingPos = mod(total, 6) + 1; // 1-6
    var upperCode = TRIGRAM_ORDER[upperIdx];
    var lowerCode = TRIGRAM_ORDER[lowerIdx];
    var result = _buildCastResult('time', upperCode, lowerCode, movingPos);
    result.castDate = new Date(dt.getTime());
    return result;
  }

  function liuYaoCastByNumber(n1, n2, n3) {
    var upperCode = TRIGRAM_ORDER[mod(n1, 8)];
    var lowerCode = TRIGRAM_ORDER[mod(n2, 8)];
    var movingPos = n3 != null ? mod(n3, 6) + 1 : mod(n1 + n2, 6) + 1;
    return _buildCastResult('number', upperCode, lowerCode, movingPos);
  }

  function liuYaoCastByCoin() {
    var rawLines = [];
    for (var i = 0; i < 6; i++) {
      var sum = 0;
      for (var c = 0; c < 3; c++) sum += Math.random() < 0.5 ? 2 : 3;
      rawLines.push(sum); // 6,7,8,9
    }
    return _buildCoinResult(rawLines);
  }

  function _buildCastResult(method, upperCode, lowerCode, movingPos) {
    // Build raw lines from trigram codes
    var rawLines = [];
    for (var i = 0; i < 3; i++) rawLines.push(((lowerCode >> i) & 1) ? 9 : 8);
    for (var j = 0; j < 3; j++) rawLines.push(((upperCode >> j) & 1) ? 9 : 8);
    // Apply moving line
    var ml = movingPos - 1;
    rawLines[ml] = rawLines[ml] === 9 ? 7 : 6;
    return _buildCoinResult(rawLines);
  }

  function _buildCoinResult(rawLines) {
    var primary = [], changed = [], moving = [];
    for (var i = 0; i < 6; i++) {
      var v = rawLines[i];
      var isYang = (v === 7 || v === 9 || v === 1);
      primary.push(isYang ? 1 : 0);
      if (v === 6) { changed.push(1); moving.push(i + 1); }
      else if (v === 7) { changed.push(0); moving.push(i + 1); }
      else if (v === 8) { changed.push(0); }
      else { changed.push(1); }
    }
    // Lookup hexagrams
    var pLower = primary[0] | (primary[1] << 1) | (primary[2] << 2);
    var pUpper = primary[3] | (primary[4] << 1) | (primary[5] << 2);
    var cLower = changed[0] | (changed[1] << 1) | (changed[2] << 2);
    var cUpper = changed[3] | (changed[4] << 1) | (changed[5] << 2);
    var primaryHex = HEX_BY_TRIGRAMS[pUpper + ',' + pLower] || HEX_DATA[0];
    var changedHex = moving.length > 0 ? (HEX_BY_TRIGRAMS[cUpper + ',' + cLower] || null) : null;
    return {
      rawLines: rawLines,
      primaryLines: primary,
      changedLines: changed,
      movingPositions: moving,
      primaryHex: primaryHex,
      changedHex: changedHex,
    };
  }

  // -----------------------------------------------------------------------
  //  Zi Wei Engine (simplified)
  // -----------------------------------------------------------------------

  function ziWeiCalc(lunarYear, lunarMonth, lunarDay, hour, gender) {
    var hourBranch = hourToBranch(hour);
    var mingPos = mod(2 + lunarMonth - 1 - hourBranch, 12);
    var wuXingJu = ZW_WU_XING_JU[mingPos];

    // Place 12 palaces (counterclockwise from ming)
    var palaces = [];
    for (var i = 0; i < 12; i++) {
      var pos = mod(mingPos + i, 12);
      palaces.push({ name: ZW_PALACES[i], position: pos, branch: BRANCHES[pos], stars: [] });
    }

    // Zi Wei position from lunar day and wu-xing-ju
    var q = Math.floor(lunarDay / wuXingJu);
    var r = lunarDay % wuXingJu;
    var zwPos;
    if (r === 0) zwPos = q - 1;
    else if (r % 2 === 1) zwPos = q + 1;
    else zwPos = q;
    zwPos = mod(zwPos + 1, 12);

    // Place Zi Wei group
    var starMap = {};
    for (var star in ZIWEI_GROUP) {
      var p = mod(zwPos + ZIWEI_GROUP[star], 12);
      starMap[star] = p;
      var pal = palaces.find(function (x) { return x.position === p; });
      if (pal) pal.stars.push(star);
    }
    // Tian Fu position (symmetric to Zi Wei about Yin-Shen axis)
    var tfPos = mod(12 - zwPos + 4, 12);
    for (var star2 in TIANFU_GROUP) {
      var p2 = mod(tfPos + TIANFU_GROUP[star2], 12);
      starMap[star2] = p2;
      var pal2 = palaces.find(function (x) { return x.position === p2; });
      if (pal2) pal2.stars.push(star2);
    }

    return { palaces: palaces, starMap: starMap, mingPos: mingPos, wuXingJu: wuXingJu };
  }

  // -----------------------------------------------------------------------
  //  Five Elements Radar Chart (Canvas 2D) — Enhanced with gradients
  // -----------------------------------------------------------------------

  /** Five-element traditional colors for radar chart. */
  var RADAR_COLORS = {
    '木': '#4caf50',
    '火': '#f44336',
    '土': '#ff9800',
    '金': '#ffd600',
    '水': '#2196f3'
  };

  /**
   * Draw a premium radar (pentagon) chart with gradient fill and expand animation.
   * @param {HTMLCanvasElement} canvas
   * @param {Object} scores  e.g. { '木':3, '火':1.5, ... }
   * @param {boolean} [animate=true]
   */
  function drawRadarChart(canvas, scores, animate) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    var W = rect.width || 300;
    var H = rect.height || 300;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var cx = W / 2, cy = H / 2;
    var R = Math.min(W, H) * 0.36;
    var labels = ['木','火','土','金','水'];
    var vals = labels.map(function (l) { return scores[l] || 0; });
    var maxVal = Math.max.apply(null, vals.concat([1]));
    var angleStep = (2 * Math.PI) / 5;
    var startAngle = -Math.PI / 2;
    var isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    function vtx(i, frac) {
      var a = startAngle + i * angleStep;
      return { x: cx + R * frac * Math.cos(a), y: cy + R * frac * Math.sin(a) };
    }

    function drawFrame(progress) {
      ctx.clearRect(0, 0, W, H);

      // Grid rings (4 levels)
      ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 0.5;
      [0.25, 0.5, 0.75, 1].forEach(function (frac) {
        ctx.beginPath();
        for (var i = 0; i <= 5; i++) {
          var v = vtx(i % 5, frac);
          if (i === 0) ctx.moveTo(v.x, v.y); else ctx.lineTo(v.x, v.y);
        }
        ctx.closePath();
        ctx.stroke();
      });

      // Axis lines
      ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.08)' : 'rgba(0, 0, 0, 0.06)';
      for (var a = 0; a < 5; a++) {
        var v1 = vtx(a, 1);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(v1.x, v1.y);
        ctx.stroke();
      }

      // Data polygon with gradient fill
      ctx.beginPath();
      for (var d = 0; d < 5; d++) {
        var frac = (vals[d] / maxVal) * progress;
        var vd = vtx(d, frac);
        if (d === 0) ctx.moveTo(vd.x, vd.y); else ctx.lineTo(vd.x, vd.y);
      }
      ctx.closePath();

      // Radial gradient fill
      var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      if (isDark) {
        grad.addColorStop(0, 'rgba(212, 175, 55, 0.3)');
        grad.addColorStop(1, 'rgba(192, 57, 43, 0.15)');
      } else {
        grad.addColorStop(0, 'rgba(212, 175, 55, 0.25)');
        grad.addColorStop(1, 'rgba(192, 57, 43, 0.1)');
      }
      ctx.fillStyle = grad;
      ctx.fill();

      // Stroke
      ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.6)' : 'rgba(180, 140, 40, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Data points with glow
      for (var p = 0; p < 5; p++) {
        var fp = (vals[p] / maxVal) * progress;
        var vp = vtx(p, fp);
        // Glow
        ctx.beginPath();
        ctx.arc(vp.x, vp.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = RADAR_COLORS[labels[p]].replace(')', ', 0.3)').replace('rgb', 'rgba');
        ctx.fill();
        // Dot
        ctx.beginPath();
        ctx.arc(vp.x, vp.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = RADAR_COLORS[labels[p]];
        ctx.fill();
        ctx.strokeStyle = isDark ? '#0a0a0f' : '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Labels
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (var lb = 0; lb < 5; lb++) {
        var vl = vtx(lb, 1.22);
        var elKey = { '木':'wood','火':'fire','土':'earth','金':'metal','水':'water' }[labels[lb]];
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillStyle = RADAR_COLORS[labels[lb]];
        ctx.fillText(I18n.t(elKey), vl.x, vl.y - 8);
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillStyle = isDark ? 'rgba(232, 224, 208, 0.7)' : 'rgba(28, 24, 16, 0.6)';
        ctx.fillText(vals[lb].toFixed(1), vl.x, vl.y + 8);
      }
    }

    // Animation: expand from center
    if (animate !== false && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var start = null;
      var duration = 600;
      function step(ts) {
        if (!start) start = ts;
        var elapsed = ts - start;
        var t = Math.min(elapsed / duration, 1);
        // Ease out cubic
        var p = 1 - Math.pow(1 - t, 3);
        drawFrame(p);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    } else {
      drawFrame(1);
    }
  }

  // -----------------------------------------------------------------------
  //  SVG Hexagram Visualization
  // -----------------------------------------------------------------------

  /**
   * Build an SVG string for a hexagram (6 lines, bottom to top).
   * @param {Array<number>} lines  [0|1, ...] bottom to top, 1=yang
   * @param {Array<number>} movingPositions  1-based positions of moving lines
   * @returns {string} SVG markup
   */
  function buildHexagramSVG(lines, movingPositions) {
    var w = 200, lineH = 24, gap = 8, padY = 16;
    var h = 6 * lineH + 5 * gap + 2 * padY;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">';

    var isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    var strokeColor = isDark ? '#e8e0d0' : '#1c1810';
    var movingColor = '#f44336';
    var lineW = 160, lx = (w - lineW) / 2;

    for (var i = 5; i >= 0; i--) {
      var row = 5 - i; // visual row 0=top
      var y = padY + row * (lineH + gap) + lineH / 2;
      var isMoving = movingPositions.indexOf(i + 1) !== -1;
      var color = isMoving ? movingColor : strokeColor;
      var sw = 4;

      if (lines[i] === 1) {
        // Yang: solid line
        svg += '<line x1="' + lx + '" y1="' + y + '" x2="' + (lx + lineW) + '" y2="' + y + '" stroke="' + color + '" stroke-width="' + sw + '" stroke-linecap="round"';
        if (isMoving) svg += ' class="moving-line"';
        svg += '/>';
      } else {
        // Yin: broken line with gap
        var half = (lineW - 20) / 2;
        svg += '<line x1="' + lx + '" y1="' + y + '" x2="' + (lx + half) + '" y2="' + y + '" stroke="' + color + '" stroke-width="' + sw + '" stroke-linecap="round"';
        if (isMoving) svg += ' class="moving-line"';
        svg += '/>';
        svg += '<line x1="' + (lx + half + 20) + '" y1="' + y + '" x2="' + (lx + lineW) + '" y2="' + y + '" stroke="' + color + '" stroke-width="' + sw + '" stroke-linecap="round"';
        if (isMoving) svg += ' class="moving-line"';
        svg += '/>';
      }

      // Position label (left)
      var posNames = ['Sơ','Nhị','Tam','Tứ','Ngũ','Thượng'];
      svg += '<text x="' + (lx - 14) + '" y="' + (y + 1) + '" text-anchor="end" font-size="12" fill="' + color + '">' + posNames[i] + '</text>';

      // Moving marker (right)
      if (isMoving) {
        svg += '<circle cx="' + (lx + lineW + 14) + '" cy="' + y + '" r="5" fill="' + movingColor + '" opacity="0.8"/>';
      }
    }
    svg += '</svg>';
    return svg;
  }

  // -----------------------------------------------------------------------
  //  UI Rendering
  // -----------------------------------------------------------------------

  /** Apply all [data-i18n] attributes in the DOM. */
  function applyI18n() {
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      els[i].textContent = I18n.t(key);
    }
    // Also update placeholders
    var phs = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < phs.length; j++) {
      phs[j].placeholder = I18n.t(phs[j].getAttribute('data-i18n-placeholder'));
    }
    // Update page title
    document.title = I18n.t('appTitle') + ' - ' + I18n.t('appSubtitle');
    I18n.localizeDocument(document.body);
  }

  /** Toggle theme using data-theme attribute. */
  function toggleTheme() {
    darkTheme = !darkTheme;
    document.documentElement.setAttribute('data-theme', darkTheme ? 'dark' : 'light');
    var btn = $('theme-toggle');
    if (btn) btn.textContent = darkTheme ? '🌙' : '☀️';
    // Redraw canvas if visible
    refreshActiveTab();
  }

  /** Toggle language. */
  function toggleLang() {
    var lang = I18n.toggle();
    var btn = $('lang-toggle');
    if (btn) btn.textContent = lang === 'vi' ? 'EN' : 'VI';
    applyI18n();

    var localizer = new MutationObserver(function(records) {
      if (I18n.getLang() !== 'vi') return;
      I18n.localizeDocument(document.body);
    });
    localizer.observe(document.body, { childList: true, subtree: true, characterData: true });
    rebuildHourSelector();
    refreshActiveTab();
  }

  /** Switch active tab — syncs desktop tabs, mobile bottom nav, and panels. */
  function switchTab(tab) {
    activeTab = tab;
    ['bazi','liuyao','ziwei'].forEach(function (t) {
      var panel = $('panel-' + t);
      var tabBtn = $('tab-' + t);
      var isActive = t === tab;
      if (panel) {
        panel.style.display = isActive ? 'block' : 'none';
        if (isActive) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', '');
        }
      }
      // Desktop tabs
      if (tabBtn) {
        tabBtn.classList.toggle('active', isActive);
        tabBtn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      }
    });
    // Mobile bottom nav
    var bottomItems = document.querySelectorAll('.bottom-nav-item');
    for (var i = 0; i < bottomItems.length; i++) {
      var itemTab = bottomItems[i].getAttribute('data-tab');
      var active = itemTab === tab;
      bottomItems[i].classList.toggle('active', active);
      bottomItems[i].setAttribute('aria-selected', active ? 'true' : 'false');
    }
    refreshActiveTab();
  }

  /** Refresh the currently active tab's content. */
  function refreshActiveTab() {
    if (activeTab === 'bazi') calculateBazi();
    else if (activeTab === 'liuyao') { /* Liu Yao waits for cast button */ }
    else if (activeTab === 'ziwei') calculateZiwei();
  }

  // -----------------------------------------------------------------------
  //  Hour Selector Builder
  // -----------------------------------------------------------------------

  /**
   * Rebuild hour selector with branch indices 0-11 as values.
   * Values correspond to: 子(0), 丑(1), 寅(2), ..., 亥(11).
   */
  function rebuildHourSelector() {
    var sel = $('bazi-hour');
    if (!sel) return;
    var current = sel.value;
    sel.innerHTML = '';
    for (var i = 0; i < 12; i++) {
      var opt = document.createElement('option');
      opt.value = i; // branch index
      opt.textContent = I18n.t('shiChen' + i);
      sel.appendChild(opt);
    }
    // Restore selection
    if (current !== undefined && current !== '') {
      sel.value = current;
    }
  }

  /** Convert hour branch index (0-11) to representative clock hour (0-23). */
  function branchIdxToClockHour(branchIdx) {
    return branchIdx === 0 ? 23 : branchIdx * 2 - 1;
  }

  // -----------------------------------------------------------------------
  //  BaZi Tab Rendering
  // -----------------------------------------------------------------------

  /**
   * calculateBazi — 综合八字排盘
   *
   * Uses BaZi.createChart() engine for all computation.
   * Renders: 农历日期, 四柱+纳音, 十神, 藏干, 胎元/命宫, 神煞,
   *          五行分析, 日主强弱, 用神忌神, 格局, 地支关系, 大运, 流年
   */
  function calculateBazi() {
    var dateStr = $('bazi-date') ? $('bazi-date').value : '';
    var hourBranchIdx = $('bazi-hour') ? parseInt($('bazi-hour').value, 10) : 7;
    var genderVal = document.querySelector('input[name="bazi-gender"]:checked');
    var gender = genderVal ? genderVal.value : 'male';

    var resultArea = $('bazi-result');
    if (!resultArea) return;

    if (!dateStr) {
      resultArea.innerHTML = '<p class="empty-state">' + I18n.t('noData') + '</p>';
      return;
    }

    var parts = dateStr.split('-');
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var day = parseInt(parts[2], 10);
    var clockHour = branchIdxToClockHour(hourBranchIdx);

    // ── Core computation via BaZi engine ──
    var chart = BaZi.createChart(year, month, day, clockHour, gender);
    var tenGods = BaZi.tenGodsFromChart(chart);
    var elements = BaZi.analyzeFiveElements(chart.allStems, chart.allBranches);
    var strength = BaZi.analyzeDayMasterStrength(chart);
    var nayinArr = BaZi.getNayinForChart(chart);
    var taiyuan = BaZi.computeTaiyuan(chart);
    var minggong = BaZi.computeMinggong(chart);
    var shensha = BaZi.computeShensha(chart);
    var pattern = BaZi.analyzePattern(chart, strength);
    var favorable = BaZi.suggestFavorable(chart, strength, elements);
    var relResult = BaZi.analyzeRelationships(chart.allBranches);
    var luck = BaZi.computeLuckPillars(chart);
    var lunar = BaZi.getLunarDate(year, month, day);

    var dmChar = chart.dayMasterChar;
    var dmElement = chart.dayMasterElement;
    var pillars = chart.pillars;

    // Shorthand lookups
    function stemColor(sIdx) { return ELEMENT_COLORS[STEM_ELEMENT[sIdx]]; }
    function branchColor(bIdx) { return ELEMENT_COLORS[BRANCH_ELEMENT[bIdx]]; }

    // ── Build HTML ──
    var html = '';
    function bilingual(chinese, className) {
      return '<span class="han-pair" data-preserve-han><span class="' + className + '">' + chinese + '</span><small class="han-viet">' + I18n.hanViet(chinese) + '</small></span>';
    }

    // 1. 日期信息 (Solar + Lunar)
    html += '<div class="bazi-date-info">';
    html += '<span>Dương lịch ' + year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0') + '</span>';
    html += ' <span class="date-sep">/</span> ';
    html += '<span>Âm lịch ' + lunar.year + ', tháng ' + lunar.month + ', ngày ' + lunar.day + '</span>';
    html += '</div>';

    // 2. 四柱表格 (含纳音)
    var pillarLabels = [I18n.t('yearPillar'), I18n.t('monthPillar'), I18n.t('dayPillar'), I18n.t('hourPillar')];
    html += '<div class="pillars-table"><table><thead><tr>';
    pillarLabels.forEach(function (l) { html += '<th>' + l + '</th>'; });
    html += '</tr></thead><tbody>';

    // 十神 row
    html += '<tr class="tengod-row">';
    for (var ti = 0; ti < 4; ti++) {
      var tgName = '';
      if (ti === 2) { tgName = I18n.t('dayMaster'); }
      else {
        var key = ['年干', '月干', '', '时干'][ti];
        tgName = tenGods[key] ? tenGods[key].god : '';
      }
      html += '<td>' + bilingual(tgName, 'ten-god-label') + '</td>';
    }
    html += '</tr>';

    // 天干 row
    html += '<tr class="stems-row">';
    pillars.forEach(function (p) {
      html += '<td><span class="han-pair" data-preserve-han><span class="stem" style="color:' + stemColor(p.stemIndex) + '">' +
        STEMS[p.stemIndex] + '</span><small class="han-viet">' + I18n.hanViet(STEMS[p.stemIndex]) + '</small></span></td>';
    });
    html += '</tr>';

    // 地支 row
    html += '<tr class="branches-row">';
    pillars.forEach(function (p) {
      html += '<td><span class="han-pair" data-preserve-han><span class="branch" style="color:' + branchColor(p.branchIndex) + '">' +
        BRANCHES[p.branchIndex] + '</span><small class="han-viet">' + I18n.hanViet(BRANCHES[p.branchIndex]) + '</small></span>' +
        '<span class="han-pair zodiac-pair" data-preserve-han><small>' + ZODIAC[p.branchIndex] + '</small><small class="han-viet">' + I18n.hanViet(ZODIAC[p.branchIndex]) + '</small></span></td>';
    });
    html += '</tr>';

    // 藏干 row
    html += '<tr class="hidden-row">';
    var branchLabels = ['年支藏干', '月支藏干', '日支藏干', '时支藏干'];
    for (var hi = 0; hi < 4; hi++) {
      var hiddenArr = tenGods[branchLabels[hi]] || [];
      var hiddenParts = hiddenArr.map(function (h) {
        var c = ELEMENT_COLORS[STEM_ELEMENT[h.stemIndex]];
        return '<span class="hidden-pair" data-preserve-han><span style="color:' + c + '">' + h.stem + '</span><sub>' + h.god + '</sub><small class="han-viet">' + I18n.hanViet(h.stem) + ' ' + I18n.hanViet(h.god) + '</small></span>';
      });
      html += '<td>' + (hiddenParts.length > 0 ? hiddenParts.join(' ') : '-') + '</td>';
    }
    html += '</tr>';

    // 纳音 row
    html += '<tr class="nayin-row">';
    nayinArr.forEach(function (n) {
      html += '<td>' + bilingual(n.nayin, 'nayin-label') + '</td>';
    });
    html += '</tr>';

    html += '</tbody></table></div>';

    // 3. 日主信息 + 强弱
    html += '<div class="day-master-info">';
    html += '<strong>' + I18n.t('dayMaster') + ':</strong> ';
    html += '<span style="color:' + ELEMENT_COLORS[dmElement] + ';font-size:1.3em">' + dmChar + '</span> ';
    var elKey = { '木': 'wood', '火': 'fire', '土': 'earth', '金': 'metal', '水': 'water' }[dmElement];
    html += '(' + I18n.t(elKey) + ')';
    html += ' &mdash; ' + I18n.t('dayMasterStrength') + ': <strong>' + strength.level + '</strong>';
    html += ' (得分: ' + strength.score.toFixed(1) + ')';
    html += '</div>';

    // 强弱因素
    if (strength.factors.length > 0) {
      html += '<div class="strength-factors"><details><summary>强弱分析详情</summary><ul>';
      strength.factors.forEach(function (f) {
        html += '<li>' + f + '</li>';
      });
      html += '</ul></details></div>';
    }

    // 4. 胎元 + 命宫
    html += '<div class="taiyuan-minggong">';
    html += '<div class="tm-item"><span class="tm-label">胎元</span>';
    html += '<span class="tm-value">' + taiyuan.char + '</span>';
    html += '<span class="tm-nayin">' + taiyuan.nayin + '</span></div>';
    html += '<div class="tm-item"><span class="tm-label">命宫</span>';
    html += '<span class="tm-value">' + minggong.char + '</span>';
    html += '<span class="tm-nayin">' + minggong.nayin + '</span></div>';
    html += '</div>';

    // 5. 神煞
    if (shensha.length > 0) {
      html += '<div class="shensha-section"><h3>神煞</h3><div class="shensha-tags">';
      shensha.forEach(function (ss) {
        var cls = 'shensha-tag';
        // 吉神用金色, 凶神用红色
        var auspicious = ['天乙贵人', '文昌贵人', '天德', '月德', '禄神', '将星'].indexOf(ss.name) !== -1;
        cls += auspicious ? ' shensha-good' : ' shensha-neutral';
        html += '<span class="' + cls + '">' + ss.name + '<sub>' + ss.pillar + '</sub></span>';
      });
      html += '</div></div>';
    }

    // 6. 格局分析
    html += '<div class="pattern-section"><h3>格局</h3>';
    html += '<div class="pattern-name">' + pattern.pattern + '</div>';
    html += '<p class="pattern-desc">' + pattern.description + '</p>';
    html += '</div>';

    // 7. 用神忌神
    html += '<div class="favorable-section"><h3>用神忌神</h3>';
    html += '<div class="fav-row"><span class="fav-label">用神:</span> ';
    html += '<span class="fav-good">' + favorable.favorable.join('、') + '</span></div>';
    html += '<div class="fav-row"><span class="fav-label">忌神:</span> ';
    html += '<span class="fav-bad">' + favorable.unfavorable.join('、') + '</span></div>';
    html += '<p class="fav-suggestion">' + favorable.suggestion + '</p>';
    html += '</div>';

    // 8. 五行雷达图 + 详情
    // Build element counts in {木:n, 火:n, ...} format for radar chart
    var elCounts = {};
    for (var ei = 0; ei < 5; ei++) {
      var elName = ['木', '火', '土', '金', '水'][ei];
      elCounts[elName] = elements.scores[ei];
    }
    html += '<div class="radar-section"><h3>' + I18n.t('fiveElements') + '</h3>';
    html += '<canvas id="radar-canvas" width="300" height="300"></canvas>';
    // 五行详情
    html += '<div class="elements-detail">';
    elements.details.forEach(function (d) {
      var barW = elements.total > 0 ? (d.score / elements.total * 100) : 0;
      html += '<div class="el-row">';
      html += '<span class="el-name" style="color:' + ELEMENT_COLORS[d.element] + '">' + d.element + '</span>';
      html += '<div class="el-bar-bg"><div class="el-bar" style="width:' + barW + '%;background:' + ELEMENT_COLORS[d.element] + '"></div></div>';
      html += '<span class="el-score">' + d.score.toFixed(1) + '</span>';
      html += '<span class="el-status el-status-' + d.status + '">' + d.status + '</span>';
      html += '</div>';
    });
    if (elements.missing.length > 0) {
      var missingNames = elements.missing.map(function (i) { return ['木', '火', '土', '金', '水'][i]; });
      html += '<div class="el-missing">缺: ' + missingNames.join('、') + '</div>';
    }
    html += '</div></div>';

    // 9. 地支关系
    var rels = relResult.relationships;
    if (rels.length > 0) {
      html += '<div class="relationships-section"><h3>' + I18n.t('relationships') + '</h3><ul>';
      rels.forEach(function (r) {
        html += '<li><strong>' + r.kind + ':</strong> ' + r.description + '</li>';
      });
      html += '</ul></div>';
    }

    // 10. 大运
    var lps = luck.pillars;
    html += '<div class="luck-pillars-section"><h3>' + I18n.t('luckPillars') + '</h3>';
    html += '<div class="luck-direction">起运: ' + luck.startAge + '岁 (' + luck.direction + ')</div>';
    html += '<div class="luck-pillars-scroll"><div class="luck-pillars-track">';
    lps.forEach(function (lp) {
      html += '<div class="luck-pillar-card">';
      html += '<div class="lp-age">' + lp.startAge + '-' + lp.endAge + I18n.t('age') + '</div>';
      html += '<div class="lp-year">' + lp.startYear + '-' + lp.endYear + '</div>';
      html += '<div class="lp-stem" style="color:' + stemColor(lp.stemIndex) + '">' + STEMS[lp.stemIndex] + '</div>';
      html += '<div class="lp-branch" style="color:' + branchColor(lp.branchIndex) + '">' + BRANCHES[lp.branchIndex] + '</div>';
      html += '<div class="lp-nayin">' + lp.nayin + '</div>';
      html += '</div>';
    });
    html += '</div></div></div>';

    // 11. 流年
    var thisYear = new Date().getFullYear();
    var flowYears = BaZi.computeFlowYears(chart, thisYear, 10);
    html += '<div class="flow-years-section"><h3>' + I18n.t('flowYears') + '</h3>';
    html += '<div class="flow-years-grid">';
    flowYears.forEach(function (fy) {
      html += '<div class="flow-year-cell">';
      html += '<div class="fy-year">' + fy.year + '</div>';
      html += '<div class="fy-gz" style="color:' + stemColor(fy.stemIndex) + '">' + fy.char + '</div>';
      html += '<div class="fy-tg">' + fy.tenGod + '</div>';
      html += '<div class="fy-nayin">' + fy.nayin + '</div>';
      html += '</div>';
    });
    html += '</div></div>';

    html += '<section class="hex-interpretation everyday-reading"><h3>Cách hiểu đời thường</h3>';
    html += baziPlainLanguageReading(chart, strength, elements, favorable, rels, pattern);
    html += '<p class="interpretation-note">Gợi ý mang tính tham khảo; hãy đối chiếu với hoàn cảnh, sức khỏe và kế hoạch thực tế.</p></section>';

    resultArea.innerHTML = html;
    I18n.localizeDocument(resultArea);

    // Draw radar chart + enable drag scroll
    requestAnimationFrame(function () {
      var canvas = $('radar-canvas');
      if (canvas) drawRadarChart(canvas, elCounts);
      var luckScroll = document.querySelector('.luck-pillars-scroll');
      if (luckScroll) enableDragScroll(luckScroll);
    });
  }

  // -----------------------------------------------------------------------
  //  Liu Yao Tab Rendering
  // -----------------------------------------------------------------------

  function updateLiuyaoInputs() {
    var method = $('liuyao-method') ? $('liuyao-method').value : 'time';
    var timeInputs = $('liuyao-time-inputs');
    var numInputs = $('liuyao-number-inputs');
    if (timeInputs) timeInputs.style.display = method === 'time' ? 'block' : 'none';
    if (numInputs) numInputs.style.display = method === 'number' ? 'block' : 'none';
  }

  function castLiuyao() {
    var method = $('liuyao-method') ? $('liuyao-method').value : 'time';
    var result;

    if (method === 'time') {
      result = liuYaoCastByTime(new Date());
    } else if (method === 'number') {
      var n1 = parseInt($('liuyao-num1').value, 10) || 0;
      var n2 = parseInt($('liuyao-num2').value, 10) || 0;
      var n3Val = $('liuyao-num3').value;
      var n3 = n3Val !== '' ? parseInt(n3Val, 10) : null;
      result = liuYaoCastByNumber(n1, n2, n3);
    } else {
      result = liuYaoCastByCoin();
    }

    renderLiuyaoResult(result);
  }

  function plainLanguageReading(primary, changed, movingNames) {
    var text = '<strong>Tình huống gần gũi:</strong> ' + I18n.hexagramEverydaySituation(primary[0], I18n.hexagramDescription(primary[0], primary[5]));
    text += '<br><strong>Nên làm:</strong> ' + I18n.hexagramPlainAdvice(primary[0], I18n.hexagramDescription(primary[0], primary[5]));
    if (movingNames.length) {
      var movingDetail = { 'Sơ hào':'việc mới khởi động và dữ kiện ban đầu', 'Nhị hào':'cách trao đổi, phối hợp hoặc điều kiện gần nhất', 'Tam hào':'giai đoạn triển khai giữa chừng', 'Tứ hào':'thời điểm sắp phải lựa chọn hoặc chuyển hướng', 'Ngũ hào':'nút quyết định, người chủ việc hoặc phần cốt lõi', 'Thượng hào':'bước kết thúc, bàn giao hoặc dừng lại' };
      text += '<br><strong>Điểm đang đổi:</strong> ' + movingNames.map(function (name) { return name + ' liên quan đến ' + (movingDetail[name] || 'phần cần rà soát'); }).join('; ') + '. Hãy kiểm tra phần này trước khi quyết định.';
    }
    if (changed) text += '<br><strong>Hướng tiếp theo:</strong> ' + I18n.hexagramPlainAdvice(changed[0], I18n.hexagramDescription(changed[0], changed[5]));
    if (primary[0] === 5 && changed && changed[0] === 11) {
      text += '<br><strong>Ví dụ áp dụng:</strong> Nếu đang chờ duyệt việc, ký hợp đồng hoặc nhận phản hồi, hãy hoàn thiện hồ sơ và hỏi rõ mốc trả lời. Khi người quyết định đã phản hồi, chuyển sang phối hợp triển khai thay vì tiếp tục chờ.';
    } else if (primary[0] === 34 && changed && changed[0] === 32) {
      text += '<br><strong>Ví dụ áp dụng:</strong> Nếu muốn đẩy nhanh một dự án hoặc mối quan hệ, đừng ép tiến độ. Chọn một bước nhỏ có thể lặp lại hằng tuần, rồi theo dõi kết quả trước khi mở rộng.';
    } else {
      text += '<br><strong>Ví dụ áp dụng:</strong> Hãy chọn một việc cụ thể đang khiến bạn băn khoăn, xác định phần đang đổi ở trên, rồi thực hiện một bước nhỏ theo hướng quẻ biến trong hôm nay.';
    }
    return text;
  }

  function baziPlainLanguageReading(chart, strength, elements, favorable, relationships, pattern) {
    var elementNames = { '木': 'Mộc', '火': 'Hỏa', '土': 'Thổ', '金': 'Kim', '水': 'Thủy' };
    var elementActions = {
      '木': 'học thêm, mở rộng quan hệ và bắt đầu việc có thể phát triển dần',
      '火': 'trình bày, giao tiếp và đưa sản phẩm hoặc ý tưởng ra ánh sáng',
      '土': 'lập quy trình, giữ cam kết và củng cố nền tảng tài chính',
      '金': 'dùng số liệu, công cụ và nguyên tắc để giảm sai sót',
      '水': 'giữ nhịp linh hoạt, nghỉ ngơi đủ và trao đổi trước khi chốt việc'
    };
    var dm = elementNames[chart.dayMasterElement] || I18n.hanViet(chart.dayMasterElement || '');
    var level = I18n.hanViet(strength.level || '');
    var direction = strength.isStrong
      ? 'Bạn có xu hướng tự gánh và thúc việc; nên chọn một ưu tiên chính, giao bớt phần phụ và tránh nhận quá nhiều cam kết cùng lúc.'
      : 'Bạn nên chia mục tiêu thành bước nhỏ, chủ động tìm người hỗ trợ và giữ lịch sinh hoạt đều trước khi mở rộng việc.';
    var useful = (favorable.favorable || []).map(function (item) {
      return I18n.hanViet(item);
    });
    var usefulActions = (favorable.favorable || []).map(function (item) {
      var key = item.charAt(0);
      return elementActions[key];
    }).filter(Boolean);
    var missing = (elements.missing || []).map(function (idx) {
      var key = ['木', '火', '土', '金', '水'][idx];
      return elementNames[key] || key;
    });
    var relationTip = relationships.length
      ? 'Khi phối hợp với người khác, hãy xác nhận rõ vai trò, thời hạn và điều khoản bằng văn bản.'
      : 'Quan hệ hiện không có điểm xung nổi bật; duy trì giao tiếp đều và đừng để việc nhỏ tồn đọng.';
    var patternName = I18n.hanViet(pattern.pattern || '');
    var html = '<p>Nhật chủ ' + dm + ', trạng thái ' + level + '. Hiểu đơn giản, đây là cách bạn đang phân bổ năng lượng trong công việc và đời sống; không phải kết luận cố định.</p>';
    html += '<ul><li><strong>Việc nên làm:</strong> ' + direction + '</li>';
    html += '<li><strong>Hướng ưu tiên:</strong> ' + (useful.length ? useful.join('、') + '. ' + usefulActions.join('; ') + '.' : 'giữ nhịp ổn định, hoàn thành việc đang dang dở trước khi mở thêm mục tiêu.') + '</li>';
    if (missing.length) html += '<li><strong>Điểm cần bù:</strong> ' + missing.join('、') + '; hãy tạo thói quen hoặc môi trường mang tính chất này thay vì chờ cảm hứng.</li>';
    html += '<li><strong>Quan hệ và phối hợp:</strong> ' + relationTip + '</li></ul>';
    html += '<p><strong>Cách áp dụng tuần này:</strong> chọn một việc gắn với cách cục ' + patternName + ', đặt hạn hoàn thành cụ thể và xem lại kết quả sau 7 ngày.</p>';
    return html;
  }

  function ziweiPlainLanguageReading(chart) {
    var byName = {};
    chart.palaces.forEach(function (palace) { byName[palace.name] = palace; });
    var life = byName['命宫'];
    var career = byName['官禄宫'];
    var wealth = byName['财帛宫'];
    var health = byName['疾厄宫'];
    function stars(palace) {
      return palace && palace.stars.length ? palace.stars.map(function (star) { return I18n.hanViet(star); }).join(', ') : 'chưa có chính tinh';
    }
    var html = '<p>Phần này đọc lá số theo ngôn ngữ đời thường: Cung Mệnh nói về cách bạn tự vận hành, Cung Quan Lộc về cách làm việc, Cung Tài Bạch về cách quản lý nguồn lực và Cung Tật Ách về nếp chăm sóc thân tâm.</p>';
    html += '<ul><li><strong>Cách vận hành:</strong> Cung Mệnh (' + stars(life) + ') — chọn một vai trò phù hợp, đừng cố làm mọi việc cùng lúc.</li>';
    html += '<li><strong>Công việc:</strong> Cung Quan Lộc (' + stars(career) + ') — ghi rõ mục tiêu tuần, người phụ trách và tiêu chí hoàn thành.</li>';
    html += '<li><strong>Tài chính:</strong> Cung Tài Bạch (' + stars(wealth) + ') — tách tiền sinh hoạt, tiền dự phòng và tiền đầu tư; kiểm tra một lần mỗi tuần.</li>';
    html += '<li><strong>Sức khỏe:</strong> Cung Tật Ách (' + stars(health) + ') — giữ giờ ngủ, vận động nhẹ và xử lý sớm dấu hiệu kéo dài.</li></ul>';
    html += '<p><strong>Cách áp dụng:</strong> chọn một mục tiêu 30 ngày, chia thành bốn mốc tuần và điều chỉnh theo dữ kiện thực tế thay vì xem đây là định mệnh.</p>';
    return html;
  }

  function renderLiuyaoResult(result) {
    var area = $('liuyao-result');
    if (!area) return;

    var html = '';

    // Hexagram info header
    var ph = result.primaryHex;
    html += '<div class="hex-header">';
    html += '<div class="hex-primary"><h3>' + I18n.t('primaryHex') + '</h3>';
    html += '<div class="hex-symbol">' + ph[2] + '</div>';
    html += '<div class="hex-name">' + I18n.hexagramName(ph[0], ph[1]) + ' (' + I18n.t('hexagram') + ' ' + ph[0] + ')</div>';
    html += '<div class="hex-desc">' + I18n.hexagramDescription(ph[0], ph[5]) + '</div></div>';

    if (result.changedHex) {
      var ch = result.changedHex;
      html += '<div class="hex-arrow">&rarr;</div>';
      html += '<div class="hex-changed"><h3>' + I18n.t('changedHex') + '</h3>';
      html += '<div class="hex-symbol">' + ch[2] + '</div>';
      html += '<div class="hex-name">' + I18n.hexagramName(ch[0], ch[1]) + ' (' + I18n.t('hexagram') + ' ' + ch[0] + ')</div>';
      html += '<div class="hex-desc">' + I18n.hexagramDescription(ch[0], ch[5]) + '</div></div>';
    }
    html += '</div>';

    var relations = hexagramRelations(ph);
    var relationCards = [
      ['Hỗ quái (互卦)', relations.mutual, 'Nội tình và động lực ẩn bên trong sự việc.'],
      ['Thác quái (錯卦)', relations.opposite, 'Mặt đối lập; điều cần nhìn từ phía ngược lại.'],
      ['Tông quái (綜卦)', relations.inverse, 'Góc nhìn đảo chiều; xem sự việc từ phía bên kia.'],
      ['Giao quái (交卦)', relations.exchange, 'Đổi vị trí Thượng quái và Hạ quái để thấy tương quan.']
    ];
    html += '<section class="hex-relations"><h3>Quan hệ quẻ</h3><p class="hex-relations-intro">Các quẻ phụ giúp mở rộng góc nhìn, không thay thế quẻ chủ và quẻ biến.</p><div class="hex-relations-grid">';
    relationCards.forEach(function (card) {
      html += '<div class="hex-relation-card"><h4>' + card[0] + '</h4><div class="hex-relation-symbol">' + card[1][2] + '</div><div class="hex-relation-name">' + I18n.hexagramName(card[1][0], card[1][1]) + ' (' + I18n.t('hexagram') + ' ' + card[1][0] + ')</div><p>' + card[2] + '</p></div>';
    });
    html += '</div></section>';

    // SVG hexagram visualization
    html += '<div class="hex-visual">';
    html += '<div class="hex-svg-wrap">';
    html += '<h4>' + I18n.t('primaryHex') + '</h4>';
    html += buildHexagramSVG(result.primaryLines, result.movingPositions);
    html += '</div>';
    if (result.changedHex) {
      html += '<div class="hex-svg-wrap">';
      html += '<h4>' + I18n.t('changedHex') + '</h4>';
      html += buildHexagramSVG(result.changedLines, []);
      html += '</div>';
    }
    html += '</div>';

    // Moving lines summary
    html += '<div class="hex-moving">';
    html += '<strong>' + I18n.t('movingLines') + ':</strong> ';
    if (result.movingPositions.length > 0) {
      var posNames = ['Sơ','Nhị','Tam','Tứ','Ngũ','Thượng'];
      html += result.movingPositions.map(function (p) { return posNames[p - 1] + I18n.t('linePosition'); }).join(', ');
    } else {
      html += I18n.t('noMovingLines');
    }
    html += '</div>';

    // Lines detail table
    html += '<div class="hex-lines-table"><table><thead><tr>';
    html += '<th>' + I18n.t('linePosition') + '</th>';
    html += '<th>' + I18n.t('lineYang') + '/' + I18n.t('lineYin') + '</th>';
    html += '<th>' + I18n.t('movingMark') + '</th>';
    html += '</tr></thead><tbody>';
    var lineNames = ['Sơ','Nhị','Tam','Tứ','Ngũ','Thượng'];
    for (var i = 5; i >= 0; i--) {
      var isYang = result.primaryLines[i] === 1;
      var isMoving = result.movingPositions.indexOf(i + 1) !== -1;
      html += '<tr' + (isMoving ? ' class="moving-row"' : '') + '>';
      html += '<td>' + lineNames[i] + '</td>';
      html += '<td>' + (isYang ? I18n.t('lineYang') : I18n.t('lineYin')) + '</td>';
      html += '<td>' + (isMoving ? I18n.t('movingMark') : '') + '</td>';
      html += '</tr>';
    }
    html += '</tbody></table></div>';

    var structured = analyzeLiuyaoResult(result);
    if (structured) {
      var relativeNames = { '兄弟': 'Huynh đệ', '子孙': 'Tử tôn', '父母': 'Phụ mẫu', '妻财': 'Thê tài', '官鬼': 'Quan quỷ' };
      var godNames = { '青龙': 'Thanh Long', '朱雀': 'Chu Tước', '勾陈': 'Câu Trần', '腾蛇': 'Đằng Xà', '白虎': 'Bạch Hổ', '玄武': 'Huyền Vũ' };
      var elementNames = { '木': 'Mộc', '火': 'Hỏa', '土': 'Thổ', '金': 'Kim', '水': 'Thủy' };
      html += '<section class="liuyao-analysis"><h3>Trang bị Lục Hào</h3>';
      html += '<p class="liuyao-analysis-note">Bảng tham chiếu giản lược: Thế–Ứng, nạp chi, Ngũ hành, Lục Thân và Lục Thú. Muốn luận vượng suy đầy đủ cần bổ sung nhật thần, nguyệt kiến và dụng thần.</p>';
      if (structured.calendar) {
        var dayPillar = structured.calendar.dayPillar;
        var monthPillar = structured.calendar.monthPillar;
        var cycleLabel = function (value) { return value.split('').map(function (char) { return I18n.hanViet(char); }).join(' '); };
        var xunStart = mod(dayPillar.branchIndex - dayPillar.stemIndex, 12);
        var voidBranches = [mod(xunStart + 10, 12), mod(xunStart + 11, 12)].map(function (idx) { return BRANCHES[idx]; });
        html += '<div class="liuyao-calendar-context"><strong>Nhật thần:</strong> ' + dayPillar.char + ' (' + cycleLabel(dayPillar.char) + ') · <strong>Nguyệt kiến:</strong> ' + monthPillar.char + ' (' + cycleLabel(monthPillar.char) + ') · <strong>Tuần không:</strong> ' + voidBranches.join('、') + '</div>';
      }
      html += '<div class="hex-lines-table"><table><thead><tr><th>Hào</th><th>Nạp chi</th><th>Ngũ hành</th><th>Lục Thân</th><th>Lục Thú</th><th>Vai trò</th><th>Trạng thái</th><th>Thời khí</th></tr></thead><tbody>';
      for (var ai = structured.lines.length - 1; ai >= 0; ai--) {
        var line = structured.lines[ai];
        var roles = [];
        if (line.isWorld) roles.push('Thế 世');
        if (line.isResponse) roles.push('Ứng 應');
        html += '<tr' + (line.isMoving ? ' class="moving-row"' : '') + '><td>' + I18n.hanViet(line.name) + ' hào</td>';
        html += '<td>' + I18n.hanViet(line.branch) + '</td><td>' + (elementNames[line.element] || line.element) + '</td>';
        html += '<td>' + (relativeNames[line.sixRelative] || line.sixRelative) + '</td><td>' + (godNames[line.sixGod] || line.sixGod) + '</td>';
        html += '<td>' + (roles.length ? roles.join(' / ') : '—') + '</td><td>' + (line.isMoving ? 'Động' : 'Tĩnh') + '</td><td class="liuyao-time-state">' + liuyaoTimeStates(line, structured.calendar).join(' · ') + '</td></tr>';
      }
      html += '</tbody></table></div></section>';
    }

    var movingNames = result.movingPositions.map(function (p) {
      return ['Sơ', 'Nhị', 'Tam', 'Tứ', 'Ngũ', 'Thượng'][p - 1] + ' hào';
    });
    html += '<section class="hex-interpretation">';
    html += '<h3>Luận giải quẻ</h3>';
    html += '<div class="interpretation-block"><h4>Quẻ chủ — ' + I18n.hexagramName(ph[0], ph[1]) + '</h4>';
    html += '<p>' + I18n.hexagramDescription(ph[0], ph[5]) + '</p>';
    html += '<p>Đây là tượng quẻ thể hiện bối cảnh hiện tại; hãy đối chiếu với sự việc thực tế trước khi kết luận.</p></div>';
    if (result.changedHex) {
      html += '<div class="interpretation-block"><h4>Quẻ biến — ' + I18n.hexagramName(ch[0], ch[1]) + '</h4>';
      html += '<p>' + I18n.hexagramDescription(ch[0], ch[5]) + '</p>';
      html += '<p>Quẻ biến gợi ý chiều hướng khi hào động chuyển hóa; nên xem như một góc chiêm nghiệm, không phải kết quả định sẵn.</p></div>';
    }
    html += '<div class="interpretation-block"><h4>Hào động</h4><p>';
    html += movingNames.length ? 'Hào động: <strong>' + movingNames.join(', ') + '</strong>. Đây là điểm chuyển biến cần lưu tâm; ưu tiên quan sát, điều chỉnh từng bước và tránh quyết định hấp tấp.' : 'Không có hào động; nên xem trọng ý nghĩa tổng thể của quẻ chủ.';
    html += '</p></div>';
    html += '<div class="interpretation-block interpretation-plain"><h4>Cách hiểu đời thường</h4><p>' + plainLanguageReading(ph, result.changedHex, movingNames) + '</p></div>';
    html += '<p class="interpretation-note">Nội dung chỉ nhằm tham khảo văn hóa Kinh Dịch và hỗ trợ suy ngẫm cá nhân.</p></section>';

    area.innerHTML = html;
    I18n.localizeDocument(area);
  }

  // -----------------------------------------------------------------------
  //  Zi Wei Tab Rendering
  // -----------------------------------------------------------------------

  function calculateZiwei() {
    var yVal = $('ziwei-year') ? parseInt($('ziwei-year').value, 10) : 0;
    var mVal = $('ziwei-month') ? parseInt($('ziwei-month').value, 10) : 0;
    var dVal = $('ziwei-day') ? parseInt($('ziwei-day').value, 10) : 0;
    var hVal = $('ziwei-hour') ? parseInt($('ziwei-hour').value, 10) : 12;
    var genderEl = document.querySelector('input[name="ziwei-gender"]:checked');
    var gender = genderEl ? genderEl.value : 'male';

    var area = $('ziwei-result');
    if (!area) return;

    if (!yVal || !mVal || !dVal) {
      area.innerHTML = '<p class="empty-state">' + I18n.t('noData') + '</p>';
      return;
    }

    var chart = ziWeiCalc(yVal, mVal, dVal, hVal, gender);

    // Build the 4x4 grid (traditional layout)
    // Layout: rows and cols mapped to branch positions
    //   [巳4] [午5] [未6] [申7]
    //   [辰3]               [酉8]
    //   [卯2]               [戌9]
    //   [寅1] [丑0] [子11] [亥10]
    // Wait -- branches: 子0 丑1 寅2 卯3 辰4 巳5 午6 未7 申8 酉9 戌10 亥11
    // Traditional grid positions (branch index -> row, col):
    var gridMap = {
      5:  [0,0], 6:  [0,1], 7:  [0,2], 8:  [0,3],
      4:  [1,0],                         9:  [1,3],
      3:  [2,0],                         10: [2,3],
      2:  [3,0], 1:  [3,1], 0:  [3,2], 11: [3,3],
    };

    // Build a lookup: position -> palace
    var posToPalace = {};
    chart.palaces.forEach(function (p) { posToPalace[p.position] = p; });

    // Palace name i18n keys
    var palaceI18nKeys = [
      'palaceLife','palaceSiblings','palaceSpouse','palaceChildren',
      'palaceWealth','palaceHealth','palaceTravel','palaceServants',
      'palaceCareer','palaceProperty','palaceFortune','palaceParents'
    ];
    var palaceDescKeys = [
      'palaceLifeDesc','palaceSiblingsDesc','palaceSpouseDesc','palaceChildrenDesc',
      'palaceWealthDesc','palaceHealthDesc','palaceTravelDesc','palaceServantsDesc',
      'palaceCareerDesc','palacePropertyDesc','palaceFortuneDesc','palaceParentsDesc'
    ];

    var html = '<div class="ziwei-grid">';

    for (var row = 0; row < 4; row++) {
      for (var col = 0; col < 4; col++) {
        // Find which branch maps here
        var branchIdx = -1;
        for (var bi in gridMap) {
          if (gridMap[bi][0] === row && gridMap[bi][1] === col) {
            branchIdx = parseInt(bi, 10);
            break;
          }
        }

        if (branchIdx === -1) {
          // Center cells (row 1-2, col 1-2) -- empty or chart info
          if (row === 1 && col === 1) {
            html += '<div class="ziwei-cell ziwei-center" style="grid-row:2/4;grid-column:2/4">';
            html += '<h2>' + I18n.t('tabZiwei') + '</h2>';
            html += '<p>' + I18n.t('lunarDate') + ': ' + yVal + '/' + mVal + '/' + dVal + '</p>';
            html += '</div>';
          }
          // Skip other center cells (already spanned)
          continue;
        }

        var palace = posToPalace[branchIdx];
        var palaceName = '';
        var palaceDesc = '';
        var starsHtml = '';

        if (palace) {
          var pIdx = ZW_PALACES.indexOf(palace.name);
          palaceName = pIdx >= 0 ? I18n.t(palaceI18nKeys[pIdx]) : palace.name;
          palaceDesc = pIdx >= 0 ? I18n.t(palaceDescKeys[pIdx]) : '';
          if (palace.stars.length > 0) {
            starsHtml = palace.stars.map(function (s) {
              return '<span class="zw-star">' + s + '</span>';
            }).join(' ');
          } else {
            starsHtml = '<span class="zw-no-star">' + I18n.t('noMajorStar') + '</span>';
          }
        }

        html += '<div class="ziwei-cell" title="' + palaceDesc + '" style="grid-row:' + (row+1) + ';grid-column:' + (col+1) + '">';
        html += '<div class="zw-branch">' + BRANCHES[branchIdx] + '</div>';
        html += '<div class="zw-palace-name">' + palaceName + '</div>';
        html += '<div class="zw-stars">' + starsHtml + '</div>';
        html += '</div>';
      }
    }
    html += '</div>';

    html += '<section class="hex-interpretation everyday-reading"><h3>Cách hiểu đời thường</h3>';
    html += ziweiPlainLanguageReading(chart);
    html += '<p class="interpretation-note">Gợi ý mang tính tham khảo văn hóa; không thay thế tư vấn chuyên môn.</p></section>';

    area.innerHTML = html;
    I18n.localizeDocument(area);
  }

  // -----------------------------------------------------------------------
  //  Share Feature
  // -----------------------------------------------------------------------

  function generateShareUrl() {
    var params = {};
    if (activeTab === 'bazi') {
      params.tab = 'bazi';
      params.date = $('bazi-date') ? $('bazi-date').value : '';
      params.hour = $('bazi-hour') ? $('bazi-hour').value : '12';
      var g = document.querySelector('input[name="bazi-gender"]:checked');
      params.gender = g ? g.value : 'male';
    } else if (activeTab === 'ziwei') {
      params.tab = 'ziwei';
      params.y = $('ziwei-year') ? $('ziwei-year').value : '';
      params.m = $('ziwei-month') ? $('ziwei-month').value : '';
      params.d = $('ziwei-day') ? $('ziwei-day').value : '';
      params.h = $('ziwei-hour') ? $('ziwei-hour').value : '12';
    }
    var encoded = btoa(JSON.stringify(params));
    return window.location.origin + window.location.pathname + '#' + encoded;
  }

  function copyShareLink() {
    var url = generateShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        showToast(I18n.t('copied'));
      });
    } else {
      // Fallback
      var ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(I18n.t('copied'));
    }
  }

  function showToast(msg) {
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('show'); });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { document.body.removeChild(toast); }, 300);
    }, 1800);
  }

  /** Parse URL hash and restore state if present. */
  function parseShareHash() {
    var hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    try {
      var decoded = JSON.parse(atob(hash.substring(1)));
      if (decoded.tab === 'bazi') {
        if (decoded.date && $('bazi-date')) $('bazi-date').value = decoded.date;
        if (decoded.hour && $('bazi-hour')) $('bazi-hour').value = decoded.hour;
        if (decoded.gender) {
          var radio = document.querySelector('input[name="bazi-gender"][value="' + decoded.gender + '"]');
          if (radio) radio.checked = true;
        }
        switchTab('bazi');
      } else if (decoded.tab === 'ziwei') {
        if (decoded.y && $('ziwei-year')) $('ziwei-year').value = decoded.y;
        if (decoded.m && $('ziwei-month')) $('ziwei-month').value = decoded.m;
        if (decoded.d && $('ziwei-day')) $('ziwei-day').value = decoded.d;
        if (decoded.h && $('ziwei-hour')) $('ziwei-hour').value = decoded.h;
        switchTab('ziwei');
      }
    } catch (e) {
      // Invalid hash -- ignore silently
    }
  }

  // -----------------------------------------------------------------------
  //  Initialization
  // -----------------------------------------------------------------------

  // -----------------------------------------------------------------------
  //  Background Particle Canvas (subtle bagua / taiji particles)
  // -----------------------------------------------------------------------

  function initBgCanvas() {
    var canvas = $('bg-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var PARTICLE_COUNT = 30;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.15,
        dy: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.3 + 0.05
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      for (var j = 0; j < particles.length; j++) {
        var p = particles[j];
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? 'rgba(212, 175, 55, ' + p.opacity + ')'
          : 'rgba(180, 140, 40, ' + (p.opacity * 0.5) + ')';
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    // Only animate if user allows
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      draw();
    }
  }

  // -----------------------------------------------------------------------
  //  Drag-to-scroll for luck pillars timeline
  // -----------------------------------------------------------------------

  function enableDragScroll(container) {
    if (!container) return;
    var isDown = false, startX, scrollLeft;
    container.addEventListener('mousedown', function (e) {
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      container.style.cursor = 'grabbing';
    });
    container.addEventListener('mouseleave', function () { isDown = false; container.style.cursor = 'grab'; });
    container.addEventListener('mouseup', function () { isDown = false; container.style.cursor = 'grab'; });
    container.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - container.offsetLeft;
      container.scrollLeft = scrollLeft - (x - startX);
    });
  }

  // -----------------------------------------------------------------------
  //  Initialization
  // -----------------------------------------------------------------------

  function init() {
    // Detect initial theme from HTML attribute
    darkTheme = document.documentElement.getAttribute('data-theme') === 'dark';

    // Initialize background particles
    initBgCanvas();

    // Build hour selector
    rebuildHourSelector();

    // Set default date to today
    var today = new Date();
    var dateStr = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');
    if ($('bazi-date')) $('bazi-date').value = dateStr;

    // Desktop tab buttons
    ['bazi','liuyao','ziwei'].forEach(function (t) {
      var btn = $('tab-' + t);
      if (btn) btn.addEventListener('click', function () { switchTab(t); });
    });

    // Mobile bottom nav buttons
    var bottomItems = document.querySelectorAll('.bottom-nav-item');
    for (var bi = 0; bi < bottomItems.length; bi++) {
      (function (item) {
        item.addEventListener('click', function () {
          var tab = item.getAttribute('data-tab');
          if (tab) switchTab(tab);
        });
      })(bottomItems[bi]);
    }

    // Hero CTA button — scroll to main content
    var heroCta = $('hero-cta-btn');
    if (heroCta) {
      heroCta.addEventListener('click', function () {
        var main = $('main-content');
        if (main) main.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Theme toggle
    var themeBtn = $('theme-toggle');
    if (themeBtn) {
      themeBtn.textContent = darkTheme ? '🌙' : '☀️';
      themeBtn.addEventListener('click', toggleTheme);
    }

    // Language toggle
    var langBtn = $('lang-toggle');
    if (langBtn) {
      langBtn.textContent = 'EN';
      langBtn.addEventListener('click', toggleLang);
    }

    // BaZi real-time calculation
    if ($('bazi-date')) $('bazi-date').addEventListener('change', calculateBazi);
    if ($('bazi-hour')) $('bazi-hour').addEventListener('change', calculateBazi);
    var genderRadios = document.querySelectorAll('input[name="bazi-gender"]');
    for (var i = 0; i < genderRadios.length; i++) {
      genderRadios[i].addEventListener('change', calculateBazi);
    }

    // Liu Yao
    if ($('liuyao-method')) {
      $('liuyao-method').addEventListener('change', updateLiuyaoInputs);
      updateLiuyaoInputs();
    }
    if ($('liuyao-cast-btn')) $('liuyao-cast-btn').addEventListener('click', castLiuyao);

    // Zi Wei real-time calculation
    ['ziwei-year','ziwei-month','ziwei-day','ziwei-hour'].forEach(function (id) {
      if ($(id)) $(id).addEventListener('change', calculateZiwei);
    });
    var zwGenders = document.querySelectorAll('input[name="ziwei-gender"]');
    for (var g = 0; g < zwGenders.length; g++) {
      zwGenders[g].addEventListener('change', calculateZiwei);
    }

    // Share / copy link
    if ($('share-btn')) $('share-btn').addEventListener('click', copyShareLink);

    // Reset button
    if ($('reset-btn')) {
      $('reset-btn').addEventListener('click', function () {
        if ($('bazi-date')) $('bazi-date').value = dateStr;
        if ($('bazi-hour')) $('bazi-hour').value = '0';
        var mr = document.querySelector('input[name="bazi-gender"][value="male"]');
        if (mr) mr.checked = true;
        calculateBazi();
      });
    }

    // Apply translations
    applyI18n();

    // Parse URL hash for shared charts
    parseShareHash();

    // Initial tab
    switchTab(activeTab);
    I18n.localizeDocument(document.body);

    // Enable drag scroll on any existing luck pillar containers
    var luckScroll = document.querySelector('.luck-pillars-scroll');
    if (luckScroll) enableDragScroll(luckScroll);
  }

  // -----------------------------------------------------------------------
  //  DOM Ready
  // -----------------------------------------------------------------------

  document.addEventListener('DOMContentLoaded', init);

  // Public API (for debugging / extension)
  return {
    switchTab: switchTab,
    calculateBazi: calculateBazi,
    castLiuyao: castLiuyao,
    calculateZiwei: calculateZiwei,
    toggleTheme: toggleTheme,
    toggleLang: toggleLang,
    drawRadarChart: drawRadarChart,
    buildHexagramSVG: buildHexagramSVG,
    copyShareLink: copyShareLink,
    enableDragScroll: enableDragScroll,
  };
})();
