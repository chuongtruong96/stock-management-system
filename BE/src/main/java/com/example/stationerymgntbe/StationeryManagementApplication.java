package com.example.stationerymgntbe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StationeryManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(StationeryManagementApplication.class, args);
    }
}
