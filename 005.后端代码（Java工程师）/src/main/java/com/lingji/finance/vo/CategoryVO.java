package com.lingji.finance.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 分类视图对象（含子分类树形结构）。
 *
 * @author LingJi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryVO {

    private Long id;
    /** 分类名称 */
    private String name;
    /** 图标标识 */
    private String icon;
    /** 分类颜色 */
    private String color;
    /** 类型：expense / income / both */
    private String type;
    /** 排序 */
    private Integer sortOrder;
    /** 是否预设 */
    private Boolean isPreset;
    /** 是否启用 */
    private Boolean isActive;
    /** 子分类列表 */
    private List<CategoryVO> children;
}
