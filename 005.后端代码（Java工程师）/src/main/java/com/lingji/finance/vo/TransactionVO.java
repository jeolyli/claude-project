package com.lingji.finance.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 交易流水视图对象（返回给前端）。
 *
 * @author LingJi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionVO {

    private Long id;
    /** 类型：expense / income */
    private String type;
    /** 金额 */
    private BigDecimal amount;
    /** 一级分类ID */
    private Long categoryId;
    /** 一级分类名称 */
    private String categoryName;
    /** 一级分类图标 */
    private String categoryIcon;
    /** 一级分类颜色 */
    private String categoryColor;
    /** 二级子分类ID */
    private Long subCategoryId;
    /** 二级子分类名称 */
    private String subCategoryName;
    /** 交易日期 */
    private LocalDate date;
    /** 备注 */
    private String note;
    /** 创建时间 */
    private LocalDateTime createdAt;
}
