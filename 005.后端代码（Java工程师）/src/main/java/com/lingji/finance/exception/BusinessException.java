package com.lingji.finance.exception;

import lombok.Getter;

/**
 * 业务异常基类。
 * <p>
 * 所有已知业务异常均应抛出此类或其子类，
 * 由 {@code GlobalExceptionHandler} 统一拦截并返回友好提示。
 *
 * @author LingJi
 */
@Getter
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(String message) {
        super(message);
        this.code = 500;
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
}
