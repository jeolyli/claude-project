# 灵记 项目运营手册 - Design Spec

> Human-readable design narrative. Machine-readable contract: `spec_lock.md`

## I. Project Information

| Item | Value |
| ---- | ----- |
| **Project Name** | 灵记 项目运营手册 |
| **Canvas Format** | PPT 16:9 (1280×720) |
| **Page Count** | 12 |
| **Design Style** | B) General Consulting + 科技企业风格 |
| **Target Audience** | 项目负责人 / 团队成员 / 潜在协作者 |
| **Use Case** | 项目汇报、团队同步、对外介绍 |
| **Created Date** | 2026-06-17 |

---

## II. Canvas Specification

| Property | Value |
| -------- | ----- |
| **Format** | PPT 16:9 |
| **Dimensions** | 1280×720 |
| **viewBox** | `0 0 1280 720` |
| **Margins** | left/right 60px, top 50px, bottom 40px |
| **Content Area** | 1160×630 |

---

## III. Visual Theme

### Theme Style

- **Style**: General Consulting + 科技企业风格
- **Theme**: Light theme
- **Tone**: 专业、克制、清晰 — 数据与结论先行，避免装饰性元素

### Color Scheme

| Role | HEX | Purpose |
| ---- | --- | ------- |
| **Background** | `#FAFBFD` | 页面底色 |
| **Secondary bg** | `#F0F2F7` | 卡片背景、分区底色 |
| **Primary** | `#1565C0` | 标题装饰线、关键区块、图标 |
| **Accent** | `#FF85A2` | 数据高亮、关键信息、品牌标记 |
| **Body text** | `#1E293B` | 主文案 |
| **Secondary text** | `#64748B` | 注释、脚注 |
| **Border/divider** | `#E2E8F0` | 分割线、卡片边框 |
| **Success** | `#16A34A` | 正向指标 |
| **Warning** | `#DC2626` | 风险标记 |

### Gradient Scheme

```xml
<linearGradient id="titleAccent" x1="0%" y1="0%" x2="100%" y2="0%">
  <stop offset="0%" stop-color="#1565C0"/>
  <stop offset="100%" stop-color="#FF85A2"/>
</linearGradient>
```

---

## IV. Typography System

### Font Plan

**Typography direction**: 现代 CJK 无衬线为主，标题用衬线制造品质感反差

| Role | Chinese | English | Fallback tail |
| ---- | ------- | ------- | ------------- |
| **Title** | `"Microsoft YaHei"` | `Georgia` | `serif` |
| **Body** | `"Microsoft YaHei", "PingFang SC"` | `Arial` | `sans-serif` |
| **Emphasis** | — | `Georgia` | `serif` |
| **Code** | — | `Consolas, "Courier New"` | `monospace` |

**Per-role font stacks**:

- Title: `Georgia, "Microsoft YaHei", serif`
- Body: `"Microsoft YaHei", "PingFang SC", Arial, sans-serif`
- Emphasis: `Georgia, "Microsoft YaHei", serif`
- Code: `Consolas, "Courier New", monospace`

### Font Size Hierarchy

**Baseline**: Body = 20px

| Purpose | Ratio to body | Px @ body=20 | Weight |
| ------- | ------------- | ------------ | ------ |
| Cover title | 3x | 60px | Bold |
| Chapter title | 2x | 40px | Bold |
| Page title | 1.8x | 36px | Bold |
| Subtitle | 1.3x | 26px | SemiBold |
| **Body content** | **1x** | **20px** | Regular |
| Annotation / caption | 0.75x | 15px | Regular |
| Page number | 0.55x | 11px | Regular |

---

## V. Layout Principles

### Page Structure

- **Header area**: Top 80px — page title + optional blue left-accent bar (4px × 40px)
- **Content area**: 80px–670px — flexible layout per page_rhythm
- **Footer area**: Bottom 30px — page number + 灵记 brand mark

### Layout Pattern Library

| Pattern | Suitable Scenarios |
| ------- | ----------------- |
| **Single column centered** | Cover, TOC, 结语 |
| **Symmetric split (5:5)** | 用户画像对比、双方案对比 |
| **Asymmetric split (3:7)** | 关键数据 + 详细说明 |
| **Three-column cards** | 功能列表、推广阶段、风险矩阵 |
| **Top-bottom split** | 阶段流程、时间线 |
| **Z-pattern** | 用户旅程、运营流程 |

### Spacing Specification

| Element | Value |
| ------- | ----- |
| Safe margin | 60px |
| Content block gap | 32px |
| Card gap | 24px |
| Card padding | 28px |
| Card border radius | 12px |
| Icon-text gap | 12px |

---

## VI. Icon Usage Specification

### Source

- **Built-in icon library**: `phosphor-duotone` (dual-tone, medium weight, layered contemporary)
- **Usage method**: SVG placeholder `<use data-icon="phosphor-duotone/icon-name" .../>`

### Recommended Icon List

| Purpose | Icon Path |
| ------- | --------- |
| 定位/目标 | `phosphor-duotone/target` |
| 用户/人群 | `phosphor-duotone/users` |
| 功能/特性 | `phosphor-duotone/cube` |
| 运营/维护 | `phosphor-duotone/gear` |
| 推广/增长 | `phosphor-duotone/chart-line-up` |
| 内容/文档 | `phosphor-duotone/file-text` |
| 自媒体/社交 | `phosphor-duotone/share-network` |
| 私域/社群 | `phosphor-duotone/chat-circle` |
| 活动/日历 | `phosphor-duotone/calendar` |
| 风险/安全 | `phosphor-duotone/shield-warning` |
| 检查/确认 | `phosphor-duotone/check-circle` |
| 箭头/流程 | `phosphor-duotone/arrow-right` |

