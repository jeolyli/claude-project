package com.lingji.finance.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.lingji.finance.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 用户实体
 *
 * @author LingJi
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("user")
public class User extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户名 */
    private String username;

    /** 密码（BCrypt 加密） */
    private String password;

    /** 昵称 */
    private String nickname;

    /** 头像 URL */
    private String avatarUrl;

    /** 邮箱 */
    private String email;

    /** 手机号 */
    private String phone;

    /** 状态：1启用 0禁用 */
    private Integer status;
}
