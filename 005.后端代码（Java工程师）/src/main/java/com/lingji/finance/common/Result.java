package com.lingji.finance.common;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 统一响应结果包装类
 *
 * @param <T> 数据类型
 */
@Data
@NoArgsConstructor
public class Result<T> {

    /** 状态码 */
    private int code;
    /** 提示信息 */
    private String message;
    /** 数据 */
    private T data;

    private Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    // ======================== 成功 ========================

    public static <T> Result<T> ok() {
        return new Result<>(200, "success", null);
    }

    public static <T> Result<T> ok(T data) {
        return new Result<>(200, "success", data);
    }

    public static <T> Result<T> ok(String message, T data) {
        return new Result<>(200, message, data);
    }

    // ======================== 失败 ========================

    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, message, null);
    }

    public static <T> Result<T> error(String message) {
        return new Result<>(500, message, null);
    }

    // ======================== 常用快捷方法 ========================

    public static <T> Result<T> badRequest(String message) {
        return new Result<>(400, message, null);
    }

    public static <T> Result<T> notFound(String message) {
        return new Result<>(404, message, null);
    }
}
