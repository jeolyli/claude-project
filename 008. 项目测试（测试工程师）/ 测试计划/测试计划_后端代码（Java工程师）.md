# 测试计划 — 后端代码（Java工程师）

> 项目路径: `005.后端代码（Java工程师）/`  
> 版本: V1.0 | 日期: 2026-06-16

---

## 1. 项目概述

### 1.1 技术栈

| 技术 | 版本/详情 |
|------|----------|
| Spring Boot | 3.5.1 |
| Java | 17 |
| ORM | MyBatis-Plus 3.5.12 |
| 数据库 | MySQL 8.x (端口 8806) |
| 密码加密 | BCrypt (spring-security-crypto) |
| JWT | jjwt 0.12.6 (HMAC-SHA256) |
| 构建 | Maven |
| 服务端口 | 8086 |
| 测试依赖 | spring-boot-starter-test + H2 (已配置但未使用) |

### 1.2 包结构

```
com.lingji.finance
├── config/         # CORS, MyBatis-Plus 分页插件, 自动填充
├── controller/     # 6 个 Controller (14 个 REST 端点)
├── service/        # 5 个 Service + DataSyncService
├── mapper/         # 6 个 Mapper (含物理删除自定义方法)
├── entity/         # 6 个 Entity (继承 BaseEntity)
├── dto/            # 10 个 DTO
├── vo/             # 5 个 VO
├── converter/      # 3 个 Entity ↔ VO 转换器
├── exception/      # 业务异常 + 全局异常处理
├── common/         # BaseEntity, Result, PageResult
└── security/       # JwtUtils
```

### 1.3 启动方式

```bash
cd 005.后端代码（Java工程师）
# 确保 MySQL 运行在 localhost:8806，数据库 lingji 已初始化
mvn spring-boot:run                    # 开发启动
# 或 mvn clean package -DskipTests && java -jar target/lingji-finance-1.0.0-SNAPSHOT.jar
```

---

## 2. 核心业务模块

| 模块 | Controller | 核心逻辑 |
|------|-----------|---------|
| 认证 | AuthController, UserController | BCrypt密码验证、JWT签发/验证、双轨API(旧Node兼容+新V1) |
| 用户 | UserController | 注册(用户名唯一检查)、登录(状态检查) |
| 分类 | CategoryController | 树形分类查询(预设+自定义)、按type筛选 |
| 交易流水 | TransactionController | CRUD + 分页查询 + 分类统计(饼图数据) |
| 预算 | BudgetController | 月度预算设置(先删后插)、看板(进度/健康度) |
| 数据同步 | DataController | 前端 localStorage ↔ MySQL 互转 |

### 2.2 全部 API 端点 (14个)

```
POST /api/auth/register       # 注册 (Node兼容格式)
POST /api/auth/login          # 登录 (Node兼容格式)
POST /api/auth/verify         # Token验证
POST /api/v1/users/register   # 注册 (V1格式, @Valid)
POST /api/v1/users/login      # 登录 (V1格式, @Valid)
GET  /api/v1/categories       # 分类树
POST /api/v1/transactions     # 创建交易
PUT  /api/v1/transactions     # 更新交易
DELETE /api/v1/transactions/{id}  # 逻辑删除交易
GET  /api/v1/transactions/{id}    # 查询单条交易
GET  /api/v1/transactions     # 分页查询交易
GET  /api/v1/transactions/stats/category  # 分类统计
POST /api/v1/budgets          # 设置预算
GET  /api/v1/budgets/board    # 预算看板
GET  /api/data                # 导出数据(localStorage格式)
POST /api/data/sync           # 导入数据(前端推送)
```

---

## 3. 高风险功能识别

| 风险等级 | 功能 | 风险描述 |
|---------|------|---------|
| 🔴 致命 | **认证缺失** | 所有 API 未强制 JWT 验证；userId 通过 `@RequestParam` 传递，可被篡改冒充其他用户 |
| 🔴 高 | budget_category 物理删除 | 唯一约束含 `deleted` 字段；若某代码路径误用逻辑删除会触发 DuplicateKeyException + 事务回滚 |
| 🔴 高 | DataSyncService 数据同步 | 前后端数据格式映射 (`cat_X` ↔ `Long` ID)；`resolveCategoryId` 解析失败静默丢弃数据 |
| 🟡 中 | budget uk_user_year_month | 先查后插存在 TOCTOU 竞态；高并发下可能违反唯一约束 |
| 🟡 中 | transaction reference_id 去重 | 无数据库唯一约束，仅应用层 HashSet 去重 |
| 🟡 中 | 异常处理全返回 HTTP 200 | 所有异常(含4xx/5xx)包装为 HTTP 200 + JSON body，HTTP状态码不可信赖 |
| 🟡 中 | JWT 默认密钥 | `lingji_jwt_secret_change_me_in_production` 为弱密钥 |
| 🟢 低 | @TableLogic 性能 | 所有查询自动附加 `AND deleted=0`，大数据量下无 deleted 索引的表会变慢 |
| 🟢 低 | txKey() 方法闲置 | DataSyncService 中定义了但未使用，代码死区 |

---

