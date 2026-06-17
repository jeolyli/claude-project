package com.lingji.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.lingji.finance.converter.UserConverter;
import com.lingji.finance.dto.UserLoginDTO;
import com.lingji.finance.dto.UserRegisterDTO;
import com.lingji.finance.entity.User;
import com.lingji.finance.exception.BusinessException;
import com.lingji.finance.mapper.UserMapper;
import com.lingji.finance.service.UserService;
import com.lingji.finance.vo.UserVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 用户服务实现。
 *
 * @author LingJi
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserVO register(UserRegisterDTO dto) {
        // 1. 检查用户名唯一
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, dto.getUsername());
        if (userMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("用户名已被注册");
        }

        // 2. 创建用户
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setNickname(dto.getNickname() != null ? dto.getNickname() : dto.getUsername());
        user.setStatus(1);
        userMapper.insert(user);

        log.info("用户注册成功: username={}, id={}", dto.getUsername(), user.getId());
        return UserConverter.toVO(user);
    }

    @Override
    public UserVO login(UserLoginDTO dto) {
        // 1. 查找用户
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, dto.getUsername());
        User user = userMapper.selectOne(wrapper);
        if (user == null) {
            throw new BusinessException("用户名或密码错误");
        }

        // 2. 状态检查
        if (user.getStatus() == 0) {
            throw new BusinessException("账号已被禁用");
        }

        // 3. 密码验证
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        log.info("用户登录成功: username={}, id={}", dto.getUsername(), user.getId());
        return UserConverter.toVO(user);
    }
}
