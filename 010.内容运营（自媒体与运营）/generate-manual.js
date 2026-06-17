const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, LevelFormat,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
} = require("docx");

const COLOR_PRIMARY = "FF85A2";
const COLOR_DARK = "3D2C33";
const COLOR_GREY = "757575";
const COLOR_LIGHT = "FFF5F7";
const COLOR_BORDER = "FFD4DE";

const border = { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorders = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };

const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

// ===== 排版函数 =====
function sectionTitle(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, font: "Microsoft YaHei", size: 36, bold: true, color: COLOR_PRIMARY })],
  });
}

function subTitle(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, font: "Microsoft YaHei", size: 28, bold: true, color: COLOR_DARK })],
  });
}

function bodyText(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, font: "Microsoft YaHei", size: 21, color: COLOR_DARK })],
  });
}

function noteText(text) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 240 },
    children: [new TextRun({ text, font: "Microsoft YaHei", size: 18, color: COLOR_GREY, italics: true })],
  });
}

// ===== 封面 =====
function buildCover() {
  const lines = [
    new Paragraph({ spacing: { before: 3000 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "灵记 (LingJi)", font: "Microsoft YaHei", size: 56, bold: true, color: COLOR_PRIMARY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [new TextRun({ text: "个人财务管理工具", font: "Microsoft YaHei", size: 36, color: COLOR_DARK })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: "项目运营手册", font: "Microsoft YaHei", size: 44, bold: true, color: COLOR_DARK })],
    }),
    new Paragraph({ spacing: { before: 3600 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: "版本: V1.0", font: "Microsoft YaHei", size: 22, color: COLOR_GREY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: "日期: 2026年6月", font: "Microsoft YaHei", size: 22, color: COLOR_GREY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: "性质: 个人项目 / 工具型产品", font: "Microsoft YaHei", size: 22, color: COLOR_GREY })],
    }),
  ];
  return lines;
}

// ===== 项目定位 =====
function buildSection1() {
  return [
    sectionTitle("一、项目定位"),
    bodyText("灵记是一套完整的个人财务管理工具，包含 Web 端、移动端 APP（iOS/Android）、微信小程序三种客户端，配合 Java 后端提供数据同步与持久化能力。项目采用 MIT 协议开源，定位为一款面向个人的轻量级记账与预算管理工具。"),
    bodyText("核心竞争力在于: 跨端一致的操作体验、软萌治愈的视觉风格、以及本地存储优先 + 云端同步辅助的数据策略。与传统记账 APP 最大的区别是，不需要注册也可以完整使用全部功能（Web 端），后端仅作为数据备份与多设备同步的辅助手段。"),
    subTitle("产品状态"),
    bodyText("当前处于 V1.0 MVP 阶段。核心记账、预算、统计、分类管理功能已完成。后端 API 已实现数据同步、用户认证和交易 CRUD。移动端 APP 已完成 Android 适配，iOS 和微信小程序待进一步测试。"),
    noteText("现实定位: 这是一个面向熟人推荐的小众工具，而非一个要烧钱推广的商业产品。运营策略的设计前提是: 零预算、可落地、可持续。"),
  ];
}

// ===== 用户群体 =====
function buildSection2() {
  return [
    sectionTitle("二、用户群体定位"),
    bodyText("根据产品功能和视觉风格，核心用户画像如下:"),
    buildUserProfileTable(),
    bodyText("次要用户群: 对现有记账 APP 的复杂功能感到疲惫、想要一个更轻量替代品的大学生和职场新人。"),
    bodyText("不建议投入精力服务的用户: 需要企业级财务管理、多币种支持、投资组合追踪的用户。这些需求超出了轻量级记账工具的定位。"),
  ];
}

function buildUserProfileTable() {
  const headerRow = (text) => new TableCell({
    borders, width: { size: 2340, type: WidthType.DXA }, margins: cellMargins,
    shading: { fill: COLOR_LIGHT, type: ShadingType.CLEAR },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, font: "Microsoft YaHei", size: 20, bold: true, color: COLOR_PRIMARY })] })],
  });
  const cell = (text) => new TableCell({
    borders, width: { size: 7020, type: WidthType.DXA }, margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: "Microsoft YaHei", size: 20, color: COLOR_DARK })] })],
  });

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2340, 7020],
    rows: [
      new TableRow({ children: [headerRow("维度"), headerRow("特征")] }),
      new TableRow({ children: [cell("年龄段"), cell("22-35 岁，刚步入职场的年轻人")] }),
      new TableRow({ children: [cell("消费习惯"), cell("有稳定收入，但缺乏系统的消费管理意识，每月有'不知道钱花去哪了'的困惑")] }),
      new TableRow({ children: [cell("审美偏好"), cell("喜欢可爱治愈风格，对'搞钱'类硬核工具有排斥感")] }),
      new TableRow({ children: [cell("使用频率"), cell("每日 1-3 次随手记账，每月 1 次查看统计和调整预算")] }),
    ],
  });
}

