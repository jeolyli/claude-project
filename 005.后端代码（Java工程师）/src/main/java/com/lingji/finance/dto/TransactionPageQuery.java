package com.lingji.finance.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 交易流水分页查询参数。
 *
 * @author LingJi
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class TransactionPageQuery extends PageQuery {

    /** 用户ID */
    private Long userId;

    /** 类型筛选：expense / income */
    private String type;

    /** 分类筛选 */
    private Long categoryId;

    /** 开始日期 */
    private LocalDate startDate;

    /** 结束日期 */
    private LocalDate endDate;

    /** 关键字搜索（备注模糊匹配） */
    private String keyword;
}
