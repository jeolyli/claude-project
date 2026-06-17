# 灵记（LingJi）Java 后端开发规范

> **版本**：V1.0 | **制定**：2026-06-14 | **适用**：Spring Boot 3.x + MyBatis-Plus + Java 17

---

## 目录

- [一、命名规范](#一命名规范)
- [二、项目分层架构](#二项目分层架构)
- [三、API 设计规范](#三api-设计规范)
- [四、异常处理规范](#四异常处理规范)
- [五、日志规范](#五日志规范)
- [六、数据库规范](#六数据库规范)
- [七、MyBatis-Plus 使用规范](#七mybatis-plus-使用规范)
- [八、Lombok 使用规范](#八lombok-使用规范)
- [九、空值处理与防御式编程](#九空值处理与防御式编程)
- [十、注释规范](#十注释规范)
- [十一、测试规范](#十一测试规范)
- [十二、Git 提交规范](#十二git-提交规范)
- [十三、安全规范](#十三安全规范)
- [十四、禁止清单（Anti-Patterns）](#十四禁止清单anti-patterns)

---

## 一、命名规范

### 1.1 包命名

```
com.lingji.finance
├── controller      # 控制器
├── service         # 业务接口
│   └── impl        # 业务实现
├── mapper          # 数据访问层（MyBatis-Plus BaseMapper）
├── entity          # 数据库实体
├── dto             # 数据传输对象（请求/响应）
├── vo              # 视图对象（前端展示专用）
├── config          # 配置类
├── common          # 公共类（Result、BaseEntity、枚举等）
├── constant        # 常量
├── enums           # 枚举
├── exception       # 自定义异常
├── interceptor     # 拦截器
├── filter          # 过滤器
├── aspect          # AOP 切面
└── utils           # 工具类
```

**规则**：
- 包名单数，全小写
- 禁止跨包调用：`controller` → `service` → `mapper`，单向依赖
- 禁止 `controller` 直接调用 `mapper`

### 1.2 类命名

| 类型 | 格式 | 示例 |
|------|------|------|
| Controller | `{业务}Controller` | `TransactionController` |
| Service 接口 | `{业务}Service` | `TransactionService` |
| Service 实现 | `{业务}ServiceImpl` | `TransactionServiceImpl` |
| Mapper | `{Entity}Mapper` | `TransactionMapper` |
| Entity | 名词，与表名对应 | `Transaction` |
| DTO | `{Entity}{动作}DTO` | `TransactionCreateDTO`、`TransactionUpdateDTO` |
| VO | `{Entity}VO` 或 `{Scene}VO` | `TransactionVO`、`BudgetBoardVO` |
| Enum | 描述性名词 | `TransactionType`、`BudgetPeriod` |
| Config | `{模块}Config` | `MybatisPlusConfig` |
| Utils | `{功能}Utils` | `DateUtils`、`AmountUtils` |
| Exception | `{描述}Exception` | `BusinessException`、`NotFoundException` |

### 1.3 方法命名

| 操作 | 前缀 | 示例 |
|------|------|------|
| 查询单个 | `get` / `find` | `getTransactionById()`、`findByCategory()` |
| 查询列表 | `list` / `query` | `listTransactions()`、`queryByDateRange()` |
| 查询分页 | `page` | `pageTransactions()` |
| 新增 | `create` / `add` | `createTransaction()` |
| 修改 | `update` / `modify` | `updateTransaction()` |
| 删除 | `delete` / `remove` | `deleteTransaction()` |
| 校验 | `check` / `validate` | `checkBudget()` |
| 统计 | `count` / `stat` | `countByCategory()`、`statMonthlyTrend()` |

**规则**：
- `get` vs `find`：`get` 暗示必然返回结果（不存在抛异常），`find` 可能返回 `null`/`Optional`
- 禁止 `getXXXInfo()`、`doXXX()` 这种无意义前缀/后缀，除非真的需要区分

### 1.4 变量命名

```java
// ✅ 正确：见名知意
private String categoryName;
private List<TransactionVO> transactionList;
private Map<String, BigDecimal> categoryAmountMap;

// ❌ 错误
private String catNam;        // 过度缩写
private String s;             // 无意义
private List<TransactionVO> list1;  // 数字后缀
```

### 1.5 数据库命名

| 对象 | 格式 | 示例 |
|------|------|------|
| 表名 | 小写蛇形，单数 | `transaction`、`budget` |
| 字段名 | 小写蛇形 | `category_id`、`created_at` |
| 主键 | `id` | `id BIGINT NOT NULL PRIMARY KEY` |
| 唯一索引 | `uk_字段名` | `uk_email` |
| 普通索引 | `idx_字段名` | `idx_created_at`、`idx_category_id_date` |
| 关联表 | `{主表}_{从表}` | `user_role` |

---

## 二、项目分层架构

### 2.1 分层职责

```
┌─────────────────────────────────────┐
│  Controller 层                      │
│  - 参数校验 (@Valid)                │
│  - 调用 Service                     │
│  - 封装 Result<T> 返回              │
│  - 禁止：写业务逻辑、直接调 Mapper  │
├─────────────────────────────────────┤
│  Service 层                         │
│  - 业务逻辑编排                     │
│  - 事务管理 (@Transactional)        │
│  - 数据转换（DTO ↔ Entity）         │
│  - 调用 Mapper + 外部服务           │
├─────────────────────────────────────┤
│  Mapper 层                          │
│  - 继承 BaseMapper<T>              │
│  - 复杂查询写 XML                   │
│  - 禁止：写业务逻辑                 │
├─────────────────────────────────────┤
│  Entity 层                          │
│  - 纯 POJO，与表结构一一对应        │
│  - 禁止：包含业务逻辑               │
└─────────────────────────────────────┘
```

### 2.2 代码示例

```java
// Controller 层
@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public Result<TransactionVO> create(@Valid @RequestBody TransactionCreateDTO dto) {
        return Result.ok(transactionService.create(dto));
    }

    @GetMapping("/{id}")
    public Result<TransactionVO> getById(@PathVariable Long id) {
        return Result.ok(transactionService.getById(id));
    }

    @GetMapping
    public Result<PageResult<TransactionVO>> page(TransactionPageQuery query) {
        return Result.ok(transactionService.page(query));
    }
}
```

```java
// Service 层
public interface TransactionService {

    TransactionVO create(TransactionCreateDTO dto);
    TransactionVO getById(Long id);
    PageResult<TransactionVO> page(TransactionPageQuery query);
}
```

```java
// Service 实现层
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionMapper transactionMapper;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TransactionVO create(TransactionCreateDTO dto) {
        // 1. 业务校验
        Category category = categoryMapper.selectById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        // 2. DTO → Entity
        Transaction entity = TransactionConverter.toEntity(dto);
        // 3. 持久化
        transactionMapper.insert(entity);
        // 4. Entity → VO 返回
        return TransactionConverter.toVO(entity, category);
    }
}
```

### 2.3 数据对象分层

| 对象 | 使用位置 | 职责 |
|------|----------|------|
| **DTO** (Data Transfer Object) | Controller 接收参数 | 请求参数校验、前端→后端 |
| **VO** (View Object) | Controller 返回数据 | 前端展示、后端→前端 |
| **Entity** | Mapper / Service | 与数据库表一一映射 |
| **Query** | Controller 接收分页/筛选参数 | 分页查询、筛选条件 |

**规则**：不同层之间的数据转换必须在 Service 层完成，禁止 Entity 直接返回给前端，也禁止 DTO 直接传给 Mapper。

---

## 三、API 设计规范

### 3.1 URL 设计

```yaml
# ✅ 正确：资源复数、层级清晰
GET    /api/v1/transactions              # 列表
GET    /api/v1/transactions/{id}         # 详情
POST   /api/v1/transactions              # 新增
PUT    /api/v1/transactions/{id}         # 全量更新
PATCH  /api/v1/transactions/{id}         # 部分更新
DELETE /api/v1/transactions/{id}         # 删除

GET    /api/v1/categories/{id}/transactions  # 某个分类下的流水

# ❌ 错误
GET    /api/v1/getTransaction?id=1           # 动词命名
POST   /api/v1/transactions/create           # 冗余
GET    /api/v1/transaction/1                 # 单数
```

### 3.2 统一响应格式

```json
// 成功
{
  "code": 200,
  "message": "success",
  "data": { ... }
}

// 分页成功
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [ ... ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}

// 参数校验失败
{
  "code": 400,
  "message": "分类ID不能为空",
  "data": null
}

// 业务异常
{
  "code": 500,
  "message": "预算余额不足，本次支出超出月度预算",
  "data": null
}
```

### 3.3 HTTP 状态码

| 场景 | HTTP Status | Result.code |
|------|-------------|-------------|
| 成功 | 200 | 200 |
| 参数校验失败 | 200 | 400 |
| 认证失败 | 200 | 401 |
| 越权操作 | 200 | 403 |
| 资源不存在 | 200 | 404 |
| 业务异常 | 200 | 500 |
| 系统错误 | 200 | 500 |

**规则**：HTTP 层统一返回 200，通过 `Result.code` 区分业务状态。这是与前端约定的模式，避免前端需要同时处理 HTTP 异常和业务异常。

### 3.4 参数校验

```java
// ✅ 使用 @Valid + 校验注解
@Data
public class TransactionCreateDTO {

    @NotNull(message = "金额不能为空")
    @DecimalMin(value = "0.01", message = "金额必须大于0")
    private BigDecimal amount;

    @NotNull(message = "分类ID不能为空")
    private Long categoryId;

    @NotBlank(message = "类型不能为空")
    @EnumValue(enumClass = TransactionTypeEnum.class, message = "类型不合法")
    private String type;

    @NotNull(message = "日期不能为空")
    @PastOrPresent(message = "日期不能是未来")
    private LocalDate date;
}

@PostMapping
public Result<TransactionVO> create(@Valid @RequestBody TransactionCreateDTO dto) {
    return Result.ok(transactionService.create(dto));
}
```

### 3.5 分页请求/响应

```java
// 分页请求基类
@Data
public class PageQuery {
    @Min(value = 1, message = "页码最小为1")
    private Integer page = 1;

    @Min(value = 1, message = "每页最少1条")
    @Max(value = 100, message = "每页最多100条")
    private Integer pageSize = 20;
}

// 分页响应
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResult<T> {
    private List<T> records;
    private Long total;
    private Integer page;
    private Integer pageSize;

    public static <T> PageResult<T> from(IPage<T> page) {
        return new PageResult<>(
            page.getRecords(),
            page.getTotal(),
            (int) page.getCurrent(),
            (int) page.getSize()
        );
    }
}
```

---

## 四、异常处理规范

### 4.1 异常体系

```
RuntimeException
 └── BusinessException (业务异常，code=500)
      ├── NotFoundException (资源不存在，code=404)
      ├── DuplicateException (数据重复，code=409)
      └── ForbiddenException (越权，code=403)
```

### 4.2 自定义异常

```java
@Data
@EqualsAndHashCode(callSuper = true)
public class BusinessException extends RuntimeException {
    private final int code;
    private final String message;

    public BusinessException(String message) {
        super(message);
        this.code = 500;
        this.message = message;
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }
}
```

### 4.3 全局异常处理

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // 参数校验异常
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValid(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return Result.badRequest(msg);
    }

    // 业务异常
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBiz(BusinessException e) {
        log.warn("业务异常: code={}, message={}", e.getCode(), e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    // 兜底：未知异常（必须打印堆栈）
    @ExceptionHandler(Exception.class)
    public Result<Void> handleUnknown(Exception e) {
        log.error("未知系统异常", e);
        // 生产环境不要返回堆栈信息
        return Result.error("系统繁忙，请稍后重试");
    }
}
```

### 4.4 异常处理铁律

- **禁止** `catch (Exception e) { e.printStackTrace(); }`——必须用日志框架输出
- **禁止** 吞异常不处理 —— 至少要打日志
- **禁止** 在 Controller 中写 `try-catch`，统一交给 `GlobalExceptionHandler`
- **禁止** 将异常栈返回给前端
- Service 层抛出自定义业务异常，不要返回 `null` 或 `-1` 代表错误

---

## 五、日志规范

### 5.1 日志级别使用

| 级别 | 场景 | 示例 |
|------|------|------|
| `ERROR` | 系统错误，需要人工介入 | 数据库连接失败、第三方接口超时 |
| `WARN` | 可恢复的异常，值得关注 | 业务校验不通过、降级逻辑触发 |
| `INFO` | 关键业务流程节点 | 订单创建、预算扣减、定时任务启停 |
| `DEBUG` | 开发调试信息 | SQL 参数、方法入参出参 |

### 5.2 日志格式

```java
// ✅ 使用占位符（不可用字符串拼接）
log.info("创建交易流水: userId={}, amount={}, categoryId={}", userId, amount, categoryId);

// ✅ 异常日志必须传 Throwable 对象
log.error("数据库查询异常: sql={}", sql, e);

// ✅ 大对象用 JSON，加判空
log.debug("请求参数: {}", JSONUtil.toJsonStr(dto));

// ❌ 禁止
log.info("创建交易流水: " + userId + ", " + amount);           // 字符串拼接
log.error("数据库查询异常");                                    // 没有传异常对象
log.info("交易流水: {}", JSONUtil.format(entity));              // 大对象不打 JSON 打印不出
```

### 5.3 日志铁律

- **禁止** 在循环中打印日志
- **禁止** 使用 `System.out.println()`
- **禁止** 打印敏感信息（密码、身份证号、手机号需脱敏）
- 生产环境日志级别 ≥ `INFO`

---

## 六、数据库规范

### 6.1 建表规范

```sql
-- ✅ 标准建表
CREATE TABLE `transaction` (
    `id`            BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id`       BIGINT          NOT NULL                COMMENT '用户ID',
    `amount`        DECIMAL(12, 2)  NOT NULL                COMMENT '金额，正数为收入，负数为支出',
    `category_id`   BIGINT          NOT NULL                COMMENT '分类ID',
    `date`          DATE            NOT NULL                COMMENT '交易日期',
    `note`          VARCHAR(200)    DEFAULT ''              COMMENT '备注',
    `deleted`       TINYINT         NOT NULL DEFAULT 0      COMMENT '逻辑删除：0未删除 1已删除',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_user_id_date` (`user_id`, `date`),
    INDEX `idx_category_id` (`category_id`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='交易流水表';
```

**铁律**：
- 字符集统一 `utf8mb4`，排序规则 `utf8mb4_unicode_ci`
- 引擎统一 `InnoDB`
- 每张表必含 `created_at` + `updated_at`
- 字段注释 **必写**，重要字段注释写清楚含义
- 禁止 `SELECT *`，按需查字段
- 禁止在业务代码中使用 `JOIN` 超过 3 张表，复杂查询用多次查询 + Java 层拼装
- `WHERE` 条件中的字段必须有索引覆盖

### 6.2 逻辑删除

项目统一使用 MyBatis-Plus 逻辑删除：

```yaml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
```

所有表必须定义 `deleted` 字段。

---

## 七、MyBatis-Plus 使用规范

### 7.1 Entity 定义

```java
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("transaction")
public class Transaction extends BaseEntity {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long userId;

    private BigDecimal amount;

    private Long categoryId;

    @TableField("`date`")  // 与 MySQL 关键字冲突时加反引号
    private LocalDate date;

    private String note;

    // 非数据库字段
    @TableField(exist = false)
    private String categoryName;
}
```

### 7.2 BaseEntity 抽取公共字段

```java
@Data
public abstract class BaseEntity implements Serializable {

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
```

### 7.3 使用 LambdaQueryWrapper（禁止字符串列名）

```java
// ✅ 正确：Lambda 表达式，类型安全
LambdaQueryWrapper<Transaction> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(Transaction::getUserId, userId)
       .ge(Transaction::getDate, startDate)
       .le(Transaction::getDate, endDate)
       .orderByDesc(Transaction::getDate);

// ❌ 禁止：字符串列名，重构时易出错
QueryWrapper<Transaction> wrapper = new QueryWrapper<>();
wrapper.eq("user_id", userId)
       .ge("date", startDate);
```

### 7.4 分页查询

```java
// Service 层
public PageResult<TransactionVO> page(TransactionPageQuery query) {
    LambdaQueryWrapper<Transaction> wrapper = new LambdaQueryWrapper<>();
    wrapper.eq(Transaction::getUserId, query.getUserId())
           .ge(query.getStartDate() != null, Transaction::getDate, query.getStartDate())
           .le(query.getEndDate() != null, Transaction::getDate, query.getEndDate())
           .orderByDesc(Transaction::getDate);

    IPage<Transaction> page = transactionMapper.selectPage(
        new Page<>(query.getPage(), query.getPageSize()),
        wrapper
    );

    // Entity → VO 转换
    List<TransactionVO> voList = page.getRecords().stream()
        .map(TransactionConverter::toVO)
        .collect(Collectors.toList());

    return new PageResult<>(voList, page.getTotal(), query.getPage(), query.getPageSize());
}
```

### 7.5 复杂查询写 XML

分页查询、多表关联等复杂 SQL 统一写在 `mapper/` 目录下的 XML 中：

```xml
<!-- src/main/resources/mapper/TransactionMapper.xml -->
<mapper namespace="com.lingji.finance.mapper.TransactionMapper">

    <select id="statByCategory" resultType="com.lingji.finance.vo.CategoryStatVO">
        SELECT c.id AS category_id,
               c.name AS category_name,
               COALESCE(SUM(t.amount), 0) AS total_amount,
               COUNT(t.id) AS count
        FROM category c
        LEFT JOIN transaction t ON t.category_id = c.id
            AND t.deleted = 0
            AND t.date BETWEEN #{startDate} AND #{endDate}
        WHERE c.deleted = 0
        GROUP BY c.id, c.name
        ORDER BY total_amount DESC
    </select>

</mapper>
```

---

## 八、Lombok 使用规范

### 8.1 必用注解

| 注解 | 场景 | 说明 |
|------|------|------|
| `@Data` | Entity、DTO、VO | 生成 getter/setter + toString + equals/hashCode |
| `@Slf4j` | 任何需要日志的类 | 统一日志门面 |
| `@Builder` | 构造复杂对象 | 链式构建，配合 `@AllArgsConstructor` |
| `@RequiredArgsConstructor` | Controller/Service 注入 | 构造器注入（final 字段） |

### 8.2 慎用/不用注解

| 注解 | 原因 |
|------|------|
| `@Data` 用在有继承关系的类上 | `equals/hashCode` 默认不包含父类字段，用 `@EqualsAndHashCode(callSuper = true)` |
| `@Value` | 不可变对象场景很少，用得少可以接受 |
| `@SneakyThrows` | 隐藏受检异常，不利于问题排查 |

### 8.3 示例

```java
// Controller / Service：构造器注入
@RestController
@RequiredArgsConstructor  // 为 final 字段生成构造器
@Slf4j
public class TransactionController {
    private final TransactionService transactionService;
}

// Entity：等于比较包含父类字段
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("transaction")
public class Transaction extends BaseEntity { ... }

// DTO：链式构建
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionCreateDTO { ... }
```

---

## 九、空值处理与防御式编程

### 9.1 空值处理

```java
// ✅ 使用 Optional 明确表达"可能不存在"
public Optional<Transaction> findById(Long id) {
    return Optional.ofNullable(transactionMapper.selectById(id));
}

// ✅ 使用 java.util.Objects
Objects.requireNonNull(userId, "userId 不能为空");

// ✅ 集合判空统一用 CollectionUtils
if (CollectionUtils.isEmpty(list)) {
    return Collections.emptyList();
}

// ✅ 字符串判空统一用 StringUtils
if (StringUtils.hasText(name)) {
    wrapper.like(Transaction::getNote, name);
}
```

### 9.2 防御式编程

```java
// ✅ BigDecimal 比较用 compareTo
if (amount.compareTo(BigDecimal.ZERO) > 0) { ... }

// ✅ 集合不返回 null
public List<TransactionVO> listByUserId(Long userId) {
    List<Transaction> list = transactionMapper.selectList(...);
    if (CollectionUtils.isEmpty(list)) {
        return Collections.emptyList();  // ✅ 返回空集合
    }
    return list.stream().map(converter::toVO).toList();
}

// ✅ 除数为 0 保护
BigDecimal rate = total.compareTo(BigDecimal.ZERO) == 0
    ? BigDecimal.ZERO
    : amount.divide(total, 4, RoundingMode.HALF_UP);
```

---

## 十、注释规范

### 10.1 必须写注释的场景

```java
/**
 * 计算月度预算健康度得分。
 *
 * 算法：健康度 = (预算剩余 / 总预算) × 100，按以下阈值分级：
 * - 80~100：绿色（健康）
 * - 50~79：黄色（警告）
 * - 20~49：橙色（危险）
 * - 0~19：红色（超支）
 *
 * @param totalBudget  月度总预算
 * @param spent        已支出金额
 * @return 健康度得分 0~100
 */
public int calcBudgetHealth(BigDecimal totalBudget, BigDecimal spent) { ... }
```

### 10.2 不需要写注释的场景

```java
// ❌ 废话注释
// 设置用户名
user.setName(name);

// 创建用户对象
User user = new User();
```

**原则**：代码即注释。好的方法名、变量名比注释更重要。注释解释 **为什么这么做**，而非 **做了什么**。

---

## 十一、测试规范

### 11.1 测试金字塔

```
         / E2E \
        /───────\
       /  集成测试 \
      /────────────\
     /   单元测试     \
    /────────────────\
```

- 单元测试：覆盖 Service 层全部公共方法
- 集成测试：覆盖 Controller 层 + Mapper XML
- 测试覆盖率目标：业务逻辑 ≥ 80%

### 11.2 单元测试示例

```java
@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionMapper transactionMapper;
    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    @Test
    @DisplayName("创建交易 — 分类存在时应成功")
    void create_shouldSucceed_whenCategoryExists() {
        TransactionCreateDTO dto = TransactionCreateDTO.builder()
            .amount(new BigDecimal("100.00"))
            .categoryId(1L)
            .type("expense")
            .date(LocalDate.now())
            .build();

        when(categoryMapper.selectById(1L)).thenReturn(mockCategory);

        TransactionVO result = transactionService.create(dto);

        assertThat(result).isNotNull();
        verify(transactionMapper).insert(any(Transaction.class));
    }

    @Test
    @DisplayName("创建交易 — 分类不存在时应抛出异常")
    void create_shouldThrowException_whenCategoryNotExists() {
        TransactionCreateDTO dto = TransactionCreateDTO.builder()
            .amount(new BigDecimal("100.00"))
            .categoryId(999L)
            .build();

        when(categoryMapper.selectById(999L)).thenReturn(null);

        assertThatThrownBy(() -> transactionService.create(dto))
            .isInstanceOf(BusinessException.class)
            .hasMessage("分类不存在");
    }
}
```

### 11.3 测试命名

```
方法名_should{预期行为}_when{条件}

示例：
- create_shouldSucceed_whenValidData
- create_shouldThrowException_whenAmountIsZero
- list_shouldReturnEmptyList_whenNoData
```

---

## 十二、Git 提交规范

### 12.1 分支管理

```
main           # 生产就绪
├── develop    # 开发主分支
│   ├── feat/transaction-create   # 功能分支
│   ├── feat/budget-stat
│   ├── fix/amount-precision      # 修复分支
│   └── refactor/date-utils       # 重构分支
└── hotfix/xxx # 紧急修复
```

### 12.2 Commit Message 格式

```
<type>(<scope>): <subject>

[body]

[footer]
```

| type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `refactor` | 重构（非新功能非修 bug） |
| `docs` | 文档变更 |
| `style` | 代码格式（不影响逻辑） |
| `test` | 测试相关 |
| `chore` | 构建/工具变更 |

**示例**：

```
feat(transaction): 新增交易流水创建接口

- 实现 TransactionController.create
- 添加金额必须大于0的校验
- 关联分类校验，不存在时返回 404

Closes #12
```

---

## 十三、安全规范

### 13.1 防 SQL 注入

MyBatis XML 中使用 `#{}` 而非 `${}`（除非确定需要动态表名/列名）。

```xml
<!-- ✅ 使用 #{} 预编译 -->
<select>
    SELECT * FROM transaction WHERE id = #{id}
</select>

<!-- ❌ 禁止 ${} 拼接用户输入 -->
<select>
    SELECT * FROM transaction WHERE id = ${id}
</select>
```

### 13.2 敏感信息

- 日志禁止打印密码、身份证号、手机号
- 配置文件中的密码使用环境变量或配置中心
- API 响应中不返回数据库内部 ID 以外的任何内部标识

```java
// application.yml
spring:
  datasource:
    password: ${DB_PASSWORD}  # 从环境变量读取
```

---

## 十四、禁止清单（Anti-Patterns）

以下行为在代码审查中直接打回：

| # | 禁止行为 | 原因 |
|---|---------|------|
| 1 | Controller 中写业务逻辑 | 分层失控 |
| 2 | Controller 直接调用 Mapper | 跳层 |
| 3 | 返回 Entity 给前端 | 暴露数据库结构、循环引用风险 |
| 4 | `SELECT *` | 性能浪费、字段不可控 |
| 5 | 字符串硬编码拼接列名 | 重构风险 |
| 6 | `catch` 后不处理也不打日志 | 问题无法追踪 |
| 7 | `e.printStackTrace()` | 日志输出不受控 |
| 8 | 循环中打印日志 / 查数据库 | 性能杀手 |
| 9 | 使用 `Double`/`Float` 存金额 | 精度丢失，必须用 `BigDecimal` |
| 10 | 集合判空 `if (list == null)` | 应同时判 `isEmpty()`，用 `CollectionUtils` |
| 11 | 方法返回 `null` 代表"没有数据" | 返回空集合或 `Optional` |
| 12 | 测试代码没断言 (`assert`) | 没断言的测试不是测试 |
| 13 | `public` 类字段 | 必须用 private + getter/setter |
| 14 | 超过 100 行的方法 | 可读性差，必须拆分 |
| 15 | `@Transactional` 加在 Controller | 事务应在 Service 层管理 |

---

> **本规范由灵记项目技术委员会制定，所有 PR 需对照检查清单逐条审查。如有争议，以本文档为准。**

*最后更新：2026-06-14*
