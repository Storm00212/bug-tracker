/**
 * DATABASE CONFIGURATION
 *
 * Handles SQL Server connection setup and management.
 * Uses connection pooling for efficient database access.
 * Provides centralized database configuration and error handling.
 */
import sql from "mssql";
import dotenv from "dotenv";
import assert from "assert";
// Load environment variables from .env file
dotenv.config();
// Validate that all required environment variables are present
// This prevents runtime errors from missing database configuration
assert(process.env.SQL_SERVER, "❌ Missing environment variable: SQL_SERVER");
assert(process.env.SQL_DB, "❌ Missing environment variable: SQL_DB");
assert(process.env.SQL_USER, "❌ Missing environment variable: SQL_USER");
assert(process.env.SQL_PWD, "❌ Missing environment variable: SQL_PWD");
assert(process.env.SQL_PORT, "❌ Missing environment variable: SQL_PORT");
/**
 * SQL Server connection configuration
 * Defines all parameters needed to connect to the database
 */
const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PWD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DB,
    port: Number(process.env.SQL_PORT) || 1433,
    options: {
        encrypt: false, // Set to true for Azure SQL Database
        trustServerCertificate: true // Required for local SQL Server instances
    },
    pool: {
        max: 10, // Maximum number of connections in pool
        min: 0, // Minimum number of connections in pool
        idleTimeoutMillis: 30000 // Close idle connections after 30 seconds
    }
};
// Global connection pool instance - reused across the application
let pool = null;
// Connection retry configuration
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 5000;
/**
 * Get or create SQL Server connection pool
 *
 * Implements connection pooling for efficient database access.
 * Includes automatic retry logic for connection failures.
 * Returns existing pool if already connected.
 *
 * @returns Promise<sql.ConnectionPool> - Database connection pool
 * @throws Error if connection fails after all retries
 */
export const getPool = async () => {
    // Return existing pool if already connected
    if (pool)
        return pool;
    // Attempt connection with retry logic
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`\x1b[36m[DB]\x1b[0m Attempt ${attempt}/${MAX_RETRIES} - connecting to ${process.env.SQL_SERVER}...`);
            pool = await sql.connect(config);
            console.log("\x1b[32m[DB]\x1b[0m ✅ Connected successfully to SQL Server");
            return pool;
        }
        catch (error) {
            const code = error.code || "UNKNOWN";
            const message = error.message || "No error message provided";
            console.error(`\x1b[31m[DB]\x1b[0m ❌ Connection failed [${code}]: ${message}`);
            // Provide helpful error messages for common connection issues
            switch (code) {
                case "ECONNREFUSED":
                    console.error("💡 Check if SQL Server is running and listening on port 1433.");
                    break;
                case "ESOCKET":
                    console.error("💡 Enable TCP/IP in SQL Server Configuration Manager (Protocols for SQLEXPRESS).");
                    break;
                case "ELOGIN":
                    console.error("💡 Invalid login — verify SQL_USER and SQL_PWD in your .env file.");
                    break;
                case "ETIMEOUT":
                    console.error("💡 Timeout — check network/firewall settings or server availability.");
                    break;
                default:
                    console.error("💡 Unknown error — inspect network or SQL configuration.");
            }
            // Retry connection if attempts remain
            if (attempt < MAX_RETRIES) {
                console.log(`\x1b[33m[DB]\x1b[0m ⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
            }
            else {
                console.error("\x1b[31m[DB]\x1b[0m 🚨 Max retries reached. Unable to connect to SQL Server.");
                throw error;
            }
        }
    }
    throw new Error("SQL connection failed after multiple retries.");
};
/**
 * Close database connection pool gracefully
 *
 * Should be called during application shutdown to clean up resources.
 * Handles errors during pool closure.
 */
export const closePool = async () => {
    if (pool) {
        try {
            await pool.close();
            console.log("\x1b[33m[DB]\x1b[0m 🔒 SQL connection pool closed gracefully.");
            pool = null;
        }
        catch (err) {
            console.error("\x1b[31m[DB]\x1b[0m ⚠️ Error closing SQL pool:", err);
        }
    }
};
//# sourceMappingURL=db.js.map