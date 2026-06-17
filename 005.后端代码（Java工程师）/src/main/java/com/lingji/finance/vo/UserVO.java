package com.lingji.finance.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 用户视图对象（不包含密码等敏感字段）。
 *
 * @author LingJi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserVO {

    private Long id;
    private String username;
    private String nickname;
    private String avatarUrl;
    private String email;
    private String phone;
    private LocalDateTime createdAt;
}