---

## VII. Visualization Reference List

Catalog read: 71 templates

| Page | Template | Path | Summary-quote (verbatim) | Usage |
| ---- | -------- | ---- | ------------------------ | ----- |
| P05 | icon_grid | `templates/charts/icon_grid.svg` | "Pick for 4-9 parallel features/capabilities/services as icon cards — feature grid, service lineup, benefits matrix" | 核心功能六大模块展示 |
| P07 | chevron_process | `templates/charts/chevron_process.svg` | "Pick for 3-6 phase methodology with chunky arrow-chain progression and deliverables per phase" | 推广三阶段展示 |
| P12 | consulting_table | `templates/charts/consulting_table.svg` | "Pick for high-density tables with embedded micro bar visuals (consulting/financial reports)" | 风险矩阵表格 |

**Runners-up considered**:

- `feature_matrix_table` | rejected for P05: icon_grid better suits 6 parallel features with icons rather than checkmark comparison
- `numbered_steps` | rejected for P07: chevron_process better conveys staged progression with phase deliverables
- `basic_table` | rejected for P12: consulting_table adds visual weight bars appropriate for risk severity

---

## VIII. Image Resource List

*(Omitted — Option A: no images)*

---

## IX. Content Outline

### P01 — Cover
- **Layout**: Single column centered, gradient accent bar at top
- **Title**: 灵记 (LingJi) 项目运营手册
- **Subtitle**: 个人财务管理工具 · 从零到一的运营实践
- **Info**: 2026年6月 | V1.0

### P02 — 目录
- **Layout**: Agenda list
- **Content**: 10章节编号列表 + 简要描述

### P03 — 项目定位
- **Layout**: Asymmetric split (3:7)
- **Title**: 灵记是什么
- **Content**: 产品形态(Web+APP+小程序)、核心竞争力(跨端一致+本地优先)、当前状态(V1.0 MVP)

### P04 — 用户群体定位
- **Layout**: Symmetric split (5:5) — 核心用户 vs 次要用户
- **Title**: 谁在用灵记
- **Content**: 22-35岁职场人画像、消费习惯特征、审美偏好、不服务的用户类型

### P05 — 核心功能
- **Layout**: Three-column cards (2 rows)
- **Title**: 六大核心功能
- **Visualization**: icon_grid
- **Content**: 快速记账、预算看板、账单筛选、统计图表、分类管理、数据同步

### P06 — 用户维护方案
- **Layout**: Z-pattern — 3个留存节点
- **Title**: 如何让用户留下来
- **Content**: 首次记账7天内、首月结算日、换设备时 — 3个关键节点 + 4个零成本维护动作

### P07 — 推广方案
- **Layout**: Top-bottom split — 三阶段时间线
- **Title**: 零预算推广三阶段
- **Visualization**: chevron_process
- **Content**: 第一阶段(熟人+技术社区)、第二阶段(内容+工具传播)、第三阶段(口碑+场景化)

### P08 — 内容运营方案
- **Layout**: Three-column cards
- **Title**: 内容矩阵与发布节奏
- **Content**: 小红书主号策略、GitHub内容方向、即刻/微博碎片化输出、周更节奏、内容禁区

### P09 — 自媒体运营管理
- **Layout**: Asymmetric split (3:7)
- **Title**: 一人运营策略
- **Content**: 主攻小红书(人设/日历/互动)、辅助GitHub、不推荐平台(公众号/抖音/微博)

### P10 — 私域运营方案
- **Layout**: Top-bottom split — 三级结构
- **Title**: 轻量私域: 三级结构
- **Content**: GitHub Issues(反馈入口) → 微信群(>50 Issues后) → 邮件列表(RSS替代)、不做什么

### P11 — 活动运营建议
- **Layout**: Single column, breathing
- **Title**: 四个零成本活动
- **Content**: 月度消费关键词、21天记账挑战、年度账单分享、不做什么(拉新奖励/邀请码/限时折扣)

### P12 — 风险与应急管理
- **Layout**: Top-bottom — 表格展示
- **Title**: 风险矩阵与应对
- **Visualization**: consulting_table
- **Content**: 技术风险(3项)、运营风险(3项)、合规风险(3项)

---

## X. Speaker Notes Requirements

- **File naming**: `notes/P01_cover.md` ~ `notes/P12_risk.md`
- **Style**: conversational, 中文, 每页2-3句要点
- **Duration**: ~15分钟

---

## XI. Technical Constraints Reminder

### SVG Generation Must Follow:
1. viewBox: `0 0 1280 720`
2. Background uses `<rect>` elements
3. Text wrapping uses `<tspan>` (`<foreignObject>` FORBIDDEN)
4. Transparency uses `fill-opacity` / `stroke-opacity`; `rgba()` FORBIDDEN
5. FORBIDDEN: `mask`, `<style>`, `class`, `foreignObject`, `textPath`, `animate*`, `script`
6. `<g opacity>` FORBIDDEN — set opacity on each child individually
7. XML reserved chars escaped: `&amp; &lt; &gt; &quot; &apos;`
