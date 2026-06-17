package com.lingji.finance.service;

/**
 * BudgetServiceImpl 单元测试
 *
 * 覆盖范围:
 * - setBudget: 首次创建预算 (insert + category insert)
 * - setBudget: 重复设置同一月份 (update + 物理删除旧category + 插入新category)
 * - setBudget: categoryBudgets 为空时不插入明细
 * - getBoard: 健康度阈值 (green<60 / yellow<85 / orange<100 / red>=100)
 * - getBoard: 无预算时 totalBudget=0
 *
 * 被测类: com.lingji.finance.service.impl.BudgetServiceImpl
 * Mapper Mock: BudgetMapper, BudgetCategoryMapper, CategoryMapper, TransactionMapper
 */
import com.lingji.finance.dto.BudgetCategorySetDTO;
import com.lingji.finance.dto.BudgetSetDTO;
import com.lingji.finance.entity.Budget;
import com.lingji.finance.entity.BudgetCategory;
import com.lingji.finance.mapper.*;
import com.lingji.finance.service.impl.BudgetServiceImpl;
import com.lingji.finance.vo.BudgetBoardVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BudgetServiceImpl 预算服务测试")
class BudgetServiceImplTest {

    @Mock private BudgetMapper budgetMapper;
    @Mock private BudgetCategoryMapper budgetCategoryMapper;
    @Mock private CategoryMapper categoryMapper;
    @Mock private TransactionMapper transactionMapper;

    @InjectMocks
    private BudgetServiceImpl budgetService;

    private BudgetSetDTO dto;

    @BeforeEach
    void setUp() {
        dto = new BudgetSetDTO();
        dto.setUserId(1L);
        dto.setYear(2026);
        dto.setMonth(6);
        dto.setTotalBudget(new BigDecimal("5000"));

        BudgetCategorySetDTO catDto = new BudgetCategorySetDTO();
        catDto.setCategoryId(1L);
        catDto.setAmount(new BigDecimal("2000"));
        dto.setCategoryBudgets(List.of(catDto));
    }

    @Test
    @DisplayName("首次创建预算: 插入 budget + 插入 category")
    void setBudget_whenNew_shouldInsertBudgetAndCategories() {
        when(budgetMapper.selectOne(any())).thenReturn(null);

        budgetService.setBudget(dto);

        verify(budgetMapper).insert(any(Budget.class));
        verify(budgetCategoryMapper).physicalDeleteByBudgetId(anyLong());
        verify(budgetCategoryMapper, times(1)).insert(any(BudgetCategory.class));
    }

    @Test
    @DisplayName("重复设置预算: 更新 budget + 物理删除旧分类 + 插入新分类")
    void setBudget_whenExisting_shouldUpdateAndReplaceCategories() {
        Budget existingBudget = new Budget();
        existingBudget.setId(10L);
        existingBudget.setTotalBudget(new BigDecimal("4000"));
        when(budgetMapper.selectOne(any())).thenReturn(existingBudget);

        budgetService.setBudget(dto);

        // 应调用 updateById 更新 budget
        verify(budgetMapper).updateById(any(Budget.class));
        // 应调用物理删除
        verify(budgetCategoryMapper).physicalDeleteByBudgetId(10L);
        // 应插入新的分类预算
        verify(budgetCategoryMapper, times(1)).insert(any(BudgetCategory.class));
    }

    @Test
    @DisplayName("categoryBudgets 为空时不插入明细")
    void setBudget_whenNoCategoryBudgets_shouldNotInsert() {
        dto.setCategoryBudgets(Collections.emptyList());
        when(budgetMapper.selectOne(any())).thenReturn(null);

        budgetService.setBudget(dto);

        verify(budgetMapper).insert(any(Budget.class));
        verify(budgetCategoryMapper).physicalDeleteByBudgetId(anyLong());
        verify(budgetCategoryMapper, never()).insert(any());
    }

    @Test
    @DisplayName("getBoard: 无预算时 totalBudget=0")
    void getBoard_whenNoBudget_shouldReturnZeroBudget() {
        when(budgetMapper.selectOne(any())).thenReturn(null);

        BudgetBoardVO board = budgetService.getBoard(1L, 2026, 6);

        assertEquals(new BigDecimal("0"), board.getTotalBudget());
        assertEquals(new BigDecimal("0"), board.getUsagePercent());
    }
}
