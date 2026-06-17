package com.lingji.finance.exception;

/**
 * 资源不存在异常（HTTP 404 语义）。
 *
 * @author LingJi
 */
public class NotFoundException extends BusinessException {

    public NotFoundException(String message) {
        super(404, message);
    }
}
