package com.lingji.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lingji.finance.entity.BudgetCategory;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 分类预算明细 Mapper。
 *
 * @author LingJi
 */
@Mapper
public interface BudgetCategoryMapper extends BaseMapper<BudgetCategory> {

    /**
     * 物理删除指定预算的所有分类预算明细（绕过 @TableLogic 逻辑删除）。
     * <p>
     * 因为预算设置采用"先删后插"策略，逻辑删除会导致 UNIQUE 约束冲突。
     */
    @Delete("DELETE FROM budget_category WHERE budget_id = #{budgetId}")
    int physicalDeleteByBudgetId(@Param("budgetId") Long budgetId);
}
