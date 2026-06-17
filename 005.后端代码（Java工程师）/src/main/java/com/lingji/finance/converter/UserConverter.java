package com.lingji.finance.converter;

import com.lingji.finance.entity.User;
import com.lingji.finance.vo.UserVO;

/**
 * User 对象转换器。
 *
 * @author LingJi
 */
public final class UserConverter {

    private UserConverter() {
    }

    /**
     * Entity → VO（脱敏，不含密码）。
     */
    public static UserVO toVO(User user) {
        return UserVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .avatarUrl(user.getAvatarUrl())
                .email(user.getEmail())
                .phone(user.getPhone())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
