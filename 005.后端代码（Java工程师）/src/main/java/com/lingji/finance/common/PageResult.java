package com.lingji.finance.common;

import com.baomidou.mybatisplus.core.metadata.IPage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

/**
 * 分页响应结果。
 *
 * @param <T> 列表元素类型
 * @author LingJi
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResult<T> {

    /** 当前页数据 */
    private List<T> records;
    /** 总条数 */
    private Long total;
    /** 当前页码 */
    private Integer page;
    /** 每页条数 */
    private Integer pageSize;

    /**
     * 从 MyBatis-Plus 分页对象构建。
     */
    public static <T> PageResult<T> from(IPage<T> page) {
        return new PageResult<>(
                page.getRecords(),
                page.getTotal(),
                (int) page.getCurrent(),
                (int) page.getSize()
        );
    }

    /**
     * 空分页结果。
     */
    @SuppressWarnings("unchecked")
    public static <T> PageResult<T> empty(int page, int pageSize) {
        return new PageResult<>(Collections.EMPTY_LIST, 0L, page, pageSize);
    }
}
