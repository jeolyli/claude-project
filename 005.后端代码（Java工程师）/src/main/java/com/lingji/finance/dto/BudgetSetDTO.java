package com.lingji.finance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * 预算设置请求。
 *
 * @author LingJi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetSetDTO {

    /** 用户ID */
    @NotNull(message = "用户ID不能为空")
    private Long userId;

    /** 预算年份 */
    @NotNull(message = "年份不能为空")
    private Integer year;

    /** 预算月份（1-12） */
    @NotNull(message = "月份不能为空")
    @Min(value = 1, message = "月份最小为1")
    @Max(value = 12, message = "月份最大为12")
    private Integer month;

    /** 月度总预算 */
    @NotNull(message = "总预算不能为空")
    @DecimalMin(value = "0.01", message = "总预算必须大于0")
    private BigDecimal totalBudget;

    /** 分类预算明细（可选） */
    private List<BudgetCategorySetDTO> categoryBudgets;
}
