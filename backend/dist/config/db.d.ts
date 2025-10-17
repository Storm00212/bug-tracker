import sql from "mssql";
/**
 * Creates or returns an existing SQL connection pool.
 * Includes retries and helpful debug messages.
 */
export declare const getPool: () => Promise<sql.ConnectionPool>;
/**
 * Gracefully closes the SQL connection pool when shutting down.
 */
export declare const closePool: () => Promise<void>;
//# sourceMappingURL=db.d.ts.map