package com.lingji.finance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 分类预算设置条目。
 *
 * @author LingJi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetCategorySetDTO {

    /** 分类ID */
    @NotNull(message = "分类ID不能为空")
    private Long categoryId;

    /** 该分类的预算金额 */
    @NotNull(message = "分类预算金额不能为空")
    @DecimalMin(value = "0.01", message = "分类预算必须大于0")
    private BigDecimal amount;
}
