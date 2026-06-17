package com.lingji.finance.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT 工具类 —— 令牌生成与校验。
 *
 * @author LingJi
 */
@Component
public class JwtUtils {

    private final SecretKey key;
    private final long expirationMs;

    public JwtUtils(@Value("${lingji.jwt.secret:lingji_jwt_secret_change_me_in_production}") String secret,
                    @Value("${lingji.jwt.expiration:604800000}") long expirationMs) {
        // 确保密钥长度 ≥ 256 bits（HMAC-SHA256 要求）
        String padded = secret.length() >= 32 ? secret : secret + secret.repeat(32 / secret.length() + 1);
        this.key = Keys.hmacShaKeyFor(padded.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    /**
     * 生成 Token。
     */
    public String generate(Long userId, String username) {
        Date now = new Date();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("username", username)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(key)
                .compact();
    }

    /**
     * 从 Token 中解析用户 ID。
     */
    public Long getUserId(String token) {
        Claims claims = parse(token);
        return Long.valueOf(claims.getSubject());
    }

    /**
     * 校验 Token 是否有效。
     */
    public boolean validate(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
