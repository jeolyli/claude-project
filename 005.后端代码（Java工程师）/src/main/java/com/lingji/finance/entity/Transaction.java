package com.lingji.finance.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.lingji.finance.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 交易流水实体。
 * <p>
 * amount 统一存正数，type 字段区分支出/收入：
 * <ul>
 *   <li>expense — 支出</li>
 *   <li>income  — 收入</li>
 * </ul>
 *
 * @author LingJi
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("transaction")
public class Transaction extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户ID */
    private Long userId;

    /** 类型：expense（支出）/ income（收入） */
    private String type;

    /** 金额（正数） */
    private BigDecimal amount;

    /** 前端引用ID（如 "tx_xxx"，用于去重） */
    private String referenceId;

    /** 一级分类ID */
    private Long categoryId;

    /** 二级子分类ID */
    private Long subCategoryId;

    /** 交易日期 */
    private LocalDate date;

    /** 备注（最多200字） */
    private String note;

    /** 是否周期账单：1是 0否 */
    private Integer isRecurring;

    /** 关联周期账单ID */
    private Long recurringId;
}
