package com.example.stationerymgntbe.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Database migration component to handle user table schema updates
 * This runs after the application context is loaded but before the application is ready
 */
@Slf4j
@Component
@Order(1) // Run early in the startup process
@RequiredArgsConstructor
public class DatabaseMigrationConfig implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("Starting user table migration checks...");
        
        try {
            // Check and add active column to users table
            addActiveColumnIfNotExists();
            
            // Remove deprecated columns from users table
            removeDeprecatedColumns();
            
            // Update existing users to be active
            updateExistingUsersToActive();
            
            log.info("User table migration completed successfully!");
            
        } catch (Exception e) {
            log.error("User table migration failed: {}", e.getMessage(), e);
            // Don't throw exception to prevent application startup failure
        }
    }

    private void addActiveColumnIfNotExists() {
        try {
            // Check if active column exists
            String checkColumnSql = """
                SELECT COUNT(*) FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'active'
                """;
            
            Integer columnExists = jdbcTemplate.queryForObject(checkColumnSql, Integer.class);
            
            if (columnExists == null || columnExists == 0) {
                log.info("Adding 'active' column to users table...");
                
                String addColumnSql = "ALTER TABLE users ADD COLUMN active BOOLEAN NOT NULL DEFAULT true";
                jdbcTemplate.execute(addColumnSql);
                
                log.info("Successfully added 'active' column to users table");
            } else {
                log.info("'active' column already exists in users table");
            }
            
        } catch (Exception e) {
            log.warn("Failed to add active column: {}", e.getMessage());
        }
    }

    private void removeDeprecatedColumns() {
        // List of deprecated column names to remove
        String[] deprecatedColumns = {
            "full_name", "fullname", "fullName",
            "phone_number", "phonenumber", "phoneNumber"
        };
        
        for (String columnName : deprecatedColumns) {
            try {
                // Check if column exists
                String checkColumnSql = """
                    SELECT COUNT(*) FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = ?
                    """;
                
                Integer columnExists = jdbcTemplate.queryForObject(checkColumnSql, Integer.class, columnName);
                
                if (columnExists != null && columnExists > 0) {
                    log.info("Removing deprecated column '{}' from users table...", columnName);
                    
                    // Use quoted identifier for camelCase columns
                    String quotedColumnName = columnName.matches(".*[A-Z].*") ? "\"" + columnName + "\"" : columnName;
                    String dropColumnSql = "ALTER TABLE users DROP COLUMN IF EXISTS " + quotedColumnName;
                    
                    jdbcTemplate.execute(dropColumnSql);
                    log.info("Successfully removed deprecated column '{}'", columnName);
                }
                
            } catch (Exception e) {
                log.warn("Failed to remove deprecated column '{}': {}", columnName, e.getMessage());
            }
        }
    }

    private void updateExistingUsersToActive() {
        try {
            log.info("Updating existing users to be active...");
            
            String updateSql = "UPDATE users SET active = true WHERE active IS NULL";
            int updatedRows = jdbcTemplate.update(updateSql);
            
            if (updatedRows > 0) {
                log.info("Updated {} users to be active", updatedRows);
            } else {
                log.info("All users already have active status set");
            }
            
        } catch (Exception e) {
            log.warn("Failed to update existing users: {}", e.getMessage());
        }
    }
}