package com.lingji.finance.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * 预算看板视图对象。
 *
 * @author LingJi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetBoardVO {

    /** 预算ID */
    private Long budgetId;
    /** 年份 */
    private Integer year;
    /** 月份 */
    private Integer month;
    /** 月度总预算 */
    private BigDecimal totalBudget;
    /** 本月已支出金额 */
    private BigDecimal totalSpent;
    /** 剩余预算 */
    private BigDecimal remaining;
    /** 使用率（0~100+） */
    private BigDecimal usagePercent;
    /** 健康度：green / yellow / orange / red */
    private String health;

    /** 分类预算明细 */
    private List<CategoryBudgetDetail> categoryDetails;

    // ---- 内嵌类 ----

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBudgetDetail {
        private Long categoryId;
        private String categoryName;
        private String categoryIcon;
        private String categoryColor;
        /** 该分类预算额度 */
        private BigDecimal budgetAmount;
        /** 该分类已支出 */
        private BigDecimal spent;
        /** 剩余 */
        private BigDecimal remaining;
        /** 使用率 */
        private BigDecimal usagePercent;
    }
}
