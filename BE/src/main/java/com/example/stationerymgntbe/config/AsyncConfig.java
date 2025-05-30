// src/main/java/com/example/stationerymgntbe/config/AsyncConfig.java
package com.example.stationerymgntbe.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {
    // Bật @Async cho cả project
}
