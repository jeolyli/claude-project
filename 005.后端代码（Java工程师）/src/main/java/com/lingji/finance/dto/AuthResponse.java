package com.lingji.finance.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 认证响应 —— 匹配前端 login.html 期望的 JSON 格式：
 * <pre>{@code
 * {
 *   "success": true,
 *   "user": { "id": "...", "username": "...", "avatar": null },
 *   "token": "jwt..."
 * }
 * }</pre>
 *
 * @author LingJi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    private boolean success;
    private UserInfo user;
    private String token;
    private String error;

    // ===== 成功快捷方法 =====

    public static AuthResponse ok(Long id, String username, String avatar, String token) {
        return AuthResponse.builder()
                .success(true)
                .user(new UserInfo(String.valueOf(id), username, avatar))
                .token(token)
                .build();
    }

    // ===== 失败快捷方法 =====

    public static AuthResponse fail(String error) {
        return AuthResponse.builder()
                .success(false)
                .error(error)
                .build();
    }

    // ===== 内嵌用户信息 =====

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String id;
        private String username;
        private String avatar;
    }
}
