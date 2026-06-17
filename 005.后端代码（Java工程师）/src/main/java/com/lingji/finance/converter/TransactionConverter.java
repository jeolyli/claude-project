package com.lingji.finance.converter;

import com.lingji.finance.dto.TransactionCreateDTO;
import com.lingji.finance.entity.Category;
import com.lingji.finance.entity.Transaction;
import com.lingji.finance.vo.TransactionVO;

import java.util.Optional;

/**
 * Transaction 对象转换器。
 * <p>
 * 负责 Entity ↔ VO ↔ DTO 之间的字段映射。
 *
 * @author LingJi
 */
public final class TransactionConverter {

    private TransactionConverter() {
        // 工具类禁止实例化
    }

    /**
     * DTO → Entity（创建场景）
     */
    public static Transaction toEntity(TransactionCreateDTO dto, Long userId) {
        Transaction entity = new Transaction();
        entity.setUserId(userId);
        entity.setType(dto.getType());
        entity.setAmount(dto.getAmount());
        entity.setCategoryId(dto.getCategoryId());
        entity.setSubCategoryId(dto.getSubCategoryId());
        entity.setDate(dto.getDate());
        entity.setNote(Optional.ofNullable(dto.getNote()).orElse(""));
        return entity;
    }

    /**
     * Entity → VO（含分类信息）
     */
    public static TransactionVO toVO(Transaction entity,
                                     Category category,
                                     Category subCategory) {
        return TransactionVO.builder()
                .id(entity.getId())
                .type(entity.getType())
                .amount(entity.getAmount())
                .categoryId(entity.getCategoryId())
                .categoryName(category != null ? category.getName() : null)
                .categoryIcon(category != null ? category.getIcon() : null)
                .categoryColor(category != null ? category.getColor() : null)
                .subCategoryId(entity.getSubCategoryId())
                .subCategoryName(subCategory != null ? subCategory.getName() : null)
                .date(entity.getDate())
                .note(entity.getNote())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
