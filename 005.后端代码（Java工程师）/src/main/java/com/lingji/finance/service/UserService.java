package com.lingji.finance.service;

import com.lingji.finance.dto.UserLoginDTO;
import com.lingji.finance.dto.UserRegisterDTO;
import com.lingji.finance.vo.UserVO;

/**
 * 用户服务接口。
 *
 * @author LingJi
 */
public interface UserService {

    /**
     * 用户注册。
     */
    UserVO register(UserRegisterDTO dto);

    /**
     * 用户登录。
     */
    UserVO login(UserLoginDTO dto);
}
