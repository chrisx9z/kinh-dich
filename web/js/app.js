/**
 * 天机 Web 前端主应用逻辑
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==================== Tab Switching ====================
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // ==================== 八字排盘 (BaZi) ====================
    initBaZiForm();

    function initBaZiForm() {
        const yearSelect = document.getElementById('bazi-year');
        const monthSelect = document.getElementById('bazi-month');
        const daySelect = document.getElementById('bazi-day');
        
        // Populate years (1920-2030)
        for (let y = 2030; y >= 1920; y--) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = `${y}年`;
            yearSelect.appendChild(opt);
        }
        yearSelect.value = '1990';

        // Populate months
        for (let m = 1; m <= 12; m++) {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = `${m}月`;
            monthSelect.appendChild(opt);
        }

        // Populate days
        for (let d = 1; d <= 31; d++) {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = `${d}日`;
            daySelect.appendChild(opt);
        }

        // Calculate button
        document.getElementById('bazi-calculate').addEventListener('click', calculateBaZi);
    }

    function calculateBaZi() {
        const year = parseInt(document.getElementById('bazi-year').value);
        const month = parseInt(document.getElementById('bazi-month').value);
        const day = parseInt(document.getElementById('bazi-day').value);
        const hourStr = document.getElementById('bazi-hour').value;
        const gender = document.getElementById('bazi-gender').value;
        
        // Parse hour from shichen value
        const hour = parseInt(hourStr);

        const chart = BaZi.createChart(year, month, day, hour, gender);
        renderBaZiResult(chart);
        
        // Show results with animation
        const resultDiv = document.getElementById('bazi-result');
        resultDiv.style.display = 'block';
        resultDiv.classList.add('fade-in');
    }

    function renderBaZiResult(chart) {
        renderFourPillars(chart);
        renderFiveElements(chart);
        renderTenGods(chart);
        renderStrength(chart);
        renderLuckPillars(chart);
    }

    function renderFourPillars(chart) {
        const container = document.getElementById('four-pillars');
        const pillars = [
            { name: '年柱', pillar: chart.yearPillar, god: chart.tenGods['年干'] },
            { name: '月柱', pillar: chart.monthPillar, god: chart.tenGods['月干'] },
            { name: '日柱', pillar: chart.dayPillar, god: '日主' },
            { name: '时柱', pillar: chart.hourPillar, god: chart.tenGods['时干'] },
        ];

        container.innerHTML = pillars.map(({ name, pillar, god }) => {
            const stemColor = BaZi.ELEMENT_COLORS[pillar.stem.element];
            const branchColor = BaZi.ELEMENT_COLORS[pillar.branch.element];
            const stemBg = BaZi.ELEMENT_BG_COLORS[pillar.stem.element];
            const branchBg = BaZi.ELEMENT_BG_COLORS[pillar.branch.element];
            const hiddenStems = pillar.branch.hiddenStems.map(ch => {
                const s = BaZi.getStemByChar(ch);
                return `<span class="hidden-stem" style="color:${BaZi.ELEMENT_COLORS[s.element]}">${ch}</span>`;
            }).join('');

            return `
                <div class="pillar-card">
                    <div class="pillar-label">${name}</div>
                    <div class="pillar-god">${god}</div>
                    <div class="pillar-stem" style="color:${stemColor};background:${stemBg}">
                        ${pillar.stem.char}
                        <span class="element-tag">${pillar.stem.element}${pillar.stem.polarity}</span>
                    </div>
                    <div class="pillar-branch" style="color:${branchColor};background:${branchBg}">
                        ${pillar.branch.char}
                        <span class="element-tag">${pillar.branch.element}${pillar.branch.polarity}</span>
                    </div>
                    <div class="pillar-hidden">
                        <span class="hidden-label">藏干</span>
                        ${hiddenStems}
                    </div>
                    <div class="pillar-zodiac">${name === '年柱' ? pillar.branch.zodiac : ''}</div>
                </div>
            `;
        }).join('');
    }

    function renderFiveElements(chart) {
        const container = document.getElementById('five-elements');
        const elements = chart.fiveElements;
        const total = Object.values(elements).reduce((s, v) => s + v, 0);
        
        const elementNames = ['木', '火', '土', '金', '水'];
        const colors = elementNames.map(e => BaZi.ELEMENT_COLORS[e]);

        // SVG Pie Chart
        let cumulativePercent = 0;
        const slices = [];
        
        for (let i = 0; i < elementNames.length; i++) {
            const name = elementNames[i];
            const value = elements[name];
            const percent = total > 0 ? (value / total) * 100 : 20;
            
            const startAngle = (cumulativePercent / 100) * 360;
            const endAngle = ((cumulativePercent + percent) / 100) * 360;
            
            slices.push({
                name, value, percent,
                startAngle, endAngle,
                color: colors[i],
            });
            
            cumulativePercent += percent;
        }

        // Build SVG
        const cx = 100, cy = 100, r = 80;
        let svgSlices = '';
        
        for (const slice of slices) {
            if (slice.percent <= 0) continue;
            
            const startRad = (slice.startAngle - 90) * Math.PI / 180;
            const endRad = (slice.endAngle - 90) * Math.PI / 180;
            
            const x1 = cx + r * Math.cos(startRad);
            const y1 = cy + r * Math.sin(startRad);
            const x2 = cx + r * Math.cos(endRad);
            const y2 = cy + r * Math.sin(endRad);
            
            const largeArc = slice.percent > 50 ? 1 : 0;
            
            const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            svgSlices += `<path d="${d}" fill="${slice.color}" opacity="0.85" stroke="#1a1a2e" stroke-width="2"/>`;
            
            // Label
            const midAngle = ((slice.startAngle + slice.endAngle) / 2 - 90) * Math.PI / 180;
            const lx = cx + (r * 0.6) * Math.cos(midAngle);
            const ly = cy + (r * 0.6) * Math.sin(midAngle);
            if (slice.percent > 5) {
                svgSlices += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="12" font-weight="bold">${slice.name}</text>`;
            }
        }

        // Missing elements
        const missing = elementNames.filter(e => elements[e] === 0);

        container.innerHTML = `
            <div class="five-elements-chart">
                <svg viewBox="0 0 200 200" width="200" height="200">
                    ${svgSlices}
                </svg>
                <div class="five-elements-legend">
                    ${elementNames.map(e => `
                        <div class="legend-item">
                            <span class="legend-dot" style="background:${BaZi.ELEMENT_COLORS[e]}"></span>
                            <span class="legend-name">${e}</span>
                            <span class="legend-value">${elements[e].toFixed(1)}</span>
                        </div>
                    `).join('')}
                    ${missing.length > 0 ? `<div class="missing-elements">缺 ${missing.join('、')}</div>` : ''}
                </div>
            </div>
        `;
    }

    function renderTenGods(chart) {
        const container = document.getElementById('ten-gods');
        
        const positions = ['年柱', '月柱', '日柱', '时柱'];
        const pillars = [chart.yearPillar, chart.monthPillar, chart.dayPillar, chart.hourPillar];
        const gods = [chart.tenGods['年干'], chart.tenGods['月干'], '日主', chart.tenGods['时干']];

        let rows = '';
        for (let i = 0; i < 4; i++) {
            const godName = gods[i];
            const info = godName === '日主' ? { english: 'Day Master', meaning: '自我、命主' } : (BaZi.TEN_GOD_INFO[godName] || {});
            rows += `
                <tr>
                    <td class="td-pos">${positions[i]}</td>
                    <td style="color:${BaZi.ELEMENT_COLORS[pillars[i].stem.element]}">${pillars[i].stem.char}</td>
                    <td class="td-god">${godName}</td>
                    <td class="td-meaning">${info.meaning || ''}</td>
                </tr>
            `;
        }

        // Hidden stem gods
        const branchNames = ['年支', '月支', '日支', '时支'];
        for (let i = 0; i < 4; i++) {
            const hiddenGods = chart.hiddenStemGods[branchNames[i]] || [];
            if (hiddenGods.length > 0) {
                const main = hiddenGods[0];
                rows += `
                    <tr class="hidden-row">
                        <td class="td-pos">${branchNames[i]}藏</td>
                        <td style="color:${BaZi.ELEMENT_COLORS[main.stem.element]}">${main.stem.char}</td>
                        <td class="td-god">${main.god}</td>
                        <td class="td-meaning">${(BaZi.TEN_GOD_INFO[main.god] || {}).meaning || ''}</td>
                    </tr>
                `;
            }
        }

        container.innerHTML = `
            <table class="ten-gods-table">
                <thead>
                    <tr><th>位置</th><th>天干</th><th>十神</th><th>含义</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    function renderStrength(chart) {
        const container = document.getElementById('strength');
        const s = chart.strength;
        
        // Normalize score to 0-100 for display
        const normalized = Math.min(100, Math.max(0, ((s.score + 5) / 12) * 100));
        const barColor = s.isStrong ? '#FFD700' : '#888';

        container.innerHTML = `
            <div class="strength-display">
                <div class="strength-header">
                    <span class="day-master-char" style="color:${BaZi.ELEMENT_COLORS[s.dayMaster.element]}">
                        ${s.dayMaster.char}
                    </span>
                    <span class="strength-label">${s.dayMaster.element}${s.dayMaster.polarity}</span>
                </div>
                <div class="strength-level ${s.isStrong ? 'strong' : 'weak'}">
                    ${s.level}
                </div>
                <div class="strength-bar-container">
                    <div class="strength-bar" style="width:${normalized}%;background:${barColor}"></div>
                    <span class="strength-score">${s.score.toFixed(1)}</span>
                </div>
                <div class="strength-factors">
                    ${s.factors.map(f => `<div class="factor">${f}</div>`).join('')}
                </div>
            </div>
        `;
    }

    function renderLuckPillars(chart) {
        const container = document.getElementById('luck-pillars');
        const lp = chart.luckPillars;

        container.innerHTML = `
            <div class="luck-info">
                <span>起运年龄: <strong>${lp.startAge}岁</strong></span>
                <span>行运方向: <strong>${lp.direction}</strong></span>
            </div>
            <div class="luck-timeline">
                ${lp.pillars.map(p => `
                    <div class="luck-card">
                        <div class="luck-ages">${p.startAge}–${p.endAge}岁</div>
                        <div class="luck-stem" style="color:${BaZi.ELEMENT_COLORS[p.pillar.stem.element]}">
                            ${p.pillar.stem.char}
                        </div>
                        <div class="luck-branch" style="color:${BaZi.ELEMENT_COLORS[p.pillar.branch.element]}">
                            ${p.pillar.branch.char}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ==================== 六爻占卜 (LiuYao) ====================
    initLiuYao();

    function initLiuYao() {
        // Tab switching within LiuYao
        document.querySelectorAll('.liuyao-method-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.liuyao-method-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.liuyao-method-panel').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`liuyao-${btn.dataset.method}`).classList.add('active');
            });
        });

        // Time casting
        document.getElementById('liuyao-time-cast').addEventListener('click', () => {
            const result = LiuYao.castByTime();
            renderLiuYaoResult(result);
        });

        // Number casting
        document.getElementById('liuyao-number-cast').addEventListener('click', () => {
            const num1 = parseInt(document.getElementById('liuyao-num1').value) || 0;
            const num2 = parseInt(document.getElementById('liuyao-num2').value) || 0;
            const result = LiuYao.castByNumbers(num1, num2);
            renderLiuYaoResult(result);
        });

        // Coin casting
        let coinResults = [];
        const coinStatus = document.getElementById('coin-status');
        const coinBtn = document.getElementById('liuyao-coin-shake');
        const coinReset = document.getElementById('liuyao-coin-reset');

        coinBtn.addEventListener('click', () => {
            if (coinResults.length >= 6) return;
            
            const shake = LiuYao.shakeCoins();
            coinResults.push(shake.total);
            
            // Animate coins
            const coinsDiv = document.getElementById('coin-animation');
            coinsDiv.innerHTML = shake.coins.map(c => 
                `<span class="coin ${c === 3 ? 'heads' : 'tails'}">${c === 3 ? '字' : '背'}</span>`
            ).join('');
            coinsDiv.classList.add('shake-anim');
            setTimeout(() => coinsDiv.classList.remove('shake-anim'), 500);

            // Update status
            const lineNum = coinResults.length;
            const lineType = { 6: '老阴 ⚋×', 7: '老阳 ⚊×', 8: '少阴 ⚋', 9: '少阳 ⚊' };
            coinStatus.innerHTML += `<div class="coin-line">第${lineNum}爻: ${lineType[shake.total]} (${shake.total})</div>`;

            if (coinResults.length >= 6) {
                coinBtn.disabled = true;
                const result = LiuYao.castByCoins(coinResults);
                renderLiuYaoResult(result);
            }
        });

        coinReset.addEventListener('click', () => {
            coinResults = [];
            coinStatus.innerHTML = '';
            coinBtn.disabled = false;
            document.getElementById('coin-animation').innerHTML = '';
            document.getElementById('liuyao-result').style.display = 'none';
        });
    }

    function renderLiuYaoResult(result) {
        const container = document.getElementById('liuyao-result');
        container.style.display = 'block';
        container.classList.add('fade-in');

        const lineNames = ['初', '二', '三', '四', '五', '上'];
        
        // Render hexagram lines
        function renderHexagramLines(hexagram, rawLines, movingLines, shiYing) {
            const lines = hexagram.getLines();
            let html = '';
            for (let i = 5; i >= 0; i--) {
                const isYang = lines[i] === 1;
                const isMoving = movingLines && movingLines.includes(i + 1);
                const isShi = shiYing && shiYing.shi === (i + 1);
                const isYing = shiYing && shiYing.ying === (i + 1);
                
                let markerClass = '';
                if (isShi) markerClass = 'shi-marker';
                else if (isYing) markerClass = 'ying-marker';

                html += `
                    <div class="hex-line ${isMoving ? 'moving' : ''}">
                        <span class="line-name">${lineNames[i]}${isYang ? '九' : '六'}</span>
                        <div class="line-symbol ${isYang ? 'yang' : 'yin'}">
                            ${isYang ? '<div class="yang-line"></div>' : '<div class="yin-line"><span></span><span></span></div>'}
                        </div>
                        ${isMoving ? '<span class="moving-mark">← 动</span>' : ''}
                        ${markerClass ? `<span class="${markerClass}">${isShi ? '世' : '应'}</span>` : ''}
                    </div>
                `;
            }
            return html;
        }

        container.innerHTML = `
            <div class="liuyao-result-content">
                <div class="hexagram-display">
                    <div class="hexagram-section">
                        <h3>本卦</h3>
                        <div class="hexagram-symbol">${result.primary.symbol}</div>
                        <div class="hexagram-name">${result.primary.name}</div>
                        <div class="hexagram-trigrams">
                            ${result.primary.upper.symbol}${result.primary.upper.name}上 · ${result.primary.lower.symbol}${result.primary.lower.name}下
                        </div>
                        <div class="hexagram-lines">
                            ${renderHexagramLines(result.primary, result.rawLines, result.movingLines, result.shiYing)}
                        </div>
                        <div class="hexagram-desc">${result.primary.description}</div>
                    </div>
                    ${result.changed ? `
                    <div class="hexagram-arrow">➜</div>
                    <div class="hexagram-section changed">
                        <h3>变卦</h3>
                        <div class="hexagram-symbol">${result.changed.symbol}</div>
                        <div class="hexagram-name">${result.changed.name}</div>
                        <div class="hexagram-trigrams">
                            ${result.changed.upper.symbol}${result.changed.upper.name}上 · ${result.changed.lower.symbol}${result.changed.lower.name}下
                        </div>
                        <div class="hexagram-lines">
                            ${renderHexagramLines(result.changed, null, null, null)}
                        </div>
                        <div class="hexagram-desc">${result.changed.description}</div>
                    </div>
                    ` : ''}
                </div>
                <div class="casting-info">
                    <span>起卦方法: ${result.method}</span>
                    <span>动爻: ${result.movingLines.length > 0 ? result.movingLines.map(l => `第${l}爻`).join('、') : '无'}</span>
                </div>
            </div>
        `;
    }

    // ==================== 紫微斗数 (ZiWei) ====================
    initZiWei();

    function initZiWei() {
        const yearSelect = document.getElementById('ziwei-year');
        for (let y = 2030; y >= 1920; y--) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = `${y}年`;
            yearSelect.appendChild(opt);
        }
        yearSelect.value = '1990';

        const monthSelect = document.getElementById('ziwei-month');
        for (let m = 1; m <= 12; m++) {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = `${m}月`;
            monthSelect.appendChild(opt);
        }

        const daySelect = document.getElementById('ziwei-day');
        for (let d = 1; d <= 30; d++) {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = `${d}日`;
            daySelect.appendChild(opt);
        }

        document.getElementById('ziwei-calculate').addEventListener('click', calculateZiWei);
    }

    function calculateZiWei() {
        const year = parseInt(document.getElementById('ziwei-year').value);
        const month = parseInt(document.getElementById('ziwei-month').value);
        const day = parseInt(document.getElementById('ziwei-day').value);
        const hourStr = document.getElementById('ziwei-hour').value;
        const gender = document.getElementById('ziwei-gender').value;
        const hour = parseInt(hourStr);

        // Simplified ZiWei calculation
        const chart = generateZiWeiChart(year, month, day, hour, gender);
        renderZiWeiChart(chart);

        document.getElementById('ziwei-result').style.display = 'block';
        document.getElementById('ziwei-result').classList.add('fade-in');
    }

    // Simplified ZiWei Dou Shu calculation
    function generateZiWeiChart(year, month, day, hour, gender) {
        // 十二宫名称
        const palaceNames = [
            '命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄',
            '迁移', '交友', '官禄', '田宅', '福德', '父母'
        ];

        // 地支
        const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

        // 命宫定位: 以月、时定命宫
        // 简化算法: 命宫 = (月 + 时辰) 映射到地支
        const hourBranch = Math.floor((hour + 1) / 2) % 12;
        // 命宫地支索引 = 寅(2) + 月数 - 1 - 时辰索引 (mod 12)
        let mingGongIdx = ((2 + month - 1 - hourBranch) % 12 + 12) % 12;

        // 十四主星
        const mainStars = [
            '紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府',
            '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'
        ];

        // 安紫微星: 紫微在第 (日数对应) 宫
        // 简化: 紫微起始位置根据农历日
        const ziweiIdx = (day + mingGongIdx) % 12;

        // 紫微星系 (紫微、天机、太阳、武曲、天同、廉贞)
        const ziweiGroup = [0, -1, -3, -4, -5, -7]; // 相对紫微的宫位偏移
        // 天府星系 (天府、太阴、贪狼、巨门、天相、天梁、七杀、破军)
        const tianfuIdx = (12 - ziweiIdx + 2 * mingGongIdx) % 12;
        const tianfuGroup = [0, 1, 2, 3, 4, 5, 6, 10]; // 相对天府的偏移

        // Build palaces
        const palaces = [];
        for (let i = 0; i < 12; i++) {
            const palaceIdx = (mingGongIdx + i) % 12;
            palaces.push({
                name: palaceNames[i],
                branch: branches[palaceIdx],
                stars: [],
            });
        }

        // Place 紫微星系
        const ziweiStarNames = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞'];
        for (let j = 0; j < ziweiGroup.length; j++) {
            const pos = ((ziweiIdx - mingGongIdx + ziweiGroup[j]) % 12 + 12) % 12;
            if (pos >= 0 && pos < 12) {
                palaces[pos].stars.push(ziweiStarNames[j]);
            }
        }

        // Place 天府星系
        const tianfuStarNames = ['天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'];
        for (let j = 0; j < tianfuGroup.length; j++) {
            const pos = ((tianfuIdx - mingGongIdx + tianfuGroup[j]) % 12 + 12) % 12;
            if (pos >= 0 && pos < 12) {
                palaces[pos].stars.push(tianfuStarNames[j]);
            }
        }

        // 四化 (simplified)
        const yearStemIdx = (year - 4) % 10;
        const sihuaMap = {
            0: { '禄': '廉贞', '权': '破军', '科': '武曲', '忌': '太阳' },
            1: { '禄': '天机', '权': '天梁', '科': '紫微', '忌': '太阴' },
            2: { '禄': '天同', '权': '天机', '科': '文昌', '忌': '廉贞' },
            3: { '禄': '太阴', '权': '天同', '科': '天机', '忌': '巨门' },
            4: { '禄': '贪狼', '权': '太阴', '科': '右弼', '忌': '天机' },
            5: { '禄': '武曲', '权': '贪狼', '科': '天梁', '忌': '文曲' },
            6: { '禄': '太阳', '权': '武曲', '科': '太阴', '忌': '天同' },
            7: { '禄': '巨门', '权': '太阳', '科': '文曲', '忌': '文昌' },
            8: { '禄': '天梁', '权': '紫微', '科': '天府', '忌': '武曲' },
            9: { '禄': '破军', '权': '巨门', '科': '太阴', '忌': '贪狼' },
        };
        const sihua = sihuaMap[yearStemIdx] || sihuaMap[0];

        return { palaces, sihua, mingGongIdx, branches };
    }

    function renderZiWeiChart(chart) {
        const container = document.getElementById('ziwei-grid');
        
        // 紫微命盘用4x4网格，中间4格为空/信息区
        // 标准命盘布局 (地支位置):
        // 巳(5)  午(6)  未(7)  申(8)
        // 辰(4)  [     中     ]  酉(9)
        // 卯(3)  [     央     ]  戌(10)
        // 寅(2)  丑(1)  子(0)  亥(11)
        
        const gridPositions = {
            5:  'r1c1', 6:  'r1c2', 7:  'r1c3', 8:  'r1c4',
            4:  'r2c1',                           9:  'r2c4',
            3:  'r3c1',                           10: 'r3c4',
            2:  'r4c1', 1:  'r4c2', 0:  'r4c3', 11: 'r4c4',
        };

        // Find palace for each branch index
        const branchToPalace = {};
        for (const palace of chart.palaces) {
            const branchIdx = chart.branches.indexOf(palace.branch);
            branchToPalace[branchIdx] = palace;
        }

        let cellsHtml = '';
        
        // Build all 16 cells of the grid
        const gridLayout = [
            [5, 6, 7, 8],
            [4, -1, -2, 9],
            [3, -3, -4, 10],
            [2, 1, 0, 11],
        ];

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const idx = gridLayout[row][col];
                
                if (idx < 0) {
                    // Center cells
                    if (idx === -1) {
                        cellsHtml += `<div class="ziwei-cell center-cell" style="grid-row:2;grid-column:2/4;">
                            <div class="center-title">紫微斗数命盘</div>
                            <div class="center-sihua">
                                <span class="sihua-item lu">禄: ${chart.sihua['禄']}</span>
                                <span class="sihua-item quan">权: ${chart.sihua['权']}</span>
                                <span class="sihua-item ke">科: ${chart.sihua['科']}</span>
                                <span class="sihua-item ji">忌: ${chart.sihua['忌']}</span>
                            </div>
                        </div>`;
                    }
                    if (idx === -3) {
                        cellsHtml += `<div class="ziwei-cell center-cell" style="grid-row:3;grid-column:2/4;">
                            <div class="center-info">☯ 天机不可泄露</div>
                        </div>`;
                    }
                    continue;
                }
                
                const palace = branchToPalace[idx];
                if (!palace) continue;

                const isMing = palace.name === '命宫';
                const starHtml = palace.stars.map(s => {
                    let cls = 'star';
                    if (s === '紫微') cls += ' star-ziwei';
                    else if (s === '天府') cls += ' star-tianfu';
                    else if (['太阳', '太阴'].includes(s)) cls += ' star-luminary';

                    // Add sihua markers
                    let sihuaMark = '';
                    for (const [key, starName] of Object.entries(chart.sihua)) {
                        if (starName === s) {
                            const clsMap = { '禄': 'sihua-lu', '权': 'sihua-quan', '科': 'sihua-ke', '忌': 'sihua-ji' };
                            sihuaMark = `<sup class="${clsMap[key]}">${key}</sup>`;
                        }
                    }
                    return `<span class="${cls}">${s}${sihuaMark}</span>`;
                }).join('');

                cellsHtml += `
                    <div class="ziwei-cell ${isMing ? 'ming-gong' : ''}" style="grid-row:${row + 1};grid-column:${col + 1};">
                        <div class="palace-name">${palace.name}</div>
                        <div class="palace-branch">${palace.branch}</div>
                        <div class="palace-stars">${starHtml}</div>
                    </div>
                `;
            }
        }

        container.innerHTML = cellsHtml;
    }
});
