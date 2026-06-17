package com.lingji.finance.controller;

import com.lingji.finance.common.Result;
import com.lingji.finance.dto.UserLoginDTO;
import com.lingji.finance.dto.UserRegisterDTO;
import com.lingji.finance.service.UserService;
import com.lingji.finance.vo.UserVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 用户控制器。
 *
 * @author LingJi
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 用户注册。
     */
    @PostMapping("/register")
    public Result<UserVO> register(@Valid @RequestBody UserRegisterDTO dto) {
        return Result.ok(userService.register(dto));
    }

    /**
     * 用户登录。
     */
    @PostMapping("/login")
    public Result<UserVO> login(@Valid @RequestBody UserLoginDTO dto) {
        return Result.ok(userService.login(dto));
    }
}