## 4. 测试分层方案

### 4.1 第一层：单元测试（Service + Mapper）

| 优先级 | 被测类 | 测试重点 |
|-------|--------|---------|
| P0 | `BudgetServiceImpl` | `setBudget` 先删后插逻辑；物理删除正确调用；totalBudget 更新；`getBoard` 健康度阈值(60/85/100) |
| P0 | `DataSyncService` | `importFromFrontend` 分类增量合并；交易 referenceId 去重；`resolveCategoryId` 各种 key 格式(纯名称/`cat_X`/未知) |
| P1 | `TransactionServiceImpl` | `create` 分类/子分类验证(子分类parentId必须匹配)；`page` 动态查询各条件组合；`delete` 逻辑删除 |
| P1 | `UserServiceImpl` | `register` 用户名唯一冲突；`login` 不同状态(正常/禁用/不存在) |
| P1 | `CategoryServiceImpl` | `listTree` 树形构建(父子关系)；type 筛选 |
| P2 | `JwtUtils` | `generate`/`validate` 正常流；过期token；篡改token；userId提取 |
| P2 | 各 Mapper | `physicalDeleteByBudgetId` 是否正确物理删除(非逻辑) |

**工具**: JUnit 5 + Mockito + H2 内存数据库

### 4.2 第二层：集成测试（Controller + DB）

| 优先级 | API | 测试重点 |
|-------|-----|---------|
| P0 | `POST /api/data/sync` | 含category_budgets的预算数据同步→budget_category表正确写入 |
| P0 | `GET /api/data` | 导出数据格式与前端localStorage一致(`cat_X` ID格式) |
| P0 | `POST /api/auth/login` | 正常登录→返回token+user；错误密码→返回error |
| P1 | `POST /api/v1/budgets` | 设置预算→重复设置同一月份→旧分类预算被替换 |
| P1 | `POST /api/v1/transactions` | 创建→查询→更新→逻辑删除→查询不返回 |
| P1 | `GET /api/v1/transactions/stats/category` | 各分类金额汇总正确性 |
| P2 | 数据校验 | `@Valid` DTO 校验→字段错误消息正确汇总 |
| P2 | 异常处理 | NotFoundException→200+code 404；未知异常→200+"系统繁忙" |

**工具**: Spring Boot Test + @SpringBootTest + TestRestTemplate + H2/MySQL

### 4.3 第三层：安全测试

| 优先级 | 测试场景 | 验证点 |
|-------|---------|-------|
| P0 | **越权访问** | 用 userA 的 userId 参数访问 userB 的交易/预算数据 |
| P0 | **无认证调用** | 所有受保护端点不带任何认证信息直接调用 |
| P1 | JWT 篡改 | 修改 token 中的 userId 后访问 |
| P1 | SQL 注入 | 搜索参数/备注字段注入 |
| P2 | 超大请求体 | 超长备注/超多分类→拒绝服务 |
| P2 | CORS | 非法 Origin 是否被拒绝 |

**工具**: Burp Suite / OWASP ZAP + 手工测试

### 4.4 第四层：数据一致性测试

| 测试场景 | 验证点 |
|---------|-------|
| budget_category 写入 | `INSERT` 新记录后旧记录的 `deleted=1` 不影响新插入 |
| transaction 逻辑删除 | `deleted=1` 后 `selectList` 不返回；`count` 不包含 |
| 数据同步幂等性 | 相同 `reference_id` 重复导入不产生重复记录 |
| 预算月度唯一 | 同一月重复设置不会产生两条 budget 记录 |
| 事务回滚 | budget_category insert 失败→budget 主表 update 也回滚 |

---

## 5. 测试数据准备

- **init.sql 种子数据**: 60+ 条预设分类
- **标准用户**: user_id=1，含30天交易、已设预算
- **并发场景**: 10个线程同时对同一用户同一月设置预算

---

## 6. 关键测试用例（抽样）

| ID | 模块 | 用例 | 预期结果 |
|----|------|------|---------|
| J-001 | DataSync | sync 含 `{"cat_12": 100}` 的 category_budgets | budget_category 写入一条 (budget_id, category_id=12, amount=100) |
| J-002 | DataSync | 再次 sync 同一用户同一月不同金额 | 旧记录被物理删除，新记录写入成功 |
| J-003 | Budget | setBudget 同一月两次 | 第二次更新，无重复键异常 |
| J-004 | Transaction | create 子分类 parentId 不匹配 | 抛出异常 |
| J-005 | Auth | 不存在用户登录 | 返回 `{success:false, error:"..."}` |
| J-006 | Auth | 错误密码 | BCrypt 验证失败，返回error |
| J-007 | Security | 无token获取交易列表 | **当前通过 (BUG)**，应改为拒绝 |
| J-008 | Security | 使用 userA 的 userId 查 userB 交易 | **当前通过 (BUG)**，应改为拒绝 |
| J-009 | Export | `exportToFrontend` 分类 ID 格式 | 返回 `"cat_12"` 而非 `"12"` 或 `"餐饮"` |
| J-010 | Validation | 注册 username 为空字符串 | DTO 校验失败，返回字段错误 |
