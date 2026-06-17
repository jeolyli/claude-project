package com.lingji.finance;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 灵记（LingJi）财务管理服务 — 启动类
 *
 * @author LingJi
 */
@SpringBootApplication
@MapperScan("com.lingji.finance.mapper")
public class LingJiFinanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(LingJiFinanceApplication.class, args);
    }
}
