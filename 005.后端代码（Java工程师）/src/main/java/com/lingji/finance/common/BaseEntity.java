package com.lingji.finance.common;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 实体基类 —— 提取公共字段。
 * <p>
 * 所有数据库实体均应继承此类，统一管理：
 * <ul>
 *   <li>逻辑删除（deleted）</li>
 *   <li>创建时间（created_at）</li>
 *   <li>更新时间（updated_at）</li>
 * </ul>
 *
 * @author LingJi
 */
@Data
public abstract class BaseEntity implements Serializable {

    /** 逻辑删除：0未删除 1已删除 */
    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;

    /** 创建时间 */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /** 更新时间 */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
