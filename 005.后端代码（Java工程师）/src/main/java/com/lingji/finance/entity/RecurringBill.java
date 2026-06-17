package com.lingji.finance.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.lingji.finance.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 周期账单实体。
 * <p>
 * 用于管理定期重复的账单，如房租、订阅服务等。
 * V2 阶段启用完整功能，MVP 阶段仅建表。
 *
 * @author LingJi
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("recurring_bill")
public class RecurringBill extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户ID */
    private Long userId;

    /** 账单名称 */
    private String name;

    /** 金额 */
    private BigDecimal amount;

    /** 关联分类ID */
    private Long categoryId;

    /** 类型：expense / income */
    private String type;

    /** 周期：daily / weekly / monthly / yearly */
    private String cycle;

    /** 周期日（月=1-28，周=1-7） */
    private Integer cycleDay;

    /** 下次到期日 */
    private LocalDate nextDate;

    /** 备注 */
    private String note;

    /** 是否启用：1启用 0停用 */
    private Integer isActive;
}
