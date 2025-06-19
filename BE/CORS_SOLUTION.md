# CORS Configuration Guide for Backend

## 🚨 **Current Issue**
The frontend (React app on `http://localhost:3000`) cannot communicate with the backend API (`http://localhost:8082`) due to CORS (Cross-Origin Resource Sharing) restrictions.

## 🔧 **Backend Solutions**

### **Option 1: Spring Boot CORS Configuration (Recommended)**

Add this configuration to your Spring Boot backend:

```java
@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                    "https://your-production-domain.com"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### **Option 2: Global CORS with @CrossOrigin**

Add to your main application class:

```java
@SpringBootApplication
public class StationeryManagementApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(StationeryManagementApplication.class, args);
    }
    
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("http://127.0.0.1:3000");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        
        return new CorsFilter(source);
    }
}
```

### **Option 3: Controller-Level CORS**

Add to each controller:

```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class YourController {
    // Your controller methods
}
```

### **Option 4: Application Properties**

Add to `application.properties` or `application.yml`:

```properties
# application.properties
spring.web.cors.allowed-origins=http://localhost:3000,http://127.0.0.1:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
spring.web.cors.max-age=3600
```

Or in `application.yml`:

```yaml
spring:
  web:
    cors:
      allowed-origins:
        - http://localhost:3000
        - http://127.0.0.1:3000
      allowed-methods:
        - GET
        - POST
        - PUT
        - DELETE
        - OPTIONS
        - PATCH
      allowed-headers: "*"
      allow-credentials: true
      max-age: 3600
```

## 🛠️ **Frontend Solutions (Already Implemented)**

### **1. Proxy Configuration**
- Added `"proxy": "http://localhost:8082"` to `package.json`
- Changed API baseURL from `http://localhost:8082/api` to `/api`

### **2. Removed Custom Headers**
- Commented out `X-Request-ID` header that was causing CORS preflight failures

## 🔍 **Testing the Solution**

1. **Implement one of the backend CORS configurations above**
2. **Restart your Spring Boot backend**
3. **Restart the React frontend** (`npm start`)
4. **Check browser console** - CORS errors should be resolved

## 📋 **Production Considerations**

### **Security Best Practices:**

```java
@Configuration
public class ProductionCorsConfig implements WebMvcConfigurer {
    
    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins) // From environment variables
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders(
                    "Authorization",
                    "Content-Type",
                    "X-Requested-With",
                    "Accept",
                    "Origin",
                    "Access-Control-Request-Method",
                    "Access-Control-Request-Headers"
                )
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### **Environment-Specific Configuration:**

```properties
# application-dev.properties
app.cors.allowed-origins=http://localhost:3000,http://127.0.0.1:3000

# application-prod.properties
app.cors.allowed-origins=https://your-production-domain.com,https://www.your-production-domain.com
```

## 🚀 **Quick Fix for Development**

If you need an immediate solution, add this annotation to your main controller:

```java
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class MainController {
    // Your endpoints
}
```

**⚠️ Warning:** `origins = "*"` should only be used in development!

## 📞 **Need Help?**

If you're still experiencing issues after implementing these solutions:

1. Check that your backend is running on `http://localhost:8082`
2. Verify the CORS configuration is properly loaded
3. Check browser network tab for preflight OPTIONS requests
4. Ensure no firewall is blocking the requests

The frontend proxy configuration will handle the CORS issues during development, but proper backend CORS configuration is essential for production deployment.