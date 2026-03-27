# 天机 (tianji)

[![PyPI version](https://img.shields.io/pypi/v/tianji.svg)](https://pypi.org/project/tianji/)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/Zijian-Ni/tianji/actions/workflows/ci.yml/badge.svg)](https://github.com/Zijian-Ni/tianji/actions)
[![Demo](https://img.shields.io/badge/Demo-GitHub%20Pages-brightgreen)](https://zijian-ni.github.io/tianji/)

**天机** 是一个纯 Python 实现的中国玄学算法库，支持八字排盘、六爻起卦、紫微斗数等功能。所有算法均从零实现，不依赖外部数据库。配套完整的现代化 Web 前端，完全离线运行，零数据收集。

> "天机不可泄露" — 但代码可以开源。

作者：Zijian Ni（倪子健）

---

## 🌐 Web Interface

**在线体验** → [https://zijian-ni.github.io/tianji/](https://zijian-ni.github.io/tianji/)

天机提供一个纯前端的 Web 界面，无需安装任何依赖，直接在浏览器中使用。所有计算均在浏览器端完成（纯 JavaScript），不向任何服务器发送数据。

### 八字排盘（v0.3.0 全面升级）

- 🔢 **四柱八字** — 年月日时四柱、天干地支、十神关系
- 📜 **纳音五行** — 每柱显示对应纳音（海中金、炉中火、大林木…）
- 🏠 **胎元命宫** — 自动推算胎元干支与命宫干支
- ⭐ **神煞系统** — 天乙贵人、文昌、驿马、桃花、华盖、将星、天德、月德、禄神、羊刃
- 📊 **格局分析** — 根据月令透干判断格局（正官格、七杀格、食神格等）
- 🎯 **用神忌神** — 基于日主强弱自动推荐用神/忌神五行
- 📈 **精确大运** — 节气精确计算起运年龄（3天≈1岁），显示公历年份与纳音
- 🌊 **五行力量** — 带百分比条形图，旺/中/弱/缺状态标注
- 📅 **农历显示** — 阳历/农历日期对照
- 🔄 **流年分析** — 十年流年干支、十神、纳音

### 六爻占卜

- 🎴 三种起卦方式（时间起卦、数字起卦、模拟摇铜钱）
- 卦象 SVG 可视化，动爻高亮

### 紫微斗数

- ⭐ 十二宫命盘排列，主星安置

> 💡 **本地运行**：直接用浏览器打开 `web/index.html` 即可，无需构建工具。

---

## 功能特性

| 模块 | 功能 | 状态 |
|------|------|------|
| **八字** | 四柱排盘、十神、五行分析、日主强弱 | ✅ |
| **八字** | 纳音五行（60甲子完整纳音表） | ✅ v0.3.0 |
| **八字** | 胎元、命宫推算 | ✅ v0.3.0 |
| **八字** | 神煞（10种常用神煞） | ✅ v0.3.0 |
| **八字** | 格局分析、用神忌神 | ✅ v0.3.0 |
| **八字** | 精确大运（节气计算）、流年 | ✅ v0.3.0 |
| **八字** | 刑冲合害 | ✅ |
| **六爻** | 64卦、时间/数字/铜钱起卦、装卦分析 | ✅ |
| **紫微** | 十二宫、紫微/天府星系安星 | ✅ |
| **前端** | 深色中国风 UI、响应式、中英双语 | ✅ |
| **隐私** | 零数据收集、无 CDN、完全离线 | ✅ |
| **API** | FastAPI REST 接口 | ✅ |
| **CLI** | 命令行工具 | ✅ |

---

## 安装

```bash
pip install tianji
```

带 LLM 支持：

```bash
pip install "tianji[llm]"
```

---

## 快速开始

### 八字排盘

```python
from datetime import datetime
from tianji.bazi import BaZiChart

chart = BaZiChart(birth_dt=datetime(1990, 5, 15, 14, 30), gender="male")
chart.display()

print(chart.year_pillar)   # 庚午
print(chart.month_pillar)  # 辛巳
print(chart.day_pillar)    # 庚辰
print(chart.hour_pillar)   # 癸未
print(chart.day_master)    # 庚 (Metal, Yang)
```

### 十神推算

```python
from tianji.bazi import ten_gods_from_chart

gods = ten_gods_from_chart(chart)
for pos, result in gods.items():
    print(f"{pos}: {result.stem.char} → {result.ten_god} ({result.english})")
```

### 六爻起卦

```python
from tianji.liuyao import cast_hexagram

# 时间起卦
result = cast_hexagram(method="time")
result.display()

# 铜钱摇卦
result = cast_hexagram(method="coin", seed=42)
result.display()

# 数字起卦
result = cast_hexagram(method="number", num1=3, num2=7)
result.display()
```

### 紫微斗数

```python
from tianji.ziwei import create_ziwei_chart

chart = create_ziwei_chart(year=1990, month=4, day=21, hour=14)
print(chart.display())
```

### 命令行

```bash
tianji bazi --date 1990-05-15 --time 14:30 --gender male
tianji liuyao --method time
tianji serve --port 8000
```

### REST API

```bash
uvicorn tianji.api.app:app --reload

# 八字排盘
curl -X POST http://localhost:8000/bazi/chart \
  -H "Content-Type: application/json" \
  -d '{"birth_datetime": "1990-05-15T14:30:00", "gender": "male"}'
```

---

## 算法说明

### 八字四柱算法

| 柱 | 算法 | 关键规则 |
|---|---|---|
| **年柱** | 以立春为年界 | 立春前属上一年 |
| **月柱** | 五虎遁月法 | 甲己→丙寅，乙庚→戊寅，丙辛→庚寅，丁壬→壬寅，戊癸→甲寅 |
| **日柱** | 基准日推算 | 1900-01-01 = 甲戌（序号10），天数差 mod 60 |
| **时柱** | 五鼠遁时法 | 甲己→甲子，乙庚→丙子，丙辛→戊子，丁壬→庚子，戊癸→壬子 |

### 纳音五行

每两个相邻的六十甲子共享一个纳音，共 30 组。例如：
- 甲子/乙丑 → 海中金
- 丙寅/丁卯 → 炉中火
- 甲戌/乙亥 → 山头火

### 十神对照

| 十神 | 关系 | 阴阳 |
|---|---|---|
| 比肩 | 同元素 | 同性 |
| 劫财 | 同元素 | 异性 |
| 食神 | 我生 | 同性 |
| 伤官 | 我生 | 异性 |
| 偏财 | 我克 | 同性 |
| 正财 | 我克 | 异性 |
| 七杀 | 克我 | 同性 |
| 正官 | 克我 | 异性 |
| 偏印 | 生我 | 同性 |
| 正印 | 生我 | 异性 |

### 神煞

| 神煞 | 查法 | 吉凶 |
|---|---|---|
| 天乙贵人 | 日干查年/日支 | 吉 |
| 文昌贵人 | 日干查支 | 吉 |
| 驿马 | 日/年支三合局冲 | 中性 |
| 桃花 | 日/年支三合局沐浴 | 中性 |
| 华盖 | 日/年支三合局墓库 | 中性 |
| 将星 | 日/年支三合局帝旺 | 吉 |
| 天德 | 月支查 | 吉 |
| 月德 | 月支查 | 吉 |
| 禄神 | 日干查支 | 吉 |
| 羊刃 | 日干查支 | 凶 |

### 六爻起卦

- **时间起卦**：年+月+日+时数字，推算上卦、下卦、动爻
- **数字起卦**：自定义三个数字起卦
- **铜钱摇卦**：三枚铜钱×六次，6=老阴，7=少阳，8=少阴，9=老阳

### 紫微斗数

- **五行局**：水二局、木三局、金四局、土五局、火六局
- **紫微星位**：以农历生日、五行局推算紫微星落宫
- **天府对宫**：天府星与紫微星寅-申对称分布

---

## 项目结构

```
tianji/
├── src/tianji/
│   ├── calendar/          # 干支历法引擎
│   ├── bazi/              # 八字算法
│   ├── liuyao/            # 六爻算法
│   ├── ziwei/             # 紫微斗数
│   ├── llm/               # LLM 解读层（可选）
│   └── api/               # FastAPI 接口
├── web/                   # 现代化 Web 前端
│   ├── index.html
│   ├── css/style.css      # 中国风深色主题
│   └── js/
│       ├── calendar.js    # 干支历法引擎 (JS)
│       ├── bazi.js        # 八字算法 (JS) — 含纳音/胎元/命宫/神煞/格局
│       ├── liuyao.js      # 六爻算法 (JS)
│       ├── ziwei.js       # 紫微斗数 (JS)
│       ├── i18n.js        # 中英文国际化
│       └── app.js         # UI 控制器
├── tests/                 # 测试套件（140+ 测试）
├── .github/workflows/     # CI/CD + GitHub Pages
└── pyproject.toml
```

---

## 隐私声明 / Privacy

**天机完全尊重用户隐私。**

- **零数据收集**：Web 前端完全在浏览器本地运行，不发送任何网络请求
- **无追踪**：不使用任何分析服务
- **无 CDN**：不从外部加载字体、图标或脚本
- **无 Cookie**：不设置任何 Cookie 或 localStorage
- **完全离线**：断网也能正常使用
- **CSP 保护**：Content Security Policy 阻止外部资源加载

---

## Web 前端

推送到 `main` 分支后自动部署至 GitHub Pages。

本地运行：
```bash
open web/index.html
# 或
cd web && python3 -m http.server 8080
```

---

## English

**tianji** is a pure-Python Chinese metaphysics library with a modern, privacy-first web frontend. All algorithms implemented from scratch, no external databases. Created by Zijian Ni.

### Features

- **BaZi (Four Pillars)**: Year/month/day/hour pillars, Ten Gods, Five Elements, Day Master strength, Nayin, Taiyuan/Minggong, Shensha (10 types), Pattern analysis, Favorable/unfavorable elements, Luck Pillars (precise), Flow Years, branch relationships
- **Liu Yao (Six Lines)**: 64 hexagrams, time/number/coin casting, moving lines analysis
- **Zi Wei Dou Shu (Purple Star)**: 12-palace chart, Zi Wei + Tian Fu star groups
- **Web UI**: Chinese-style dark theme, responsive, bilingual, fully offline
- **Privacy**: Zero data collection, no CDN, no tracking, no cookies

### Quick Example

```python
from datetime import datetime
from tianji.bazi import BaZiChart

chart = BaZiChart(birth_dt=datetime(1990, 5, 15, 14, 30), gender="male")
print(chart.year_pillar)   # 庚午
print(chart.month_pillar)  # 辛巳
print(chart.day_pillar)    # 庚辰
print(chart.hour_pillar)   # 癸未
```

---

## 贡献

欢迎提交 Issue 和 PR！详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

MIT License — Copyright (c) 2026 Zijian Ni（倪子健）
