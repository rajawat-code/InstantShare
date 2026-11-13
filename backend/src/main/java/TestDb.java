import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;

public class TestDb {

    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("     InstantShare MySQL Connectivity Tester      ");
        System.out.println("=================================================");

        Map<String, String> env = loadDotEnv();

        String host = getPropOrEnv(env, "MYSQL_DB_HOST", "localhost");
        String port = getPropOrEnv(env, "MYSQL_DB_PORT", "3306");
        String dbName = getPropOrEnv(env, "MYSQL_DB_NAME", "instantshare");
        String user = getPropOrEnv(env, "MYSQL_DB_USERNAME", "root");
        String pass = getPropOrEnv(env, "MYSQL_DB_PASSWORD", "");
        String explicitUrl = getPropOrEnv(env, "MYSQL_DB_URL", null);

        String jdbcUrl = explicitUrl != null ? explicitUrl :
                String.format("jdbc:mysql://%s:%s/%s?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true",
                        host, port, dbName);

        System.out.println("Target JDBC URL: " + jdbcUrl);
        System.out.println("Target User:     " + user);
        System.out.println("Target Password: " + (pass.isEmpty() ? "(empty)" : "********"));
        System.out.println("-------------------------------------------------");

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("[OK] MySQL JDBC Driver registered successfully.");
        } catch (ClassNotFoundException e) {
            System.err.println("[FAIL] MySQL JDBC Driver (com.mysql.cj.jdbc.Driver) not found on classpath!");
            System.err.println("       Make sure 'mysql-connector-j' is added to pom.xml.");
            return;
        }

        try (Connection conn = DriverManager.getConnection(jdbcUrl, user, pass)) {
            System.out.println(">>> SUCCESS! Connected to MySQL successfully! <<<");
            System.out.println("Database Product: " + conn.getMetaData().getDatabaseProductName());
            System.out.println("Database Version: " + conn.getMetaData().getDatabaseProductVersion());

            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT DATABASE(), NOW()")) {
                if (rs.next()) {
                    System.out.println("Current Database: " + rs.getString(1));
                    System.out.println("Server Timestamp: " + rs.getString(2));
                }
            }

            System.out.println("=================================================");
            System.out.println("MySQL is READY for InstantShare Backend!");
            System.out.println("=================================================");
        } catch (SQLException e) {
            System.err.println(">>> CONNECTION FAILED: " + e.getMessage());
            System.err.println("Error Code: " + e.getErrorCode() + " | SQLState: " + e.getSQLState());
            System.err.println("\nTroubleshooting tips:");
            System.err.println(" 1. Ensure MySQL Server is running (e.g. via Windows Services, XAMPP, Docker, or MySQL Workbench).");
            System.err.println(" 2. Verify port " + port + " is accessible.");
            System.err.println(" 3. Verify user '" + user + "' and password in your .env file.");
            System.err.println("=================================================");
        } finally {
            try {
                Class<?> cleanup = Class.forName("com.mysql.cj.jdbc.AbandonedConnectionCleanupThread");
                cleanup.getMethod("checkedShutdown").invoke(null);
            } catch (Throwable ignored) {}
        }
    }

    private static String getPropOrEnv(Map<String, String> env, String key, String defaultValue) {
        String val = System.getProperty(key);
        if (val != null && !val.trim().isEmpty()) return val;
        val = System.getenv(key);
        if (val != null && !val.trim().isEmpty()) return val;
        val = env.get(key);
        if (val != null && !val.trim().isEmpty()) return val;
        return defaultValue;
    }

    private static Map<String, String> loadDotEnv() {
        Map<String, String> map = new HashMap<>();
        File envFile = new File(".env");
        if (!envFile.exists()) {
            envFile = new File("../.env");
        }
        if (!envFile.exists()) {
            return map;
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                    continue;
                }
                int idx = line.indexOf('=');
                String key = line.substring(0, idx).trim();
                String value = line.substring(idx + 1).trim();
                if ((value.startsWith("\"") && value.endsWith("\"")) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length() - 1);
                }
                map.put(key, value);
            }
        } catch (Exception ignored) {}
        return map;
    }
}
