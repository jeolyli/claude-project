package com.lingji.finance.controller;

import com.lingji.finance.common.Result;
import com.lingji.finance.dto.BudgetSetDTO;
import com.lingji.finance.service.BudgetService;
import com.lingji.finance.vo.BudgetBoardVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 预算控制器。
 *
 * @author LingJi
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    /**
     * 设置/更新月度预算。
     */
    @PostMapping
    public Result<Void> setBudget(@Valid @RequestBody BudgetSetDTO dto) {
        budgetService.setBudget(dto);
        return Result.ok();
    }

    /**
     * 获取预算看板（含实时消费进度）。
     */
    @GetMapping("/board")
    public Result<BudgetBoardVO> getBoard(@RequestParam Long userId,
                                           @RequestParam(required = false) Integer year,
                                           @RequestParam(required = false) Integer month) {
        return Result.ok(budgetService.getBoard(userId, year, month));
    }
}
