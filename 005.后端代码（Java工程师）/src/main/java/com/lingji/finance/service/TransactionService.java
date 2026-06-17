package com.lingji.finance.service;

import com.lingji.finance.common.PageResult;
import com.lingji.finance.dto.TransactionCreateDTO;
import com.lingji.finance.dto.TransactionPageQuery;
import com.lingji.finance.dto.TransactionUpdateDTO;
import com.lingji.finance.vo.CategoryStatVO;
import com.lingji.finance.vo.TransactionVO;

import java.util.List;

/**
 * 交易流水服务接口。
 *
 * @author LingJi
 */
public interface TransactionService {

    /**
     * 创建一笔交易。
     */
    TransactionVO create(Long userId, TransactionCreateDTO dto);

    /**
     * 更新交易。
     */
    TransactionVO update(Long userId, TransactionUpdateDTO dto);

    /**
     * 删除交易（逻辑删除）。
     */
    void delete(Long userId, Long id);

    /**
     * 根据ID查询。
     */
    TransactionVO getById(Long userId, Long id);

    /**
     * 分页查询。
     */
    PageResult<TransactionVO> page(TransactionPageQuery query);

    /**
     * 按分类统计（饼图数据）。
     */
    List<CategoryStatVO> statByCategory(Long userId, Integer year, Integer month);
}
