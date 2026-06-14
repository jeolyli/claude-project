# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

**灵记 (LingJi)** — 一款采用"软萌粉嫩"设计语言的个人财务管理 Web 应用。PRD 文档（位于 `001.产品PRD（产品经理）/PRD_个人财务管理工具.md`）是权威规范 —— 在开发任何功能之前务必先阅读。应用采用移动端优先设计（430px 最大宽度容器），MVP 阶段目标功能包括：快速记账、预算看板、分类饼图和账单历史记录。

## 开发命令

所有命令均在 `lingji-web/` 目录下执行：

```bash
cd lingji-web
npm run dev        # 启动 Vite 开发服务器（启用 HMR 热更新）
npm run build      # 类型检查（tsc -b）后执行生产构建
npm run lint       # 对所有文件运行 ESLint 检查
npm run preview    # 本地预览生产构建产物
```

## 技术栈

- **React 19** + TypeScript 6.0（严格模式，启用了 `noUnusedLocals`/`noUnusedParameters`）
- **Vite 8** + `@vitejs/plugin-react`（基于 Oxc，非 SWC）
- **Tailwind CSS 4**，通过 `@tailwindcss/vite` 插件集成 —— 自定义设计令牌已在 `src/index.css` 中定义
- **React Router 7**（`react-router-dom`）用于路由
- **Recharts 3** 用于图表（饼图、折线图、柱状图）
- **Lucide React** 用于图标 —— 请使用此图标库，不要使用 emoji 或自定义 SVG
- **date-fns** 用于日期格式化与处理
- **nanoid** 用于生成唯一 ID

## 架构与规范

### 设计系统（已在 `src/index.css` 中配置）

Tailwind 的 `@theme` 块中定义了所有设计令牌。请在 Tailwind 类名中直接使用这些语义化令牌，不要自行创建新颜色：

- **主色调**：`primary-50` 到 `primary-500`（樱花粉色系）
- **辅助色**：`accent-coral`（警告/删除）、`accent-peach`（收入）、`accent-lavender`（图表）、`accent-mint`（成功/预算健康）
- **中性色**：`neutral-50` 到 `neutral-900`（暖调灰色，非纯黑纯白）
- **分类颜色**：`cat-food`、`cat-transport`、`cat-shopping`、`cat-housing`、`cat-entertainment`、`cat-medical`、`cat-education`、`cat-other`
- **圆角**：`radius-sm`（8px）到 `radius-2xl`（24px）—— 按钮采用胶囊形（`rounded-2xl`），卡片采用 `rounded-xl`
- **动画**：已预定义 `animate-float-up`、`animate-heartbeat`、`animate-bounce-dot`、`animate-fade-in-up`、`animate-toast-in`

### 布局模式

移动端优先的单列布局。根组件应将内容包裹在 `<div className="app-container">` 中，形成 430px 居中手机框架。PRD 中定义了 4 个底部导航标签页：首页、账单、统计、我的。

### 数据模型（参见 PRD 第 4.3 节）

四个核心实体，初期使用内存或 localStorage 存储（SQLite 是后续原生应用阶段的考量）：
- **Transaction（流水记录）**：id、type（expense/income）、amount、category_id、date、note、时间戳
- **Category（分类）**：id、name、icon、color、type、parent_id（用于子分类）、sort_order
- **Budget（预算）**：id、year、month、total_budget、category_budgets[]
- **RecurringBill（周期账单）**：id、name、amount、category_id、cycle、next_date

### 状态管理

项目中尚未引入全局状态库。建议使用 React Context + useReducer 管理交易/预算数据，或将状态保留在路由组件内部并按需提升。PRD 明确 MVP 阶段仅使用本地数据（无后端）。

### 文件结构约定

```
src/
├── components/     # 可复用 UI 组件（按钮、卡片、输入框等）
├── pages/          # 页面级路由组件（首页、账单、统计、我的）
├── hooks/          # 自定义 Hook（useTransactions、useBudget 等）
├── data/           # 静态数据（预设分类、默认预算等）
├── types/          # TypeScript 类型定义
├── utils/          # 纯工具函数（格式化、计算等）
├── App.tsx         # 路由配置 + 布局外壳
├── main.tsx        # 入口文件
└── index.css       # 设计令牌 + 全局样式（已配置完成）
```

## MVP 范围（V1.0）

根据 PRD 定义，MVP 包含以下内容：
- 支出/收入记录（金额 + 分类 + 日期，不超过 3 步操作）
- 月度预算看板，含进度条（绿色→黄色→橙色→红色）
- 8 个预设分类及其子分类（餐饮、交通、购物、居住、娱乐、医疗、教育、其他）
- 分类饼图 + 近 7 天趋势折线图
- 账单列表，按时间分组展示，支持基础关键字搜索

MVP 阶段不包含：自定义分类管理、云同步、周期账单、CSV 导出、日历热力图、快捷模板。
