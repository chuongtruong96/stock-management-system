# Use an official OpenJDK runtime as a parent image
FROM openjdk:17-jdk-slim

# Set environment variable for jar location
ARG JAR_FILE=target/stationery-mgnt-be-0.0.1-SNAPSHOT.jar

# Set working directory
WORKDIR /app

# Copy the built jar file into the container
COPY ${JAR_FILE} app.jar

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
