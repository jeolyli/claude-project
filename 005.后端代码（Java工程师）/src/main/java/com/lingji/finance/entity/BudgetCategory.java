package com.lingji.finance.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.lingji.finance.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 分类预算明细实体。
 * <p>
 * 每条记录对应 budget 中某一个分类的预算额度。
 *
 * @author LingJi
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("budget_category")
public class BudgetCategory extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 预算ID */
    private Long budgetId;

    /** 分类ID */
    private Long categoryId;

    /** 该分类的预算金额 */
    private BigDecimal amount;
}
