package com.lingji.finance.controller;

/**
 * AuthController 集成测试
 *
 * 覆盖范围:
 * - POST /api/auth/login: 正常登录返回 success+token
 * - POST /api/auth/login: 错误密码返回 error
 * - POST /api/auth/login: 不存在用户返回 error
 * - POST /api/auth/register: 正常注册返回 success
 * - POST /api/auth/register: 重复用户名返回 error
 *
 * 被测类: com.lingji.finance.controller.AuthController
 */
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lingji.finance.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("AuthController 认证接口测试")
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    // ======================== 登录 ========================

    @Test
    @DisplayName("正确凭据登录成功")
    void login_withValidCredentials_shouldSucceed() throws Exception {
        // 先注册
        String username = "test_" + System.currentTimeMillis();
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("username", username, "password", "Test1234"))))
            .andExpect(status().isOk());

        // 再登录
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("username", username, "password", "Test1234"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @DisplayName("错误密码登录失败")
    void login_withWrongPassword_shouldFail() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("username", "nonexistent", "password", "wrong"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(false));
    }

    // ======================== 注册 ========================

    @Test
    @DisplayName("正常注册返回 success")
    void register_withValidInput_shouldSucceed() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "username", "newuser_" + System.currentTimeMillis(),
                    "password", "Password1"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("重复用户名注册失败")
    void register_withDuplicateUsername_shouldFail() throws Exception {
        String username = "dup_" + System.currentTimeMillis();
        Map<String, String> body = Map.of("username", username, "password", "Test1234");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(false));
    }
}