// ===== 核心功能 =====
function buildSection3() {
  return [
    sectionTitle("三、核心功能"),
    bodyText("按对用户的实际价值排列:"),
    buildFuncTable(),
  ];
}

function buildFuncTable() {
  const hdr = (t) => new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, margins: cellMargins, shading: { fill: COLOR_LIGHT, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, font: "Microsoft YaHei", size: 20, bold: true, color: COLOR_PRIMARY })] })] });
  const cel = (t) => new TableCell({ borders, width: { size: 7560, type: WidthType.DXA }, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: t, font: "Microsoft YaHei", size: 20, color: COLOR_DARK })] })] });
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: [1800, 7560],
    rows: [
      new TableRow({ children: [hdr("模块"), hdr("价值点")] }),
      new TableRow({ children: [cel("快速记账"), cel("3 秒完成一笔记账。选中类型 → 点分类图标 → 输金额 → 保存。没有冗余的表单字段，减少记账阻力。")] }),
      new TableRow({ children: [cel("预算看板"), cel("每月花多少钱心里有数。进度条颜色从绿到红直观反馈预算健康度，不是冷冰冰的数字。")] }),
      new TableRow({ children: [cel("账单筛选"), cel("想看'这个月打车花了多少'时，能用搜索 + 多维度筛选快速定位。按时间分组让账单不再是一堆数字列表。")] }),
      new TableRow({ children: [cel("统计图表"), cel("一看就懂的折线图和环形图。不是数据分析工具，但够告诉你'这周花的比上周少了'。")] }),
      new TableRow({ children: [cel("分类管理"), cel("支持自定义分类和 emoji 图标。用户可以按自己的消费习惯调整，而不是被迫使用'通用'分类。")] }),
      new TableRow({ children: [cel("数据同步"), cel("换手机不用重新记。注册账号后数据自动同步到后端，Web 端和 APP 端数据互通。")] }),
    ],
  });
}

// ===== 用户维护方案 =====
function buildSection4() {
  return [
    sectionTitle("四、用户维护方案"),
    bodyText("用户维护的目标不是'日活'而是'月留存'。记账工具天生是低频工具，强求每天打开反而引起反感。核心策略: 在用户需要时出现，不需要时安静待着。"),
    subTitle("4.1 关键留存节点"),
    bodyText("根据记账类产品的用户行为特征，留存的关键节点有三个:"),
    ...[
      "首次记账后的 7 天内: 用户是否形成记账习惯。此阶段需要降低操作门槛，而不是用功能轰炸。",
      "第一个月的结算日: 用户首次看到'本月支出汇总'和预算进度。这是价值感知最强的时刻。目前产品在统计页面提供了这个能力。",
      "换手机/重装系统时: 数据同步是否顺利决定了用户是否会重新使用。这是当前项目数据同步功能的核心价值。",
    ].map(noteText),
    subTitle("4.2 维护动作（零成本可执行）"),
    ...[
      "每月 1 号通过 APP 推送或公众号推送'上月消费小结'，一次就够了，不要频繁推送。",
      "在统计页面加一个'分享本月账单'的按钮，生成一张好看的消费小结图片，用户会自发传播。",
      "保持 GitHub Issues 活跃，对用户反馈的问题 24 小时内给出回复（不一定修复，但要有回应）。",
      "不做积分、不做签到、不做打卡。记账工具不需要这些。",
    ].map(noteText),
  ];
}

