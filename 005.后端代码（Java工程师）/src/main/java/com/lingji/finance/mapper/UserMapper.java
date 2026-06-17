package com.lingji.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lingji.finance.entity.User;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户 Mapper。
 *
 * @author LingJi
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
}
