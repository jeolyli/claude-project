package com.lingji.finance.service;

import com.lingji.finance.vo.CategoryVO;

import java.util.List;

/**
 * 分类服务接口。
 *
 * @author LingJi
 */
public interface CategoryService {

    /**
     * 获取所有分类（树形结构，含子分类）。
     *
     * @param type 分类类型：expense / income，传 null 查全部
     * @return 树形分类列表
     */
    List<CategoryVO> listTree(String type);

    /**
     * 根据ID获取分类。
     */
    CategoryVO getById(Long id);
}
