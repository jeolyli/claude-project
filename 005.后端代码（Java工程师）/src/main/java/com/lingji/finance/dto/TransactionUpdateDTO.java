package com.lingji.finance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 交易流水更新请求。
 *
 * @author LingJi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionUpdateDTO {

    /** 流水ID */
    @NotNull(message = "ID不能为空")
    private Long id;

    /** 金额（正数） */
    @DecimalMin(value = "0.01", message = "金额必须大于0")
    private BigDecimal amount;

    /** 一级分类ID */
    private Long categoryId;

    /** 二级子分类ID */
    private Long subCategoryId;

    /** 交易日期 */
    private LocalDate date;

    /** 备注 */
    @Size(max = 200, message = "备注最多200字")
    private String note;
}
