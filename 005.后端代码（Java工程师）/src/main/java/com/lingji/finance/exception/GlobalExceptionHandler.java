package com.lingji.finance.exception;

import com.lingji.finance.common.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * 全局异常处理器。
 * <p>
 * Controller 层无需自行 try-catch，所有异常由此统一拦截。
 *
 * @author LingJi
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 参数校验失败（@Valid）。
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.OK)
    public Result<Void> handleValidation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        log.warn("参数校验失败: {}", msg);
        return Result.badRequest(msg);
    }

    /**
     * 业务异常。
     */
    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.OK)
    public Result<Void> handleBusiness(BusinessException e) {
        log.warn("业务异常: code={}, message={}", e.getCode(), e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 未知异常（兜底）。
     * 生产环境不要返回堆栈信息给前端。
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.OK)
    public Result<Void> handleUnknown(Exception e) {
        log.error("未知系统异常", e);
        return Result.error("系统繁忙，请稍后重试");
    }
}
