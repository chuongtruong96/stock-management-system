# ---- Build Stage ----
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# ---- Run Stage ----
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/stationery-mgnt-be-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
