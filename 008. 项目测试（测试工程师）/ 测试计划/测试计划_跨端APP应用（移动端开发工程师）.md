# 测试计划 — 跨端APP应用（移动端开发工程师）

> 项目路径: `007.跨端APP应用（移动端开发工程师）/uniapp-lingji/`  
> 版本: V1.0 | 日期: 2026-06-16

---

## 1. 项目概述

### 1.1 技术栈

| 技术 | 详情 |
|------|------|
| 框架 | uni-app 3 + Vue 3 (composition API + Options API 混用) |
| 状态管理 | Pinia (3 stores: app, user, data) |
| 样式 | SCSS (uni.scss 设计令牌) |
| 图标 | 纯 Unicode Emoji 映射 (40+ 图标) |
| 图表 | 内联 SVG (data URI in `<image>`) |
| 密码 | 纯 JS SHA-256 (非 Web Crypto API) |
| 网络 | `uni.request` (封装在 api.js) |
| 存储 | `uni.setStorageSync/getStorageSync` |
| 构建 | HBuilderX (无 npm/package.json) |

### 1.2 目标平台

| 平台 | 编译模式 | 状态 |
|------|---------|------|
| iOS App | `APP-PLUS` | 目标平台 |
| Android App | `APP-PLUS` | 当前主要测试平台 |
| 微信小程序 | `MP-WEIXIN` | appid `wx4f55c92e3df88b29` |
| H5 | 浏览器 | 备用 |

### 1.3 目录结构

```
uniapp-lingji/
├── pages/           # 11 个页面 (.vue)
│   ├── index/       # 闪屏
│   ├── auth/        # 登录、注册
│   ├── home/        # 首页仪表盘
│   ├── bills/       # 账单列表
│   ├── stats/       # 统计分析
│   └── profile/     # 个人中心、预算、分类、数据、隐私
├── components/      # 20 个组件 (.vue)
├── store/           # 3 个 Pinia Store
├── utils/           # api.js, storage.js, crypto.js, id.js
├── pages.json       # 路由配置 (11 页，无原生 tabBar)
├── manifest.json    # 平台配置
└── App.vue          # 全局样式 + onLaunch
```

### 1.4 启动方式

```
HBuilderX → 运行 → 运行到手机或模拟器 → Android App / iOS App
HBuilderX → 运行 → 运行到小程序模拟器 → 微信开发者工具
```

---

## 2. 核心业务模块

| 模块 | 页面 | 核心功能 |
|------|------|---------|
| 启动 + 认证 | index, login, register | 会话检查→跳转；登录/注册→后端API→localStorage |
| 首页仪表盘 | home | 预算卡片(进度+健康度)+快速记账+今日概览+最近3条 |
| 账单列表 | bills | 搜索+类型/时间/分类筛选+日期分组(今天/昨天/本周/本月/更早) |
| 统计分析 | stats | 周/月切换+SVG折线图+SVG环形图+收支汇总+吉祥物消息 |
| 个人中心 | profile | 头像上传(压缩→base64)+菜单导航+切换/退出 |
| 预算设置 | profile/budget | 总预算+分类预算+差额计算+后端同步 |
| 分类管理 | profile/categories | CRUD+类型Tab+EmojiPicker+ColorPicker+软删除 |
| 数据管理 | profile/data | JSON备份/恢复+清除流水(平台条件编译) |
| 隐私设置 | profile/privacy | 修改密码(SHA-256验证+更新) |

---

## 3. 高风险功能识别

