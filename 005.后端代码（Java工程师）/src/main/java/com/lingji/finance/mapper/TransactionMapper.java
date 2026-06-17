package com.lingji.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lingji.finance.entity.Transaction;
import com.lingji.finance.vo.CategoryStatVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 交易流水 Mapper。
 *
 * @author LingJi
 */
@Mapper
public interface TransactionMapper extends BaseMapper<Transaction> {

    /**
     * 按分类统计支出（用于预算看板和饼图）。
     *
     * @param userId    用户ID
     * @param type      类型（expense）
     * @param startDate 统计起始日期
     * @param endDate   统计截止日期
     * @return 分类统计列表
     */
    List<CategoryStatVO> statByCategory(@Param("userId") Long userId,
                                        @Param("type") String type,
                                        @Param("startDate") LocalDate startDate,
                                        @Param("endDate") LocalDate endDate);

    /**
     * 统计某时间段内总支出/收入。
     */
    BigDecimal sumByType(@Param("userId") Long userId,
                         @Param("type") String type,
                         @Param("startDate") LocalDate startDate,
                         @Param("endDate") LocalDate endDate);

    /**
     * 按分类统计某用户某月的支出金额。
     */
    List<CategoryStatVO> statByCategoryAndMonth(@Param("userId") Long userId,
                                                @Param("type") String type,
                                                @Param("year") Integer year,
                                                @Param("month") Integer month);
}
