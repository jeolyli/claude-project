package com.lingji.finance.service;

import com.lingji.finance.dto.DataSyncDTO;
import com.lingji.finance.dto.DataSyncDTO.*;
import com.lingji.finance.entity.*;
import com.lingji.finance.mapper.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 数据同步服务 —— 前端 localStorage 格式 ↔ 后端 MySQL 互转。
 *
 * @author LingJi
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DataSyncService {

    private final TransactionMapper transactionMapper;
    private final CategoryMapper categoryMapper;
    private final BudgetMapper budgetMapper;
    private final BudgetCategoryMapper budgetCategoryMapper;

    // ======================== 后端 → 前端 ========================

    /**
     * 从 MySQL 读取用户数据，转为前端 localStorage 格式。
     */
    public DataSyncDTO exportToFrontend(Long userId) {
        // 1. 分类（系统预设 + 该用户自定义）
        var catWrapper = new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Category>()
                .and(w -> w.isNull(Category::getUserId).or().eq(Category::getUserId, userId))
                .eq(Category::getIsActive, 1)
                .orderByAsc(Category::getParentId)
                .orderByAsc(Category::getSortOrder);
        List<Category> categories = categoryMapper.selectList(catWrapper);
        List<CategoryItem> catItems = categories.stream()
                .map(this::toFrontendCategory)
                .collect(Collectors.toList());

        // 2. 交易流水
        List<Transaction> transactions = transactionMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Transaction>()
                        .eq(Transaction::getUserId, userId)
                        .orderByDesc(Transaction::getDate)
        );
        // 批量查分类用于名称映射
        Map<Long, Category> catMap = categories.stream()
                .collect(Collectors.toMap(Category::getId, c -> c, (a, b) -> a));
        List<TransactionItem> txItems = transactions.stream()
                .map(tx -> toFrontendTransaction(tx, catMap))
                .collect(Collectors.toList());

        // 3. 预算
        BudgetData budgetData = exportBudget(userId);

        return DataSyncDTO.builder()
                .transactions(txItems)
                .categories(catItems)
                .budget(budgetData)
                .recurringBills(Collections.emptyList())
                .build();
    }

    /**
     * 从 MySQL 导出预算数据。
     */
    private BudgetData exportBudget(Long userId) {
        LocalDate now = LocalDate.now();
        var wrapper = new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Budget>()
                .eq(Budget::getUserId, userId)
                .eq(Budget::getYear, now.getYear())
                .eq(Budget::getMonth, now.getMonthValue());
        Budget budget = budgetMapper.selectOne(wrapper);

        if (budget == null) {
            return BudgetData.builder()
                    .total_budget(new BigDecimal("5000"))
                    .category_budgets(new HashMap<>())
                    .updated_at(now.toString())
                    .build();
        }

        var bcWrapper = new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<BudgetCategory>()
                .eq(BudgetCategory::getBudgetId, budget.getId());
        List<BudgetCategory> bcList = budgetCategoryMapper.selectList(bcWrapper);

        // category_budgets 使用 cat_X 格式作为 key，与前端 categories 的 id 一致
        Map<String, BigDecimal> catBudgets = new HashMap<>();
        for (BudgetCategory bc : bcList) {
            catBudgets.put("cat_" + bc.getCategoryId(), bc.getAmount());
        }

        return BudgetData.builder()
                .total_budget(budget.getTotalBudget())
                .category_budgets(catBudgets)
                .updated_at(budget.getUpdatedAt() != null ? budget.getUpdatedAt().toString() : now.toString())
                .build();
    }

    // ======================== 前端 → 后端 ========================

    /**
     * 将前端 localStorage 数据写入 MySQL。
     */
    @Transactional(rollbackFor = Exception.class)
    public void importFromFrontend(Long userId, DataSyncDTO dto) {
        // 1. 同步分类：增量合并（只插入不删除，按 name+userId 去重）
        if (dto.getCategories() != null && !dto.getCategories().isEmpty()) {
            // 查询已有用户分类
            var existingCats = categoryMapper.selectList(
                    new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Category>()
                            .eq(Category::getUserId, userId));
            Set<String> existingNames = new HashSet<>();
            for (Category c : existingCats) {
                existingNames.add(stripEmojiPrefix(c.getName()));
            }

            for (DataSyncDTO.CategoryItem item : dto.getCategories()) {
                // 跳过系统预设分类
                if (item.getIs_preset() != null && item.getIs_preset()) {
                    continue;
                }
                // 已存在则跳过
                if (existingNames.contains(item.getName())) {
                    continue;
                }
                Category cat = new Category();
                cat.setUserId(userId);
                cat.setName(item.getName());
                cat.setIcon(item.getIcon());
                cat.setColor(item.getColor());
                cat.setType(item.getType());
                cat.setSortOrder(item.getSort_order() != null ? item.getSort_order() : 0);
                cat.setIsPreset(0);
                cat.setIsActive(item.getIs_active() != null && item.getIs_active() ? 1 : 0);
                categoryMapper.insert(cat);
                existingNames.add(item.getName());
            }
        }

        // 2. 同步交易：用前端 id（如 "tx_xxx"）存入 reference_id，跨批次去重
        if (dto.getTransactions() != null && !dto.getTransactions().isEmpty()) {
            // 查询已有 reference_id
            var existingTxs = transactionMapper.selectList(
                    new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Transaction>()
                            .eq(Transaction::getUserId, userId)
                            .isNotNull(Transaction::getReferenceId));
            Set<String> dbRefIds = new HashSet<>();
            for (Transaction t : existingTxs) {
                if (t.getReferenceId() != null) dbRefIds.add(t.getReferenceId());
            }

            Map<String, Long> nameToId = buildCategoryNameMap();
            int inserted = 0;

            for (TransactionItem item : dto.getTransactions()) {
                if (item.getId() != null && dbRefIds.contains(item.getId())) {
                    continue; // 已存在，跳过
                }
                Transaction tx = new Transaction();
                tx.setUserId(userId);
                tx.setReferenceId(item.getId());  // 存前端 ID
                tx.setType(item.getType());
                tx.setAmount(item.getAmount());
                tx.setCategoryId(nameToId.getOrDefault(item.getCategory(), nameToId.getOrDefault("其他", 1L)));
                tx.setDate(item.getDate() != null ? LocalDate.parse(item.getDate()) : LocalDate.now());
                tx.setNote(item.getNote() != null ? item.getNote() : "");
                transactionMapper.insert(tx);
                if (item.getId() != null) dbRefIds.add(item.getId());
                inserted++;
            }
            if (inserted > 0) {
                log.info("同步交易: userId={}, 新增{}条", userId, inserted);
            }
        }

        // 3. 同步预算
        if (dto.getBudget() != null) {
            syncBudget(userId, dto.getBudget());
        }

        log.info("数据同步完成: userId={}, transactions={}, categories={}, budget={}",
                userId, dto.getTransactions() != null ? dto.getTransactions().size() : 0,
                dto.getCategories() != null ? dto.getCategories().size() : 0,
                dto.getBudget() != null ? dto.getBudget().getTotal_budget() : null);
    }

    /** 生成交易的去重 key */
    private String txKey(Transaction t) {
        return (t.getDate() != null ? t.getDate().toString() : "") + "|"
                + (t.getAmount() != null ? t.getAmount().toPlainString() : "") + "|"
                + (t.getCategoryId() != null ? t.getCategoryId().toString() : "") + "|"
                + (t.getNote() != null ? t.getNote() : "");
    }

    private void syncBudget(Long userId, BudgetData budgetData) {
        LocalDate now = LocalDate.now();
        var wrapper = new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Budget>()
                .eq(Budget::getUserId, userId)
                .eq(Budget::getYear, now.getYear())
                .eq(Budget::getMonth, now.getMonthValue());
        Budget budget = budgetMapper.selectOne(wrapper);

        if (budget == null) {
            budget = new Budget();
            budget.setUserId(userId);
            budget.setYear(now.getYear());
            budget.setMonth(now.getMonthValue());
            budget.setTotalBudget(budgetData.getTotal_budget() != null
                    ? budgetData.getTotal_budget() : new BigDecimal("5000"));
            budgetMapper.insert(budget);
        } else {
            budget.setTotalBudget(budgetData.getTotal_budget() != null
                    ? budgetData.getTotal_budget() : budget.getTotalBudget());
            budgetMapper.updateById(budget);
        }

        // 分类预算明细：先物理删后插（避免 @TableLogic 逻辑删除导致 UNIQUE 约束冲突）
        budgetCategoryMapper.physicalDeleteByBudgetId(budget.getId());

        if (budgetData.getCategory_budgets() != null) {
            Map<String, Long> nameToId = buildCategoryNameMap();
            for (Map.Entry<String, BigDecimal> entry : budgetData.getCategory_budgets().entrySet()) {
                Long catId = resolveCategoryId(entry.getKey(), nameToId);
                if (catId != null && entry.getValue().compareTo(BigDecimal.ZERO) > 0) {
                    BudgetCategory bc = new BudgetCategory();
                    bc.setBudgetId(budget.getId());
                    bc.setCategoryId(catId);
                    bc.setAmount(entry.getValue());
                    budgetCategoryMapper.insert(bc);
                }
            }
        }
    }

    // ======================== 辅助方法 ========================

    private CategoryItem toFrontendCategory(Category entity) {
        return CategoryItem.builder()
                .id("cat_" + entity.getId())
                .name(stripEmojiPrefix(entity.getName()))
                .icon(entity.getIcon())
                .color(entity.getColor())
                .type(entity.getType())
                .sort_order(entity.getSortOrder())
                .is_preset(entity.getIsPreset() != null && entity.getIsPreset() == 1)
                .is_active(entity.getIsActive() != null && entity.getIsActive() == 1)
                .build();
    }

    private TransactionItem toFrontendTransaction(Transaction tx, Map<Long, Category> catMap) {
        Category cat = catMap.get(tx.getCategoryId());
        return TransactionItem.builder()
                .id("tx_" + tx.getId())
                .user_id("u_" + tx.getUserId())
                .type(tx.getType())
                .amount(tx.getAmount())
                .category(cat != null ? stripEmojiPrefix(cat.getName()) : "其他")
                .categoryIcon(cat != null ? cat.getIcon() : "📦")
                .date(tx.getDate() != null ? tx.getDate().toString() : null)
                .note(tx.getNote())
                .created_at(tx.getCreatedAt() != null ? tx.getCreatedAt().toString() : null)
                .updated_at(tx.getUpdatedAt() != null ? tx.getUpdatedAt().toString() : null)
                .build();
    }

    /**
     * 构建分类名称 → ID 的映射（用于导入时转换）。
     * <p>
     * 数据库分类名可能是 "🍽️ 餐饮"（带 emoji 前缀），
     * 前端传的分类名是 "餐饮"（纯文字）。构建两份映射确保匹配。
     */
    private Map<String, Long> buildCategoryNameMap() {
        List<Category> categories = categoryMapper.selectList(null);
        Map<String, Long> map = new HashMap<>();
        for (Category cat : categories) {
            String fullName = cat.getName();           // e.g. "🍽️ 餐饮"
            String plainName = stripEmojiPrefix(fullName); // e.g. "餐饮"
            map.put(fullName, cat.getId());
            if (!plainName.equals(fullName)) {
                map.put(plainName, cat.getId());
            }
        }
        return map;
    }

    /**
     * 解析分类 ID：先按名称匹配，再按 "cat_X" 格式提取数字 ID。
     */
    private Long resolveCategoryId(String key, Map<String, Long> nameToId) {
        // 1. 按分类名称匹配
        Long id = nameToId.get(key);
        if (id != null) return id;
        // 2. 按 "cat_X" 格式提取数字 ID
        if (key.startsWith("cat_")) {
            try {
                return Long.parseLong(key.substring(4));
            } catch (NumberFormatException ignored) {}
        }
        return null;
    }

    /**
     * 去掉分类名中的 emoji 前缀，如 "🍽️ 餐饮" → "餐饮"。
     */
    private String stripEmojiPrefix(String name) {
        if (name == null) return null;
        int spaceIdx = name.indexOf(' ');
        if (spaceIdx > 0 && spaceIdx < name.length() - 1) {
            String after = name.substring(spaceIdx + 1);
            // 确认前缀确实是 emoji（非 ASCII 字符）
            if (!after.isEmpty() && name.substring(0, 1).matches("[^\\p{ASCII}]")) {
                return after;
            }
        }
        return name;
    }
}