// ===== 推广方案 =====
function buildSection5() {
  return [
    sectionTitle("五、推广方案"),
    bodyText("零预算前提下的推广策略，按时间线推进:"),
    subTitle("第一阶段 (0-3 个月): 熟人圈子 + 技术社区"),
    ...[
      "GitHub 开源推广: 把项目 README 写得像产品介绍而不是技术文档。放 GIF 动图展示核心操作流程，写清楚'5 分钟自部署'的步骤。技术社区的流量免费且精准。",
      "V2EX / 小众软件 发帖: 标题避开'自荐'体，改成'做了个记账工具，请大家看看哪里不好用'。真诚求反馈的态度带来的转化远高于硬推广。",
      "朋友圈定向分享: 只发给 10 个可能真的会用的朋友。请他们用一周后告诉你哪里不爽。修改后再发给下一批。不要群发。",
    ].map(noteText),
    subTitle("第二阶段 (3-6 个月): 内容 + 工具属性传播"),
    ...[
      "在小红书发布'记账工具对比'笔记: 不吹自己，客观对比 3-5 款工具（包括自己的和竞品），列出各自主打谁，让读者自己选。这种内容天然有收藏和转发价值。",
      "在 B 站发一期'从零开发记账 APP'的视频，讲开发过程和踩坑经验。技术类 UP 主的视频长尾效应极强，一期视频可以在未来半年持续带来用户。",
      "知乎回答'有什么好用的记账软件'类问题: 以真实用户的身份写回答，不要以开发者的身份。核心信息是'推荐理由'而不是'功能列表'。",
    ].map(noteText),
    subTitle("第三阶段 (6-12 个月): 口碑 + 场景化传播"),
    ...[
      "如果前面做对了，此时会有用户自发推荐。不要急着'增长'，先保证新用户进来后的首次体验是好的。",
      "考虑做'年度账单'功能（每年 12 月底上线），这是记账类工具传播性最强的功能，没有之一。",
      "不做付费推广。工具型产品的 CAC（获客成本）如果大于 0，就需要靠付费模式回收，而目前产品没有付费能力。",
    ].map(noteText),
  ];
}

// ===== 内容运营方案 =====
function buildSection6() {
  return [
    sectionTitle("六、内容运营方案"),
    bodyText("内容运营的核心目标: 让目标用户知道这个工具的存在，并觉得'这个人懂我'。"),
    subTitle("6.1 内容矩阵"),
    ...[
      "小红书主号: '记账这件小事'。内容方向: 记账方法分享（50%）、消费复盘案例（30%）、工具推荐（20%）。风格: 手写体 + 实拍图，不要精修模板图。用'消费羞耻'而非'财务自由'作为切入点——年轻人对前者更有共鸣。",
      "GitHub 项目主页: 内容方向: 开发日志 + Roadmap + 部署教程。不要写成学术论文。每篇带一张截图或 GIF。",
      "即刻/微博碎片化输出: 分享开发过程中的真实片段——'今天修了个 Bug 修到凌晨两点，发现是自己拼错了变量名'——这种内容比功能宣传更有吸引力。",
    ].map(noteText),
    subTitle("6.2 内容发布节奏"),
    ...[
      "小红书: 每周 1 篇，周末发布（目标用户周末才有空刷手机）。前 5 篇在项目上线前写好，确保上线后有持续内容。",
      "GitHub: 每两周 1 次提交 + Release Note。有东西才更新，不要为了更新而更新。",
    ].map(noteText),
    subTitle("6.3 内容禁区"),
    ...[
      "不说'颠覆'、'革命'、'重新定义'。——这是一个记账工具，不是 iPhone。",
      "不发纯功能列表型内容。——'支持 50 种分类'没有人会分享，'我靠记账省了 3000 块'才会。",
      "不在内容中过度美化。——记账不是万能的，它解决的是'钱去哪了'的问题，不是'怎么赚钱'的问题。",
    ].map(noteText),
  ];
}

// ===== 自媒体运营管理方案 =====
function buildSection7() {
  return [
    sectionTitle("七、自媒体运营管理方案"),
    bodyText("一句大实话: 单人项目不需要'媒体矩阵'，先做好一个平台比什么都重要。以下方案假设运营者为 1 人，时间预算为每周 4 小时。"),
    subTitle("7.1 主攻平台: 小红书"),
    bodyText("选择理由: 用户画像与产品目标用户高度重合（22-35 岁女性为主，关注生活方式、消费、记账），且小红书的长尾流量远好于其他平台。一篇笔记发布 3 个月后仍能带来新用户。"),
    ...[
      "账号人设: '一个认真记账的普通女孩'。不要专业财经形象，不要专家人设。头像用 🐰 灵记吉祥物而非真人照片（降低社交压力）。",
      "内容日历: 周一收藏一篇竞品笔记分析其爆款原因，周三写出初稿，周四配图，周六上午发布。",
      "互动策略: 每一条评论都回复（前期量不大，可以做到）。回复时不要只说'谢谢'，要引导对话——'你用的什么工具记账呀？'",
    ].map(noteText),
    subTitle("7.2 辅助平台: GitHub"),
    bodyText("面向开发者和潜在贡献者。README 是第一页的 Landing Page。"),
    ...[
      "README 第一屏要有: Logo + 一句话简介 + 截图/GIF + 快速开始的命令。不要把技术栈列表放在最前面——这会劝退非技术用户。",
      "Release Notes 写得像产品更新日志而非代码提交记录。'修复了 Date.now() 时区问题'应该写成'预算页面日期显示更准确了'。",
    ].map(noteText),
    subTitle("7.3 不推荐的平台"),
    bodyText("公众号: 需要高频更新和优质内容，单人运营成本太高。抖音: 记账类内容的视频化难度大，ROI 低。微博: 流量集中在娱乐和热点，工具类内容难以突围。"),
  ];
}

