package com.lingji.finance.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.lingji.finance.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.List;

/**
 * 预算实体（月度预算主表）。
 * <p>
 * 每个用户每年每月仅一条预算记录（uk_user_year_month 唯一约束）。
 * 分类级别预算明细存放在 {@link BudgetCategory} 表中。
 *
 * @author LingJi
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("budget")
public class Budget extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户ID */
    private Long userId;

    /** 预算年份 */
    private Integer year;

    /** 预算月份（1-12） */
    private Integer month;

    /** 月度总预算 */
    private BigDecimal totalBudget;

    // ======================== 非数据库字段 ========================

    /** 分类预算明细（非 DB 字段，查询时填充） */
    @TableField(exist = false)
    private List<BudgetCategory> categoryBudgets;
}
