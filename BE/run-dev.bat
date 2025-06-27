@echo off
echo Setting up development environment variables...

set APP_NAME=stationery-mgnt-be
set SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/stationery-mgnt-be
set SPRING_DATASOURCE_USERNAME=postgres
set SPRING_DATASOURCE_PASSWORD=password
set JWT_SECRET=mySecretKey123456789012345678901234567890123456789012345678901234567890
set JWT_EXPIRATION=86400000
set MAIL_HOST=smtp.gmail.com
set MAIL_PORT=587
set SPRING_MAIL_USERNAME=
set SPRING_MAIL_PASSWORD=
set MAX_FILE_SIZE=10MB
set MAX_REQUEST_SIZE=10MB
set UPLOAD_DIR=uploads
set CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

echo Starting Spring Boot application...
mvn spring-boot:run