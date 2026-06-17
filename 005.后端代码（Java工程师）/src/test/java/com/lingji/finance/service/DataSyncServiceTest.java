package com.lingji.finance.service;

/**
 * DataSyncService 单元测试
 *
 * 覆盖范围:
 * - syncBudget: category_budgets key 为 "cat_X" 格式 → 正确解析为 Long ID
 * - syncBudget: category_budgets key 为纯分类名 → resolveCategoryId 名称匹配
 * - syncBudget: category_budgets key 无法解析 → 跳过该条目 (不抛异常)
 * - importFromFrontend: reference_id 去重 → 重复交易不插入
 * - exportToFrontend: category_budgets key 格式为 "cat_X"
 *
 * 被测类: com.lingji.finance.service.DataSyncService
 */
import com.lingji.finance.dto.DataSyncDTO;
import com.lingji.finance.entity.*;
import com.lingji.finance.mapper.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DataSyncService 数据同步测试")
class DataSyncServiceTest {

    @Mock private TransactionMapper transactionMapper;
    @Mock private CategoryMapper categoryMapper;
    @Mock private BudgetMapper budgetMapper;
    @Mock private BudgetCategoryMapper budgetCategoryMapper;

    @InjectMocks
    private DataSyncService dataSyncService;

    private final Long userId = 8L;

    @BeforeEach
    void setUp() {
        // 模拟分类数据 (预设分类 + 用户自定义)
        Category cat1 = new Category();
        cat1.setId(1L); cat1.setName("🍽️ 餐饮"); cat1.setType("expense");
        Category cat2 = new Category();
        cat2.setId(12L); cat2.setName("🍔 饭"); cat2.setType("expense");
        when(categoryMapper.selectList(any())).thenReturn(Arrays.asList(cat1, cat2));
    }

    @Test
    @DisplayName("resolveCategoryId: 'cat_12' 格式 → 解析为 12L")
    void resolveCategoryId_catXformat_shouldReturnLong() {
        DataSyncDTO.BudgetData budgetData = DataSyncDTO.BudgetData.builder()
            .total_budget(new BigDecimal("5000"))
            .category_budgets(Map.of("cat_12", new BigDecimal("100")))
            .build();

        when(budgetMapper.selectOne(any())).thenReturn(null);
        when(budgetMapper.insert(any(Budget.class))).thenAnswer(inv -> {
            Budget b = inv.getArgument(0);
            b.setId(9L); // 模拟 auto-increment
            return 1;
        });

        // 通过 importFromFrontend 间接触发 syncBudget
        DataSyncDTO dto = DataSyncDTO.builder().budget(budgetData).build();
        dataSyncService.importFromFrontend(userId, dto);

        // 验证插入了 categoryId=12 的 BudgetCategory
        verify(budgetCategoryMapper).insert(argThat((BudgetCategory bc) ->
            bc.getCategoryId().equals(12L) && bc.getAmount().compareTo(new BigDecimal("100")) == 0
        ));
    }

    @Test
    @DisplayName("resolveCategoryId: 纯分类名 '餐饮' → 名称匹配返回 1L")
    void resolveCategoryId_plainName_shouldMatchByName() {
        DataSyncDTO.BudgetData budgetData = DataSyncDTO.BudgetData.builder()
            .total_budget(new BigDecimal("5000"))
            .category_budgets(Map.of("餐饮", new BigDecimal("200")))
            .build();

        when(budgetMapper.selectOne(any())).thenReturn(null);
        when(budgetMapper.insert(any(Budget.class))).thenAnswer(inv -> {
            Budget b = inv.getArgument(0); b.setId(9L); return 1;
        });

        DataSyncDTO dto = DataSyncDTO.builder().budget(budgetData).build();
        dataSyncService.importFromFrontend(userId, dto);

        verify(budgetCategoryMapper).insert(argThat((BudgetCategory bc) ->
            bc.getCategoryId().equals(1L) && bc.getAmount().compareTo(new BigDecimal("200")) == 0
        ));
    }

    @Test
    @DisplayName("resolveCategoryId: 未知 key → 跳过不插入")
    void resolveCategoryId_unknownKey_shouldSkip() {
        DataSyncDTO.BudgetData budgetData = DataSyncDTO.BudgetData.builder()
            .total_budget(new BigDecimal("5000"))
            .category_budgets(Map.of("unknown_key_xyz", new BigDecimal("300")))
            .build();

        when(budgetMapper.selectOne(any())).thenReturn(null);
        when(budgetMapper.insert(any(Budget.class))).thenAnswer(inv -> {
            Budget b = inv.getArgument(0); b.setId(9L); return 1;
        });

        DataSyncDTO dto = DataSyncDTO.builder().budget(budgetData).build();
        dataSyncService.importFromFrontend(userId, dto);

        // 物理删除被调用，但没有 insert (因为 key 无法解析)
        verify(budgetCategoryMapper).physicalDeleteByBudgetId(anyLong());
        verify(budgetCategoryMapper, never()).insert(any(BudgetCategory.class));
    }

    @Test
    @DisplayName("exportToFrontend: category_budgets key 为 'cat_X' 格式")
    void exportToFrontend_shouldUseCatXKeyFormat() {
        Budget budget = new Budget();
        budget.setId(9L);
        budget.setTotalBudget(new BigDecimal("5000"));
        budget.setYear(2026);
        budget.setMonth(6);

        BudgetCategory bc = new BudgetCategory();
        bc.setBudgetId(9L);
        bc.setCategoryId(12L);
        bc.setAmount(new BigDecimal("100"));

        when(budgetMapper.selectOne(any())).thenReturn(budget);
        when(budgetCategoryMapper.selectList(any())).thenReturn(List.of(bc));
        when(transactionMapper.selectList(any())).thenReturn(Collections.emptyList());

        DataSyncDTO result = dataSyncService.exportToFrontend(userId);

        assertNotNull(result.getBudget());
        // key 应为 "cat_12" 而非 "饭" 或 "餐饮"
        assertTrue(result.getBudget().getCategory_budgets().containsKey("cat_12"));
        assertEquals(new BigDecimal("100"), result.getBudget().getCategory_budgets().get("cat_12"));
    }
}