// ===== 私域运营方案 =====
function buildSection8() {
  return [
    sectionTitle("八、私域运营方案"),
    bodyText("对于微小体量的工具型产品，私域的本质不是'微信群'，而是'让用户觉得有地方可以找到你'。"),
    subTitle("8.1 最低成本私域结构"),
    ...[
      "GitHub Issues 作为用户反馈渠道: 这是最自然的入口。用户在 Issues 里提问时，既能得到回复，又能发现其他用户的讨论，形成小型社区。",
      "微信群（当 GitHub Issues 超过 50 条后考虑）: 只建一个群，不做分层。群规简单——'聊记账和消费相关的话题'。群主（你）每周主动分享一次自己的消费复盘，而不是只潜水。",
      "邮件列表（可选）: 用 GitHub Releases 的订阅功能替代。用户订阅 Release 后就相当于加入了'产品更新通知'邮件列表，零维护成本。",
    ].map(noteText),
    subTitle("8.2 不做什么"),
    ...[
      "不做企业微信。不需要自动化欢迎语、不需要标签分类、不需要 SCRM。当前阶段私域管理的复杂度与用户规模严重不匹配。",
      "不做付费社群。工具本身还免费时，付费社群没有价值支撑。",
      "不做 1v1 私聊。用户加你好友不是想和你聊天，是想反馈 Bug。让他们走 GitHub Issues。",
    ].map(noteText),
  ];
}

// ===== 活动运营建议 =====
function buildSection9() {
  return [
    sectionTitle("九、活动运营建议"),
    bodyText("工具型产品的活动不应该是'满 100 减 20'式的促销，而应该是'帮用户用好工具'式的引导。以下活动全部零成本、可执行、不需要开发新功能:"),
    subTitle("9.1 每月活动: #本月消费关键词#"),
    bodyText("每月 1 号，在小红书和用户群里发起一个话题——'看完上个月的账单，你觉得你的消费关键词是什么？'。用户截图自己的统计页面 + 一个词（比如'外卖'、'冲动'、'咖啡'），发出来分享。本质上是一次免费的 UGC 推广，同时帮用户养成了'月底看账单'的习惯。"),
    subTitle("9.2 季度活动: 21 天记账挑战"),
    bodyText("一个小实验: 连续记账 21 天，看看会发生什么。不需要打卡系统——用户自己在 APP 里记就行了。第 22 天你发一篇总结文章，放上参与者的消费变化数据（脱敏后）。这个活动的核心是'制造一个共同的体验'而不是'发奖品'。"),
    subTitle("9.3 年度活动: 年度账单分享"),
    bodyText("12 月底做年度账单功能。这是记账工具全年最重要的传播节点。技术要求不高——就是 12 个月的汇总数据 + 几行文案 + 一张好看的图。用户在朋友圈分享时不会觉得是在'帮工具做广告'，而是'分享自己的年度总结'。如果只做一件事增加传播，就做这个。"),
    subTitle("9.4 不做什么"),
    bodyText("不做拉新奖励、不做邀请码、不做限时折扣。这些策略对社交/电商类产品有效，对工具类产品无效。用户不会因为'邀请好友送会员'而推荐记账工具——他们会因为'这个东西真的帮我省了钱'而推荐。"),
  ];
}

