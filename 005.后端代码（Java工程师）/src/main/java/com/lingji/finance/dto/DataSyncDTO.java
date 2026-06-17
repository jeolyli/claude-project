package com.lingji.finance.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 数据同步响应 —— 匹配前端 localStorage 数据格式。
 * <p>
 * 前端 storage.js 的 getUserData() 返回此结构。
 *
 * @author LingJi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DataSyncDTO {

    private List<TransactionItem> transactions;
    private List<CategoryItem> categories;
    private BudgetData budget;
    private List<Object> recurringBills;

    // ======================== 内嵌类型 ========================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionItem {
        private String id;
        private String user_id;
        private String type;
        private BigDecimal amount;
        /** 分类名称（非 ID） */
        private String category;
        private String categoryIcon;
        private String date;
        private String note;
        private String created_at;
        private String updated_at;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryItem {
        private String id;
        private String name;
        private String icon;
        private String color;
        private String type;
        private Integer sort_order;
        private Boolean is_preset;
        private Boolean is_active;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetData {
        private BigDecimal total_budget;
        private Map<String, BigDecimal> category_budgets;
        private String updated_at;
    }
}
