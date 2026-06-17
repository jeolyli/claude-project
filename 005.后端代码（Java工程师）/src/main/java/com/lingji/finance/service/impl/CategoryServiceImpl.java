package com.lingji.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.lingji.finance.converter.CategoryConverter;
import com.lingji.finance.entity.Category;
import com.lingji.finance.exception.NotFoundException;
import com.lingji.finance.mapper.CategoryMapper;
import com.lingji.finance.service.CategoryService;
import com.lingji.finance.vo.CategoryVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 分类服务实现。
 *
 * @author LingJi
 */
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryMapper categoryMapper;

    @Override
    public List<CategoryVO> listTree(String type) {
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Category::getIsActive, 1);
        if (type != null && !type.isBlank()) {
            wrapper.and(w -> w.eq(Category::getType, type)
                    .or().eq(Category::getType, "both"));
        }
        wrapper.orderByAsc(Category::getParentId)
               .orderByAsc(Category::getSortOrder);

        List<Category> all = categoryMapper.selectList(wrapper);

        // 处理 parentId=null 的情况做排序
        return CategoryConverter.toTree(all);
    }

    @Override
    public CategoryVO getById(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new NotFoundException("分类不存在");
        }
        return CategoryConverter.toVO(category);
    }
}
