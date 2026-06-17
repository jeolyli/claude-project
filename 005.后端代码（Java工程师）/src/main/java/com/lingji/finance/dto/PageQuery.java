package com.lingji.finance.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

/**
 * 分页查询参数基类。
 *
 * @author LingJi
 */
@Data
public class PageQuery {

    @Min(value = 1, message = "页码最小为1")
    private Integer page = 1;

    @Min(value = 1, message = "每页最少1条")
    @Max(value = 100, message = "每页最多100条")
    private Integer pageSize = 20;
}
