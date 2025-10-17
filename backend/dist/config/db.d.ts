/**
 * DATABASE CONFIGURATION
 *
 * Handles SQL Server connection setup and management.
 * Uses connection pooling for efficient database access.
 * Provides centralized database configuration and error handling.
 */
import sql from "mssql";
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
export declare const getPool: () => Promise<sql.ConnectionPool>;
/**
 * Close database connection pool gracefully
 *
 * Should be called during application shutdown to clean up resources.
 * Handles errors during pool closure.
 */
export declare const closePool: () => Promise<void>;
//# sourceMappingURL=db.d.ts.map