package com.lingji.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.lingji.finance.dto.BudgetCategorySetDTO;
import com.lingji.finance.dto.BudgetSetDTO;
import com.lingji.finance.entity.Budget;
import com.lingji.finance.entity.BudgetCategory;
import com.lingji.finance.entity.Category;
import com.lingji.finance.exception.BusinessException;
import com.lingji.finance.mapper.BudgetCategoryMapper;
import com.lingji.finance.mapper.BudgetMapper;
import com.lingji.finance.mapper.CategoryMapper;
import com.lingji.finance.mapper.TransactionMapper;
import com.lingji.finance.service.BudgetService;
import com.lingji.finance.vo.BudgetBoardVO;
import com.lingji.finance.vo.CategoryStatVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 预算服务实现。
 *
 * @author LingJi
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetMapper budgetMapper;
    private final BudgetCategoryMapper budgetCategoryMapper;
    private final CategoryMapper categoryMapper;
    private final TransactionMapper transactionMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void setBudget(BudgetSetDTO dto) {
        // 1. 查找或创建预算主记录
        LambdaQueryWrapper<Budget> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Budget::getUserId, dto.getUserId())
               .eq(Budget::getYear, dto.getYear())
               .eq(Budget::getMonth, dto.getMonth());

        Budget budget = budgetMapper.selectOne(wrapper);
        if (budget == null) {
            budget = new Budget();
            budget.setUserId(dto.getUserId());
            budget.setYear(dto.getYear());
            budget.setMonth(dto.getMonth());
            budget.setTotalBudget(dto.getTotalBudget());
            budgetMapper.insert(budget);
        } else {
            budget.setTotalBudget(dto.getTotalBudget());
            budgetMapper.updateById(budget);
        }

        // 2. 物理删除旧的分类预算明细（避免 @TableLogic 逻辑删除导致 UNIQUE 约束冲突）
        budgetCategoryMapper.physicalDeleteByBudgetId(budget.getId());

        // 3. 插入新的分类预算明细
        if (!CollectionUtils.isEmpty(dto.getCategoryBudgets())) {
            for (BudgetCategorySetDTO bcDTO : dto.getCategoryBudgets()) {
                BudgetCategory bc = new BudgetCategory();
                bc.setBudgetId(budget.getId());
                bc.setCategoryId(bcDTO.getCategoryId());
                bc.setAmount(bcDTO.getAmount());
                budgetCategoryMapper.insert(bc);
            }
        }

        log.info("预算设置完成: userId={}, {}/{}, total={}",
                dto.getUserId(), dto.getYear(), dto.getMonth(), dto.getTotalBudget());
    }

    @Override
    public BudgetBoardVO getBoard(Long userId, Integer year, Integer month) {
        LocalDate now = LocalDate.now();
        int y = year != null ? year : now.getYear();
        int m = month != null ? month : now.getMonthValue();

        // 1. 查询预算
        LambdaQueryWrapper<Budget> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Budget::getUserId, userId)
               .eq(Budget::getYear, y)
               .eq(Budget::getMonth, m);
        Budget budget = budgetMapper.selectOne(wrapper);

        // 2. 计算本月已支出总额
        LocalDate startDate = LocalDate.of(y, m, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        BigDecimal totalSpent = transactionMapper.sumByType(userId, "expense", startDate, endDate);
        if (totalSpent == null) totalSpent = BigDecimal.ZERO;

        // 3. 计算使用率和健康度
        BigDecimal totalBudget = budget != null ? budget.getTotalBudget() : BigDecimal.ZERO;
        BigDecimal remaining = totalBudget.subtract(totalSpent);
        BigDecimal usagePercent = totalBudget.compareTo(BigDecimal.ZERO) > 0
                ? totalSpent.multiply(new BigDecimal("100")).divide(totalBudget, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        String health = calcHealth(usagePercent);

        // 4. 构建分类明细
        List<BudgetBoardVO.CategoryBudgetDetail> categoryDetails = buildCategoryDetails(
                userId, y, m, budget, totalSpent);

        return BudgetBoardVO.builder()
                .budgetId(budget != null ? budget.getId() : null)
                .year(y).month(m)
                .totalBudget(totalBudget)
                .totalSpent(totalSpent)
                .remaining(remaining)
                .usagePercent(usagePercent)
                .health(health)
                .categoryDetails(categoryDetails)
                .build();
    }

    /**
     * 构建分类预算明细列表。
     */
    private List<BudgetBoardVO.CategoryBudgetDetail> buildCategoryDetails(
            Long userId, int year, int month, Budget budget, BigDecimal totalSpent) {

        // 获取所有支出类的一级分类
        LambdaQueryWrapper<Category> catWrapper = new LambdaQueryWrapper<>();
        catWrapper.eq(Category::getType, "expense")
                  .isNull(Category::getParentId)
                  .eq(Category::getIsActive, 1)
                  .orderByAsc(Category::getSortOrder);
        List<Category> expenseCategories = categoryMapper.selectList(catWrapper);

        // 获取分类预算额度映射
        Map<Long, BigDecimal> budgetAmountMap = Collections.emptyMap();
        if (budget != null) {
            LambdaQueryWrapper<BudgetCategory> bcWrapper = new LambdaQueryWrapper<>();
            bcWrapper.eq(BudgetCategory::getBudgetId, budget.getId());
            List<BudgetCategory> bcList = budgetCategoryMapper.selectList(bcWrapper);
            budgetAmountMap = bcList.stream()
                    .collect(Collectors.toMap(BudgetCategory::getCategoryId, BudgetCategory::getAmount));
        }

        // 获取各分类实际支出
        List<CategoryStatVO> stats = transactionMapper.statByCategoryAndMonth(
                userId, "expense", year, month);
        Map<Long, BigDecimal> spentMap = stats.stream()
                .collect(Collectors.toMap(CategoryStatVO::getCategoryId, CategoryStatVO::getTotalAmount));

        // 构建明细
        List<BudgetBoardVO.CategoryBudgetDetail> details = new ArrayList<>();
        for (Category cat : expenseCategories) {
            BigDecimal catBudget = budgetAmountMap.getOrDefault(cat.getId(), BigDecimal.ZERO);
            BigDecimal catSpent = spentMap.getOrDefault(cat.getId(), BigDecimal.ZERO);
            BigDecimal catRemaining = catBudget.subtract(catSpent);
            BigDecimal catPercent = catBudget.compareTo(BigDecimal.ZERO) > 0
                    ? catSpent.multiply(new BigDecimal("100")).divide(catBudget, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            details.add(BudgetBoardVO.CategoryBudgetDetail.builder()
                    .categoryId(cat.getId())
                    .categoryName(cat.getName())
                    .categoryIcon(cat.getIcon())
                    .categoryColor(cat.getColor())
                    .budgetAmount(catBudget)
                    .spent(catSpent)
                    .remaining(catRemaining)
                    .usagePercent(catPercent)
                    .build());
        }
        return details;
    }

    /**
     * 根据使用率计算健康度。
     */
    private String calcHealth(BigDecimal percent) {
        double p = percent.doubleValue();
        if (p < 60) return "green";
        if (p < 85) return "yellow";
        if (p < 100) return "orange";
        return "red";
    }
}
