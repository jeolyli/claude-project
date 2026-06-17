package com.lingji.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lingji.finance.entity.RecurringBill;
import org.apache.ibatis.annotations.Mapper;

/**
 * 周期账单 Mapper（V2 启用）。
 *
 * @author LingJi
 */
@Mapper
public interface RecurringBillMapper extends BaseMapper<RecurringBill> {
}