| 风险等级 | 功能 | 风险描述 |
|---------|------|---------|
| 🔴 高 | **Android 输入焦点** | 多个页面输入框点击无反应(已通过 `adjust-position` + `@click`聚焦修复) |
| 🔴 高 | **Canvas 图表不显示** | `uni.createCanvasContext` 在 Android 上不可靠；已改用 SVG data URI |
| 🔴 高 | **API 基础 URL** | Android 模拟器→10.0.2.2 / 真机→HOST_IP / 微信小程序→需HTTPS；配置错误则全部网络请求失败 |
| 🟡 中 | 微信小程序 SVG 不兼容 | `<image src="data:image/svg+xml,...">` 在小程序中不支持，图表需走 Canvas |
| 🟡 中 | `<scroll-view>` 点击事件 | Android 上 scroll-view 吃掉子元素 @click → 已改用 CSS overflow 替代 |
| 🟡 中 | `<button disabled>` 阻止交互 | Android 上 disabled button 完全拒绝所有事件 → 已改用 `<view>` + class |
| 🟡 中 | 头像 base64 存储 | 压缩至200x200但可能超出 uni.storage 限额 |
| 🟡 中 | 数据恢复非跨平台 | `plus.io` (APP) / `wx.getFileSystemManager` (微信) / 剪贴板(H5)，三套完全不同的实现 |
| 🟢 低 | 页面切换 `reLaunch` 耗时 | 自定义 TabBar 使用 `uni.reLaunch` 而非 `switchTab`，每次全量重载 |
| 🟢 低 | StatsChart.vue 代码冗余 | Canvas 组件已编写但 stats 页面使用内联 SVG，存在死代码 |

---

## 4. 测试分层方案

### 4.1 第一层：单元测试（Pinia Stores + Utils）

| 优先级 | 模块 | 测试重点 |
|-------|------|---------|
| P0 | `store/data.js` | `addTransaction`→transactions排序；`updateBudget`→category_budgets键值；`softDeleteCategory`→is_active=false |
| P0 | `utils/storage.js` | `isSessionValid` TTL逻辑；`recordLoginFailure` 锁定/解锁；`getUserData` 缺省值 |
| P1 | `utils/crypto.js` | `sha256` 已知向量；`hashPassword(password,salt)` 确定性；`generateSalt` 32字符十六进制 |
| P1 | `store/user.js` | `login` 锁定状态下拒绝；`register` 成功后session写入 |
| P2 | `utils/id.js` | `generateId` 格式 `tx_xxx_xxx`；唯一性(1000次无碰撞) |
| P2 | `utils/api.js` | URL拼接正确性；平台检测(Android模拟器/真机/iOS模拟器) |

**工具**: Vitest (兼容 Vue 3 composition API)

### 4.2 第二层：组件测试

| 优先级 | 组件 | 测试重点 |
|-------|------|---------|
| P0 | `QuickRecord` | 类型切换→分类列表更新；`canSave` 计算(金额>0+分类已选)；金额=0时按钮置灰 |
| P0 | `TransactionList` | 传入空数组→显示EmptyState；传入多条→按时间正确分组 |
| P1 | `BudgetCard` | 进度条百分比；健康度阈值(60/85/100)对应的颜色+文字 |
| P1 | `StatsChart`(*暂未使用) | `drawLine`/`drawRing` 无数据时显示"暂无数据" |
| P1 | `CategoryForm` | 新增模式→空字段；编辑模式→回填数据；名称去重检查 |
| P2 | `FilterPills` | 点击切换激活状态；v-model双向绑定 |
| P2 | `SearchBar` | 输入→emit；清除按钮→清空 |
| P2 | `ModalDialog` | 显示/隐藏；取消/确认回调 |
| P2 | `EmojiPicker` / `ColorPicker` | 选中高亮；v-model更新 |
| P2 | `LingToast` | success/error 样式；自动消失 |

**工具**: @vue/test-utils + jsdom / uni-app 官方测试工具

### 4.3 第三层：页面集成测试（分平台）

#### Android (APP-PLUS) — 当前主要平台

| 优先级 | 流程 | 验证点 |
|-------|------|---------|
| P0 | 注册→登录→首页 | API 调用成功；session 写入；页面跳转 |
| P0 | 首页快速记账 | 金额输入键盘弹出→分类点击变色→保存→Toast"💸 支出已记录"→预算进度更新 |
| P0 | 统计图表 | 有交易数据时 SVG 折线图+环形图正确渲染 |
| P1 | 账单筛选 | 搜索→筛选→分组→结果正确 |
| P1 | 预算设置 | 总预算+分类预算→保存→pushToBackend成功 |
| P1 | 分类管理 | 添加→编辑→删除→名称去重 |
| P2 | 头像上传 | 相机/相册→压缩→localStorage存储→页面显示 |
| P2 | 密码修改 | 旧密码验证→新密码SHA-256→成功提示 |
| P2 | 数据备份/恢复 | JSON备份→从文件恢复→清除流水 |

