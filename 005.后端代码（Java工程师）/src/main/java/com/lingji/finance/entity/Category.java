package com.lingji.finance.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.lingji.finance.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 分类实体。
 * <p>
 * parent_id 为 NULL 表示一级分类，非 NULL 表示二级子分类。
 * type 字段区分适用场景：expense（支出）/ income（收入）/ both（通用）。
 *
 * @author LingJi
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("category")
public class Category extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户ID（NULL = 系统预设分类，非NULL = 用户自定义分类） */
    private Long userId;

    /** 分类名称 */
    private String name;

    /** 图标标识（Lucide 图标名） */
    private String icon;

    /** 分类专属色（HEX 格式） */
    private String color;

    /** 适用类型：expense / income / both */
    private String type;

    /** 父分类ID（NULL = 一级分类） */
    private Long parentId;

    /** 排序值（越小越靠前） */
    private Integer sortOrder;

    /** 是否预设分类：1是 0否 */
    private Integer isPreset;

    /** 是否启用：1启用 0禁用 */
    private Integer isActive;
}
