package com.lingji.finance.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.lingji.finance.dto.AuthResponse;
import com.lingji.finance.entity.User;
import com.lingji.finance.mapper.UserMapper;
import com.lingji.finance.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 认证控制器 —— 兼容前端 login.html / register.html 的 API 格式。
 * <p>
 * 路径与 Node.js backend/routes/auth.js 保持一致：
 * <ul>
 *   <li>POST /api/auth/register</li>
 *   <li>POST /api/auth/login</li>
 *   <li>POST /api/auth/verify</li>
 * </ul>
 *
 * @author LingJi
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserMapper userMapper;
    private final JwtUtils jwtUtils;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ======================== 注册 ========================

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        // --- 参数校验（对齐 Node.js 规则）---
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(AuthResponse.fail("用户名和密码不能为空"));
        }
        username = username.trim();
        if (username.length() < 2 || username.length() > 20) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(AuthResponse.fail("用户名应为 2-20 个字符"));
        }
        if (username.matches("^\\d+$")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(AuthResponse.fail("用户名不能为纯数字"));
        }
        if (password.length() < 6 || password.length() > 20) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(AuthResponse.fail("密码应为 6-20 个字符"));
        }
        if (!password.matches(".*[a-zA-Z].*") || !password.matches(".*\\d.*")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(AuthResponse.fail("密码需包含字母和数字"));
        }

        // --- 检查用户名唯一 ---
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, username);
        if (userMapper.selectCount(wrapper) > 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(AuthResponse.fail("用户名已被注册"));
        }

        // --- 创建用户 ---
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setNickname(username);
        user.setStatus(1);
        userMapper.insert(user);

        String token = jwtUtils.generate(user.getId(), user.getUsername());
        log.info("用户注册成功: username={}, id={}", username, user.getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AuthResponse.ok(user.getId(), user.getUsername(), null, token));
    }

    // ======================== 登录 ========================

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        // --- 参数校验 ---
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(AuthResponse.fail("用户名和密码不能为空"));
        }

        // --- 查找用户 ---
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, username.trim());
        User user = userMapper.selectOne(wrapper);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponse.fail("用户名或密码错误"));
        }

        // --- 检查账户状态 ---
        if (user.getStatus() == null || user.getStatus() == 0) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(AuthResponse.fail("账户已被禁用，请联系管理员"));
        }

        // --- 验证密码 ---
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponse.fail("用户名或密码错误"));
        }

        String token = jwtUtils.generate(user.getId(), user.getUsername());
        log.info("用户登录成功: username={}, id={}", username, user.getId());

        return ResponseEntity.ok(
                AuthResponse.ok(user.getId(), user.getUsername(), null, token));
    }

    // ======================== Token 校验 ========================

    @PostMapping("/verify")
    public ResponseEntity<AuthResponse> verify(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponse.fail("Token 缺失"));
        }

        if (!jwtUtils.validate(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponse.fail("Token 无效或已过期"));
        }

        Long userId = jwtUtils.getUserId(token);
        User user = userMapper.selectById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponse.fail("用户不存在"));
        }

        return ResponseEntity.ok(
                AuthResponse.ok(user.getId(), user.getUsername(), null, null));
    }
}
