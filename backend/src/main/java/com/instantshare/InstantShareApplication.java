package com.instantshare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

@SpringBootApplication
@EnableScheduling
public class InstantShareApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(InstantShareApplication.class, args);
    }

    /**
     * Automatically loads .env file properties into System properties on startup
     * so that Spring Boot can resolve ${MYSQL_DB_URL}, ${MYSQL_DB_PASSWORD}, etc.
     * without needing external plugins or manual export commands.
     */
    private static void loadDotEnv() {
        File envFile = new File(".env");
        if (!envFile.exists()) {
            envFile = new File("../.env");
        }
        if (!envFile.exists()) {
            System.out.println("[InstantShare] No .env file found at " + envFile.getAbsolutePath() + ", using default application.yml / environment variables");
            return;
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
            String line;
            int loadedCount = 0;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                    continue;
                }
                int idx = line.indexOf('=');
                String key = line.substring(0, idx).trim();
                String value = line.substring(idx + 1).trim();

                // Strip surrounding single or double quotes
                if ((value.startsWith("\"") && value.endsWith("\"")) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length() - 1);
                }

                // Set as System property if not already explicitly provided via command line -D or OS env
                if (System.getProperty(key) == null && System.getenv(key) == null) {
                    System.setProperty(key, value);
                    loadedCount++;
                }
            }
            System.out.println("[InstantShare] Successfully loaded " + loadedCount + " environment variables from " + envFile.getAbsolutePath());
        } catch (IOException e) {
            System.err.println("[InstantShare] Could not read .env file: " + e.getMessage());
        }
    }
}
