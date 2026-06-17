package com.lingji.finance.service;

import com.lingji.finance.dto.BudgetSetDTO;
import com.lingji.finance.vo.BudgetBoardVO;

/**
 * 预算服务接口。
 *
 * @author LingJi
 */
public interface BudgetService {

    /**
     * 设置/更新月度预算。
     */
    void setBudget(BudgetSetDTO dto);

    /**
     * 获取预算看板数据（含实时消费进度）。
     */
    BudgetBoardVO getBoard(Long userId, Integer year, Integer month);
}
