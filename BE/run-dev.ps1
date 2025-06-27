# PowerShell script to run Spring Boot with environment variables
Write-Host "Setting up development environment variables..." -ForegroundColor Green

$env:APP_NAME = "stationery-mgnt-be"
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/stationery-mgnt-be"
$env:SPRING_DATASOURCE_USERNAME = "postgres"
$env:SPRING_DATASOURCE_PASSWORD = "password"
$env:JWT_SECRET = "mySecretKey123456789012345678901234567890123456789012345678901234567890"
$env:JWT_EXPIRATION = "86400000"
$env:MAIL_HOST = "smtp.gmail.com"
$env:MAIL_PORT = "587"
$env:SPRING_MAIL_USERNAME = ""
$env:SPRING_MAIL_PASSWORD = ""
$env:MAX_FILE_SIZE = "10MB"
$env:MAX_REQUEST_SIZE = "10MB"
$env:UPLOAD_DIR = "uploads"
$env:CORS_ALLOWED_ORIGINS = "http://localhost:3000,http://localhost:8080"

Write-Host "Starting Spring Boot application..." -ForegroundColor Green
mvn spring-boot:run