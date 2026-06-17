package com.lingji.finance.controller;

import com.lingji.finance.common.Result;
import com.lingji.finance.service.CategoryService;
import com.lingji.finance.vo.CategoryVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 分类控制器。
 *
 * @author LingJi
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * 获取分类列表（树形结构）。
     *
     * @param type 分类类型：expense / income，不传则返回全部
     */
    @GetMapping
    public Result<List<CategoryVO>> list(@RequestParam(required = false) String type) {
        return Result.ok(categoryService.listTree(type));
    }
}