#### iOS (APP-PLUS)

| 优先级 | 测试重点 |
|-------|---------|
| P0 | 基本功能冒烟(登录→首页记账→统计) |
| P1 | 键盘弹出自动上移 |
| P1 | Safe Area 适配(TabBar/Header) |
| P1 | 头像上传(相机权限弹窗) |

#### 微信小程序 (MP-WEIXIN)

| 优先级 | 测试重点 |
|-------|---------|
| P0 | 编译通过(pages.json 无语法错误) |
| P0 | 登录/注册→后端 HTTPS API(需配置域名) |
| P1 | 图表渲染(小程序不支持 SVG data URI，当前**预期失败**) |
| P1 | 数据管理(JSON备份用 `wx.shareFileMessage`) |
| P1 | 毛玻璃回退(backdrop-filter 禁用) |
| P2 | 存储配额(10MB限制) |

### 4.4 第四层：平台兼容性回归清单

| 测试项 | Android | iOS | 微信小程序 | H5 |
|-------|---------|-----|----------|-----|
| 登录/注册 API | ✅ | ✅ | ✅(需HTTPS) | ✅ |
| 首页记账 | ✅ | - | - | - |
| 账单筛选 | ✅ | - | - | - |
| 统计 SVG 图表 | ✅ | - | ❌(预期失败) | ✅ |
| Canvas 图表(备选) | ❌(不稳定) | - | 待测 | ✅ |
| 头像上传 | ✅ | - | - | - |
| 分类 CRUD | ✅ | - | - | - |
| 数据备份(plus.io) | ✅ | ✅ | N/A | N/A |
| 数据备份(wx API) | N/A | N/A | 待测 | N/A |
| 安全区域适配 | ✅ | 待测 | ✅ | N/A |

---

## 5. 平台特殊测试场景

### 5.1 Android 专有

- 模拟器 vs 真机 API 地址自动切换
- 不同 Android 版本(10/11/12/13/14)的输入框兼容性
- 软键盘弹出/收起时页面布局不被遮挡
- 系统返回键→页面栈行为

### 5.2 iOS 专有

- Safe Area (刘海屏/灵动岛)适配
- 相册/相机权限弹窗→拒绝后降级
- 模拟器 vs 真机 API 地址(localhost)

### 5.3 微信小程序专有

- 域名白名单(urlCheck)
- HTTPS 强制要求
- 存储配额 10MB 监控
- 小程序码/分享

---

## 6. 测试数据准备

- **空用户**: 新注册无任何数据
- **标准用户**: 含30天交易(支出+收入)，4个自定义分类，已设月度预算
- **图表测试用户**: 本月每天都有交易(覆盖所有分类)，用于验证折线图和环形图

---

## 7. 关键测试用例（抽样）

| ID | 模块 | 用例 | 预期结果 |
|----|------|------|---------|
| U-001 | 登录 | Android 模拟器登录→API 调用 10.0.2.2:8086 | 成功返回 token+user |
| U-002 | 登录 | Android 真机登录→API 调用 HOST_IP:8086 | 成功(同WiFi) |
| U-003 | 记账 | 输入金额100→点击"饭"分类→保存 | Toast "💸 支出已记录"，预算进度更新 |
| U-004 | 记账 | 不选分类直接点保存 | 按钮置灰，点击弹Toast "请选择一个分类" |
| U-005 | 统计 | 无数据→查看统计 | 折线图区域显示"暂无数据" |
| U-006 | 统计 | 有7天数据→查看统计(周视图) | SVG折线图显示7个数据点 |
| U-007 | 统计 | 有30天数据→切换月视图 | SVG折线图显示30个数据点(部分标签不重叠) |
| U-008 | 分类 | 添加已存在的分类名 | 提示"分类名称已存在" |
| U-009 | 分类 | 编辑分类→改名称→保存 | 分类列表更新 |
| U-010 | 数据 | 微信小程序备份 | 调用 wx.shareFileMessage 分享 .json 文件 |
