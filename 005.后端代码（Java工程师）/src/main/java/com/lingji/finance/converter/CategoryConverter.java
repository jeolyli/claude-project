package com.lingji.finance.converter;

import com.lingji.finance.entity.Category;
import com.lingji.finance.vo.CategoryVO;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Category 对象转换器。
 *
 * @author LingJi
 */
public final class CategoryConverter {

    private CategoryConverter() {
    }

    /**
     * Entity → VO
     */
    public static CategoryVO toVO(Category entity) {
        return CategoryVO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .icon(entity.getIcon())
                .color(entity.getColor())
                .type(entity.getType())
                .sortOrder(entity.getSortOrder())
                .isPreset(entity.getIsPreset() != null && entity.getIsPreset() == 1)
                .isActive(entity.getIsActive() != null && entity.getIsActive() == 1)
                .children(Collections.emptyList())
                .build();
    }

    /**
     * 将分类列表构建为树形结构（一级分类 → 子分类）。
     */
    public static List<CategoryVO> toTree(List<Category> allCategories) {
        // 一级分类
        List<Category> roots = allCategories.stream()
                .filter(c -> c.getParentId() == null)
                .toList();

        // 按 parent_id 分组子分类
        Map<Long, List<Category>> childrenMap = allCategories.stream()
                .filter(c -> c.getParentId() != null)
                .collect(Collectors.groupingBy(Category::getParentId));

        return roots.stream()
                .map(root -> {
                    CategoryVO vo = toVO(root);
                    List<Category> children = childrenMap.getOrDefault(root.getId(), Collections.emptyList());
                    vo.setChildren(children.stream()
                            .map(CategoryConverter::toVO)
                            .collect(Collectors.toList()));
                    return vo;
                })
                .collect(Collectors.toList());
    }
}
