# 天机 (tianji)

[![PyPI version](https://img.shields.io/pypi/v/tianji.svg)](https://pypi.org/project/tianji/)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/Zijian-Ni/tianji/actions/workflows/ci.yml/badge.svg)](https://github.com/Zijian-Ni/tianji/actions)
[![Demo](https://img.shields.io/badge/Demo-GitHub%20Pages-brightgreen)](https://zijian-ni.github.io/tianji/)

**天机** 是一个纯 Python 实现的中国玄学算法库，支持八字排盘、六爻起卦、紫微斗数等功能。所有算法均从零实现，不依赖外部数据库。v0.2.0 新增完整的现代化 Web 前端，完全离线运行，零数据收集。

> "天机不可泄露" — 但代码可以开源。

## 🌐 Web Interface

**在线体验** → [https://zijian-ni.github.io/tianji/](https://zijian-ni.github.io/tianji/)

天机提供一个纯前端的 Web 界面，无需安装任何依赖，直接在浏览器中使用：

- 🔢 **八字排盘** — 输入出生日期，自动计算四柱八字、五行分布、十神关系、日主强弱、大运流年
- 🎴 **六爻占卜** — 三种起卦方式（时间起卦、数字起卦、模拟摇铜钱），卦象可视化展示
- ⭐ **紫微斗数** — 十二宫命盘排列，四化标注

所有计算均在浏览器端完成（纯 JavaScript），不向任何服务器发送数据。

> 💡 **本地运行**：直接用浏览器打开 `web/index.html` 即可，无需构建工具。

<!-- Screenshots placeholder -->
<!-- ![Web Demo Screenshot](docs/web-screenshot.png) -->

作者：Zijian Ni（倪子健）

---

## 在线体验 / Live Demo

**https://zijian-ni.github.io/tianji/**

完全在浏览器本地运行，不发送任何网络请求，不收集任何数据。

```
┌──────────────────────────────────────────────────────┐
│  ☯ 天机 — 中国传统玄学计算                              │
│                                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │  年柱  │ │  月柱  │ │  日柱  │ │  时柱  │        │
│  │  庚    │ │  辛    │ │  庚    │ │  癸    │        │
│  │  午    │ │  巳    │ │  午    │ │  未    │        │
│  └────────┘ └────────┘ └────────┘ └────────┘        │
│                                                      │
│  五行: ████ 金  ██ 水  ███ 木  █████ 火  ██ 土      │
│                                                      │
│  大运: 壬午→癸未→甲申→乙酉→丙戌→丁亥→戊子→己丑        │
└──────────────────────────────────────────────────────┘
```

---

## 功能特性

- 🔢 **八字 (BaZi / 四柱命理)** — 年月日时四柱排盘，十神推算，五行分析，大运，流年，刑冲合害
- 🎴 **六爻 (Liu Yao / 六爻占卜)** — 64卦定义，多种起卦方法（时间/数字/铜钱），装卦分析
- ⭐ **紫微斗数 (Zi Wei Dou Shu / 紫微命盘)** — 十二宫定位，紫微/天府星系安星
- 🖥️ **现代 Web 前端** — 深色主题中国风 UI，响应式设计，中英文双语，五行雷达图，完全离线
- 🔒 **隐私优先** — 零数据收集，无 CDN，无追踪，无 Cookie，完全本地计算
- 🌐 **REST API** — FastAPI 服务，便于系统集成
- 💻 **命令行工具** — `tianji bazi`, `tianji liuyao`

---

## 中国玄学简介

### 八字 (BaZi / Four Pillars of Destiny)

八字，又称"四柱"，是中国传统命理学的核心体系。以出生年、月、日、时分别配以天干地支，共八个字，故称"八字"。

- **天干（十干）**：甲乙丙丁戊己庚辛壬癸，属五行（木火土金水），分阴阳
- **地支（十二支）**：子丑寅卯辰巳午未申酉戌亥，对应十二生肖
- **五行生克**：木→火→土→金→水→木（相生）；木克土、土克水、水克火、火克金、金克木（相克）
- **十神**：以日主（日柱天干）为基准，推算其他干支与日主的关系（比肩、劫财、食神、伤官、偏财、正财、七杀、正官、偏印、正印）

### 六爻 (Liu Yao / Six Lines Divination)

六爻源于《周易》，以六十四卦为基础，通过摇铜钱或数字等方式起卦，再根据世爻、应爻、六亲、六神等进行占断。

### 紫微斗数 (Zi Wei Dou Shu / Purple Star Astrology)

紫微斗数以农历出生年月日时为基础，将紫微星等十四主星分布于命宫、财帛宫等十二宫，综合判断人生格局。

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

# 排四柱
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

### 创建命盘（简便接口）

```python
from tianji.bazi.chart import create_chart

# 年月日时，默认gender="male"
chart = create_chart(year=1990, month=5, day=15, hour=14)
```

### 六爻起卦

```python
from tianji.liuyao import cast_hexagram, LiuYaoAnalysis

# 时间起卦
result = cast_hexagram(method="time")
result.display()

# 铜钱摇卦（可重现）
result = cast_hexagram(method="coin", seed=42)
result.display()

# 数字起卦
result = cast_hexagram(method="number", num1=3, num2=7)
result.display()
```

### 紫微斗数

```python
from tianji.ziwei import create_ziwei_chart

# 农历生日（年、月、日、时）
chart = create_ziwei_chart(year=1990, month=4, day=21, hour=14)
print(chart.display())
```

### 命令行

```bash
# 八字排盘
tianji bazi --date 1990-05-15 --time 14:30 --gender male

# 六爻（时间起卦）
tianji liuyao --method time

# 六爻（铜钱起卦）
tianji liuyao --method coin

# 启动 API 服务
tianji serve --port 8000
```

### REST API

```bash
uvicorn tianji.api.app:app --reload
```

```bash
# 八字排盘
curl -X POST http://localhost:8000/bazi/chart \
  -H "Content-Type: application/json" \
  -d '{"birth_datetime": "1990-05-15T14:30:00", "gender": "male"}'

# 六爻起卦
curl -X POST http://localhost:8000/liuyao/cast \
  -H "Content-Type: application/json" \
  -d '{"method": "time"}'
```

---

## API 文档

### `BaZiChart`

```python
class BaZiChart:
    birth_dt: datetime   # 出生时间
    gender: str          # "male" / "female"

    year_pillar: StemBranch   # 年柱
    month_pillar: StemBranch  # 月柱
    day_pillar: StemBranch    # 日柱
    hour_pillar: StemBranch   # 时柱

    @property
    def day_master(self) -> HeavenlyStem: ...  # 日主（日柱天干）

    @property
    def pillars(self) -> tuple: ...  # (年, 月, 日, 时)

    def display(self) -> None: ...        # 打印命盘
    def to_dict(self) -> dict: ...        # 序列化为字典
```

### `StemBranch`

```python
class StemBranch:
    stem: HeavenlyStem     # 天干
    branch: EarthlyBranch  # 地支
    index: int             # 六十甲子序号 (0–59)

    def __str__(self) -> str: ...  # e.g. "甲子"
```

### 六爻函数

```python
def cast_hexagram(
    method: str = "time",    # "time" | "number" | "coin"
    dt: datetime = None,     # 时间起卦用
    num1: int = None,        # 数字起卦用
    num2: int = None,
    num3: int = None,
    seed: int = None,        # 铜钱起卦随机种子
) -> CastResult: ...
```

### `CastResult`

```python
class CastResult:
    primary_hexagram: Hexagram        # 本卦
    changed_hexagram: Hexagram | None # 变卦
    raw_lines: list[int]              # 原始爻值 (6/7/8/9)
    moving_lines: list[int]           # 动爻位置 (1-based)
    method: str                       # 起卦方法
```

---

## 算法说明

### 八字四柱算法

| 柱 | 算法 | 关键规则 |
|---|---|---|
| **年柱** | 以立春为年界 | 立春前属上一年，非元旦/春节 |
| **月柱** | 五虎遁月法 | 甲/己→丙寅起，乙/庚→戊寅起，丙/辛→庚寅起，丁/壬→壬寅起，戊/癸→甲寅起 |
| **日柱** | 基准日 + 天数差 mod 60 | 1900-01-01 = 甲子（序号0） |
| **时柱** | 五鼠遁时法 | 甲/己→甲子起，乙/庚→丙子起，丙/辛→戊子起，丁/壬→庚子起，戊/癸→壬子起 |

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

### 六爻起卦

- **时间起卦**：年+月+日+时数字，推算上卦、下卦、动爻
- **数字起卦**：自定义三个数字起卦
- **铜钱摇卦**：三枚铜钱×六次，正面=3，反面=2；6=老阴，7=少阳，8=少阴，9=老阳

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
│   │   ├── heavenly_stems.py   # 天干（十干）
│   │   ├── earthly_branches.py # 地支（十二支）
│   │   ├── stem_branch.py      # 干支组合、六十甲子
│   │   ├── solar_terms.py      # 二十四节气
│   │   └── lunar.py            # 农历转换
│   ├── bazi/              # 八字算法
│   │   ├── chart.py            # 四柱排盘
│   │   ├── ten_gods.py         # 十神推算
│   │   ├── five_elements.py    # 五行分析
│   │   ├── day_master.py       # 日主强弱
│   │   ├── luck_pillars.py     # 大运推算 + 流年
│   │   └── relationships.py    # 刑冲合害
│   ├── liuyao/            # 六爻算法
│   │   ├── hexagram.py         # 六十四卦定义
│   │   ├── casting.py          # 起卦方法
│   │   └── analysis.py         # 装卦分析
│   ├── ziwei/             # 紫微斗数
│   │   ├── palaces.py          # 十二宫
│   │   ├── stars.py            # 主星安星
│   │   └── chart.py            # 命盘计算
│   ├── llm/               # LLM 解读层（可选）
│   └── api/               # FastAPI 接口
├── web/                   # 现代化 Web 前端 (v0.2.0)
│   ├── index.html              # 主页面
│   ├── css/style.css           # 中国风深色主题样式
│   └── js/
│       ├── calendar.js         # 干支历法引擎 (JS)
│       ├── bazi.js             # 八字算法 (JS)
│       ├── liuyao.js           # 六爻算法 (JS)
│       ├── ziwei.js            # 紫微斗数 (JS)
│       ├── i18n.js             # 中英文国际化
│       └── app.js              # UI 控制器
├── tests/                 # 测试套件（140 个测试）
├── examples/              # 示例脚本
├── .github/workflows/     # CI/CD
│   ├── ci.yml                  # 测试 + lint
│   ├── pages.yml               # GitHub Pages 部署
│   └── release.yml             # 版本发布
└── pyproject.toml
```

---

## 隐私声明 / Privacy

**天机完全尊重用户隐私。**

- **零数据收集**：Web 前端完全在浏览器本地运行，不发送任何网络请求
- **无追踪**：不使用 Google Analytics、百度统计或任何分析服务
- **无 CDN**：不从外部 CDN 加载字体、图标或脚本，使用系统字体栈
- **无 Cookie**：不设置任何 Cookie 或 localStorage 跨页追踪
- **完全离线**：所有计算在本地完成，断网也能正常使用
- **CSP 保护**：Content Security Policy 头部阻止任何外部资源加载

您的出生日期等信息仅用于浏览器本地的命盘计算，计算完成后即刻丢弃，不会被存储、传输或分享给任何第三方。

---

## Web 前端

v0.2.0 新增了完整的现代化 Web 前端，特点包括：

- **中国风深色主题**：朱砂红 + 金色 + 墨色，支持暗/亮主题切换
- **响应式设计**：完美支持手机、平板和桌面浏览器
- **中英文双语**：一键切换中/英文界面
- **实时计算**：输入即更新，无需点击按钮
- **五行雷达图**：Canvas 绘制的五行能量分布图
- **大运时间轴**：可视化横向滚动时间轴
- **六爻可视化**：阴阳爻 SVG 渲染，动爻高亮
- **紫微命盘**：传统十二宫格局显示
- **分享功能**：生成分享链接

### 本地运行

```bash
# 方式一：直接打开
open web/index.html

# 方式二：本地服务器
cd web && python3 -m http.server 8080
# 访问 http://localhost:8080
```

### GitHub Pages

推送到 `main` 分支后自动部署：https://zijian-ni.github.io/tianji/

---

## English

**tianji** is a pure-Python library for Chinese metaphysics calculations, implementing all algorithms from scratch. v0.2.0 adds a modern, privacy-first web frontend. Created by Zijian Ni.

### Features

- **BaZi (Eight Characters / Four Pillars)**: Year/month/day/hour pillars, Ten Gods, Five Elements analysis, Luck Pillars, Flow Years, branch relationships
- **Liu Yao (Six Lines Divination)**: 64 hexagrams, multiple casting methods (time/number/coin), full hexagram analysis
- **Zi Wei Dou Shu (Purple Star Astrology)**: 12-palace chart, major star placement (Zi Wei group + Tian Fu group)
- **Modern Web UI**: Chinese-style dark theme, responsive, bilingual (zh/en), Canvas radar chart, fully offline
- **Privacy-first**: Zero data collection, no CDN, no tracking, no cookies, local computation only
- **REST API**: FastAPI-powered endpoints
- **CLI**: Command-line interface

### Background

**BaZi** (四柱命理) reads fate through four pairs of Heavenly Stems and Earthly Branches derived from birth year, month, day, and hour. The year changes at **Lì Chūn** (立春, Start of Spring, ~Feb 4), not at the solar new year. Month pillars use the **Wǔ Hǔ Dùn Yuè** (五虎遁月) formula, and hour pillars use **Wǔ Shǔ Dùn Shí** (五鼠遁时).

**Liu Yao** (六爻) is a divination system from the *I Ching* (易经). Six lines are cast using coins or numerical methods to produce one of 64 hexagrams. Moving lines (动爻) create a "changed hexagram" (变卦) revealing dynamic outcomes.

**Zi Wei Dou Shu** (紫微斗数) places 14 major stars into 12 life palaces based on the lunar birth date. The Purple Star (紫微) position is computed from the lunar day and the person's elemental phase (五行局).

### Installation

```bash
pip install tianji
pip install "tianji[llm]"  # with OpenAI support
```

### Quick Example

```python
from datetime import datetime
from tianji.bazi import BaZiChart

chart = BaZiChart(birth_dt=datetime(1990, 5, 15, 14, 30), gender="male")
print(chart.year_pillar)   # 庚午
print(chart.month_pillar)  # 辛巳
print(chart.day_pillar)    # 庚辰
print(chart.hour_pillar)   # 癸未

# Ten Gods analysis
from tianji.bazi import ten_gods_from_chart
gods = ten_gods_from_chart(chart)
for pos, result in gods.items():
    print(f"{pos}: {result.stem.char} → {result.ten_god}")
```

---

### Privacy

tianji is fully privacy-respecting:
- **Zero data collection**: The web frontend runs entirely in your browser
- **No tracking**: No Google Analytics, no third-party analytics
- **No CDN**: No external fonts, icons, or scripts loaded
- **Fully offline**: Works without internet after initial page load
- **CSP protected**: Content Security Policy blocks external resources

---

## 贡献

欢迎提交 Issue 和 PR！详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

MIT License — Copyright (c) 2026 Zijian Ni（倪子健）