// ===== 风险与应急管理 =====
function buildSection10() {
  return [
    sectionTitle("十、风险与应急管理"),
    subTitle("10.1 技术风险"),
    buildRiskTable([
      ["后端服务宕机", "中", "后端宕机不影响 Web 端使用（localStorage 优先），仅影响 APP 端的数据同步和多设备互通。应急: 前端增加后端不可用的提示，引导用户先使用 Web 端。"],
      ["数据库数据丢失", "高", "用户交易数据不可恢复。预防: 每天凌晨自动备份 MySQL，保留最近 30 天备份。应急: 通知用户从本地 localStorage 或 APP 重新同步数据。"],
      ["微信小程序审核不通过", "低", "个人主体小程序对工具类审核相对宽松。应对: 确保不涉及 UGC 内容、不涉及支付、隐私政策完整。"],
      ["iOS 上架被拒", "中", "个人开发者账号上架工具类 APP 门槛不高。注意点: 隐私政策、权限说明、不涉及内购。应急: 先上 TestFlight，收集反馈后再提审。"],
    ]),
    subTitle("10.2 运营风险"),
    buildRiskTable([
      ["负面评价扩散", "低", "小体量产品几乎不会遇到组织性的负面攻击。若单个用户投诉，公开回复 + 私聊解决即可。不要删帖。"],
      ["竞品模仿", "中", "工具类产品没有壁垒。应对策略不是防模仿，而是跑得更快: 保持每月至少一个功能更新，让模仿者总是慢一个版本。"],
      ["用户增长停滞", "低", "小工具增长停滞是正常的。不要焦虑，继续做产品优化和内容积累。工具类产品的增长曲线从来不是指数型，是阶梯型——每次功能更新带来一波新用户，然后平台期，再等下一次更新。"],
    ]),
    subTitle("10.3 合规风险"),
    bodyText("当前项目为个人开源工具，不涉及用户支付、不收集敏感个人信息（仅用户名和加密后的密码哈希），合规风险较低。需要注意:"),
    ...[
      "隐私政策: APP 上架时必须提供。模板化隐私政策即可，明确说明收集了哪些数据、用途是什么。",
      "开源协议: 当前项目未声明 License。建议使用 MIT License，在 GitHub 仓库根目录添加 LICENSE 文件。",
      "数据安全: 用户密码使用 BCrypt/SHA-256 加密存储。后端 API 目前未强制 JWT 验证（已知问题），在对外开放部署前必须修复。",
    ].map(noteText),
  ];
}

function buildRiskTable(rows) {
  const hdr = (t) => new TableCell({ borders, margins: cellMargins, shading: { fill: COLOR_LIGHT, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, font: "Microsoft YaHei", size: 20, bold: true, color: COLOR_PRIMARY })] })] });
  const cel = (t, w) => new TableCell({ borders, width: { size: w, type: WidthType.DXA }, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: t, font: "Microsoft YaHei", size: 18, color: COLOR_DARK })] })] });
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1600, 800, 6960],
    rows: [
      new TableRow({ children: [hdr("风险"), hdr("等级"), hdr("应对措施")] }),
      ...rows.map(r => new TableRow({ children: [cel(r[0], 1600), cel(r[1], 800), cel(r[2], 6960)] })),
    ],
  });
}

// ===== 组装文档 =====
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Microsoft YaHei", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Microsoft YaHei", color: COLOR_PRIMARY },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Microsoft YaHei", color: COLOR_DARK },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
    ],
  },
  sections: [
    { properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, size: { width: 11906, height: 16838 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "灵记 (LingJi) — 项目运营手册", font: "Microsoft YaHei", size: 16, color: COLOR_GREY })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "第 ", font: "Microsoft YaHei", size: 16, color: COLOR_GREY }), new TextRun({ children: [PageNumber.CURRENT], font: "Microsoft YaHei", size: 16, color: COLOR_GREY }), new TextRun({ text: " 页", font: "Microsoft YaHei", size: 16, color: COLOR_GREY })] })] }) },
      children: [
        ...buildCover(),
        new Paragraph({ children: [new PageBreak()] }),
        ...buildSection1(), ...buildSection2(), ...buildSection3(),
        ...buildSection4(), ...buildSection5(), ...buildSection6(),
        ...buildSection7(), ...buildSection8(), ...buildSection9(),
        ...buildSection10(),
      ] },
  ],
});

Packer.toBuffer(doc).then(buf => {
  const out = "/Users/jialili/Documents/代码项目/claude_workspace/claude-myproduct/010.内容运营（自媒体与运营）/灵记_项目运营手册.docx";
  fs.writeFileSync(out, buf);
  console.log("✅ 已生成:", out);
});
