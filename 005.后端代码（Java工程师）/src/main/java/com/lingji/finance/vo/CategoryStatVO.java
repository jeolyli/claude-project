package com.lingji.finance.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 分类统计视图对象（用于饼图、趋势分析）。
 *
 * @author LingJi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryStatVO {

    /** 分类ID */
    private Long categoryId;
    /** 分类名称 */
    private String categoryName;
    /** 分类图标 */
    private String categoryIcon;
    /** 分类颜色 */
    private String categoryColor;
    /** 该分类下的总金额 */
    private BigDecimal totalAmount;
    /** 该分类下的交易笔数 */
    private Long count;
}
