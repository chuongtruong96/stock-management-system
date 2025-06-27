package com.example.stationerymgntbe.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded product images
        registry.addResourceHandler("/assets/prod/**")
                .addResourceLocations("file:" + uploadDir + "/product-img/")
                .setCachePeriod(3600); // Cache for 1 hour
        
        // Serve category icons
        registry.addResourceHandler("/icons/**")
                .addResourceLocations("file:" + uploadDir + "/cat-icons/")
                .setCachePeriod(3600); // Cache for 1 hour
        
        // Serve other static assets if needed
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCachePeriod(3600);
    }
}