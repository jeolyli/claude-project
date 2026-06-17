package com.lingji.finance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 交易流水创建请求。
 *
 * @author LingJi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionCreateDTO {

    /** 类型：expense（支出）/ income（收入） */
    @NotBlank(message = "类型不能为空")
    private String type;

    /** 金额（正数，最小 0.01） */
    @NotNull(message = "金额不能为空")
    @DecimalMin(value = "0.01", message = "金额必须大于0")
    private BigDecimal amount;

    /** 一级分类ID */
    @NotNull(message = "分类不能为空")
    private Long categoryId;

    /** 二级子分类ID（可选） */
    private Long subCategoryId;

    /** 交易日期 */
    @NotNull(message = "日期不能为空")
    @PastOrPresent(message = "日期不能是未来")
    private LocalDate date;

    /** 备注（最多200字） */
    @Size(max = 200, message = "备注最多200字")
    private String note;
}
