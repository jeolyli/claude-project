package com.lingji.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lingji.finance.common.PageResult;
import com.lingji.finance.converter.TransactionConverter;
import com.lingji.finance.dto.TransactionCreateDTO;
import com.lingji.finance.dto.TransactionPageQuery;
import com.lingji.finance.dto.TransactionUpdateDTO;
import com.lingji.finance.entity.Category;
import com.lingji.finance.entity.Transaction;
import com.lingji.finance.exception.BusinessException;
import com.lingji.finance.exception.NotFoundException;
import com.lingji.finance.mapper.CategoryMapper;
import com.lingji.finance.mapper.TransactionMapper;
import com.lingji.finance.service.TransactionService;
import com.lingji.finance.vo.CategoryStatVO;
import com.lingji.finance.vo.TransactionVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 交易流水服务实现。
 *
 * @author LingJi
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionMapper transactionMapper;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TransactionVO create(Long userId, TransactionCreateDTO dto) {
        // 1. 校验分类存在
        Category category = categoryMapper.selectById(dto.getCategoryId());
        if (category == null) {
            throw new NotFoundException("分类不存在");
        }
        if (dto.getSubCategoryId() != null) {
            Category sub = categoryMapper.selectById(dto.getSubCategoryId());
            if (sub == null || sub.getParentId() == null
                    || !sub.getParentId().equals(dto.getCategoryId())) {
                throw new BusinessException("子分类不合法");
            }
        }

        // 2. DTO → Entity
        Transaction entity = TransactionConverter.toEntity(dto, userId);

        // 3. 入库
        transactionMapper.insert(entity);
        log.info("创建交易流水: userId={}, id={}, amount={}, categoryId={}",
                userId, entity.getId(), entity.getAmount(), entity.getCategoryId());

        // 4. 返回 VO（含分类名）
        return TransactionConverter.toVO(entity, category,
                dto.getSubCategoryId() != null
                        ? categoryMapper.selectById(dto.getSubCategoryId()) : null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TransactionVO update(Long userId, TransactionUpdateDTO dto) {
        Transaction entity = transactionMapper.selectById(dto.getId());
        if (entity == null || !entity.getUserId().equals(userId)) {
            throw new NotFoundException("交易记录不存在");
        }

        if (dto.getAmount() != null) {
            entity.setAmount(dto.getAmount());
        }
        if (dto.getCategoryId() != null) {
            entity.setCategoryId(dto.getCategoryId());
        }
        if (dto.getSubCategoryId() != null) {
            entity.setSubCategoryId(dto.getSubCategoryId());
        }
        if (dto.getDate() != null) {
            entity.setDate(dto.getDate());
        }
        if (dto.getNote() != null) {
            entity.setNote(dto.getNote());
        }

        transactionMapper.updateById(entity);

        Category category = categoryMapper.selectById(entity.getCategoryId());
        Category sub = entity.getSubCategoryId() != null
                ? categoryMapper.selectById(entity.getSubCategoryId()) : null;
        return TransactionConverter.toVO(entity, category, sub);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long userId, Long id) {
        Transaction entity = transactionMapper.selectById(id);
        if (entity == null || !entity.getUserId().equals(userId)) {
            throw new NotFoundException("交易记录不存在");
        }
        transactionMapper.deleteById(id);
        log.info("删除交易流水: userId={}, id={}", userId, id);
    }

    @Override
    public TransactionVO getById(Long userId, Long id) {
        Transaction entity = transactionMapper.selectById(id);
        if (entity == null || !entity.getUserId().equals(userId)) {
            throw new NotFoundException("交易记录不存在");
        }
        Category category = categoryMapper.selectById(entity.getCategoryId());
        Category sub = entity.getSubCategoryId() != null
                ? categoryMapper.selectById(entity.getSubCategoryId()) : null;
        return TransactionConverter.toVO(entity, category, sub);
    }

    @Override
    public PageResult<TransactionVO> page(TransactionPageQuery query) {
        LambdaQueryWrapper<Transaction> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Transaction::getUserId, query.getUserId());
        if (StringUtils.hasText(query.getType())) {
            wrapper.eq(Transaction::getType, query.getType());
        }
        if (query.getCategoryId() != null) {
            wrapper.eq(Transaction::getCategoryId, query.getCategoryId());
        }
        if (query.getStartDate() != null) {
            wrapper.ge(Transaction::getDate, query.getStartDate());
        }
        if (query.getEndDate() != null) {
            wrapper.le(Transaction::getDate, query.getEndDate());
        }
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(Transaction::getNote, query.getKeyword());
        }
        wrapper.orderByDesc(Transaction::getDate)
               .orderByDesc(Transaction::getCreatedAt);

        Page<Transaction> mpPage = transactionMapper.selectPage(
                new Page<>(query.getPage(), query.getPageSize()), wrapper);

        List<TransactionVO> voList = mpPage.getRecords().stream()
                .map(e -> {
                    Category c = categoryMapper.selectById(e.getCategoryId());
                    Category s = e.getSubCategoryId() != null
                            ? categoryMapper.selectById(e.getSubCategoryId()) : null;
                    return TransactionConverter.toVO(e, c, s);
                })
                .collect(Collectors.toList());

        return new PageResult<>(voList, mpPage.getTotal(),
                (int) mpPage.getCurrent(), (int) mpPage.getSize());
    }

    @Override
    public List<CategoryStatVO> statByCategory(Long userId, Integer year, Integer month) {
        LocalDate now = LocalDate.now();
        int y = year != null ? year : now.getYear();
        int m = month != null ? month : now.getMonthValue();
        return transactionMapper.statByCategoryAndMonth(userId, "expense", y, m);
    }
}
