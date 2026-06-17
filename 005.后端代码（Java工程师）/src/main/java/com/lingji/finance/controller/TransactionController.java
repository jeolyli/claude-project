package com.lingji.finance.controller;

import com.lingji.finance.common.PageResult;
import com.lingji.finance.common.Result;
import com.lingji.finance.dto.TransactionCreateDTO;
import com.lingji.finance.dto.TransactionPageQuery;
import com.lingji.finance.dto.TransactionUpdateDTO;
import com.lingji.finance.service.TransactionService;
import com.lingji.finance.vo.CategoryStatVO;
import com.lingji.finance.vo.TransactionVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 交易流水控制器。
 *
 * @author LingJi
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * 创建一笔交易。
     */
    @PostMapping
    public Result<TransactionVO> create(@RequestParam Long userId,
                                        @Valid @RequestBody TransactionCreateDTO dto) {
        return Result.ok(transactionService.create(userId, dto));
    }

    /**
     * 更新交易。
     */
    @PutMapping
    public Result<TransactionVO> update(@RequestParam Long userId,
                                        @Valid @RequestBody TransactionUpdateDTO dto) {
        return Result.ok(transactionService.update(userId, dto));
    }

    /**
     * 删除交易（逻辑删除）。
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@RequestParam Long userId, @PathVariable Long id) {
        transactionService.delete(userId, id);
        return Result.ok();
    }

    /**
     * 查询单条交易。
     */
    @GetMapping("/{id}")
    public Result<TransactionVO> getById(@RequestParam Long userId, @PathVariable Long id) {
        return Result.ok(transactionService.getById(userId, id));
    }

    /**
     * 分页查询交易。
     */
    @GetMapping
    public Result<PageResult<TransactionVO>> page(@Valid TransactionPageQuery query) {
        return Result.ok(transactionService.page(query));
    }

    /**
     * 按分类统计（饼图数据）。
     */
    @GetMapping("/stats/category")
    public Result<List<CategoryStatVO>> statByCategory(@RequestParam Long userId,
                                                        @RequestParam(required = false) Integer year,
                                                        @RequestParam(required = false) Integer month) {
        return Result.ok(transactionService.statByCategory(userId, year, month));
    }
}
