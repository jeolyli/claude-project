package com.lingji.finance.controller;

import com.lingji.finance.dto.DataSyncDTO;
import com.lingji.finance.service.DataSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 数据同步控制器 —— 前端 localStorage 与后端 MySQL 的桥梁。
 * <p>
 * 前端可通过这两个接口实现数据的上传和下载，
 * 数据格式与 storage.js 的 getUserData() 保持一致。
 *
 * @author LingJi
 */
@Slf4j
@RestController
@RequestMapping("/api/data")
@RequiredArgsConstructor
public class DataController {

    private final DataSyncService dataSyncService;

    /**
     * 拉取用户数据（localStorage 格式）。
     * <pre>
     * GET /api/data?userId=1
     * → { transactions: [...], categories: [...], budget: {...}, recurringBills: [] }
     * </pre>
     */
    @GetMapping
    public DataSyncDTO pull(@RequestParam Long userId) {
        log.info("数据拉取: userId={}", userId);
        return dataSyncService.exportToFrontend(userId);
    }

    /**
     * 推送用户数据到 MySQL。
     * <pre>
     * POST /api/data/sync?userId=1
     * Body: { transactions: [...], budget: {...} }
     * </pre>
     */
    @PostMapping("/sync")
    public Map<String, Object> push(@RequestParam Long userId,
                                     @RequestBody DataSyncDTO dto) {
        log.info("数据推送: userId={}, transactions={}", userId,
                dto.getTransactions() != null ? dto.getTransactions().size() : 0);
        dataSyncService.importFromFrontend(userId, dto);
        return Map.of("success", true, "message", "数据同步完成");
    }
}
