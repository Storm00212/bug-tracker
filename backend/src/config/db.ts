import sql from "mssql";
import dotenv from "dotenv";
import assert from "assert";

dotenv.config();

// ✅ Assert that required environment variables exist
assert(process.env.SQL_SERVER, "❌ Missing environment variable: SQL_SERVER");
assert(process.env.SQL_DB, "❌ Missing environment variable: SQL_DB");
assert(process.env.SQL_USER, "❌ Missing environment variable: SQL_USER");
assert(process.env.SQL_PWD, "❌ Missing environment variable: SQL_PWD");
assert(process.env.SQL_PORT, "❌ Missing environment variable: SQL_PORT");

// ✅ SQL connection configuration
const config: sql.config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PWD,
  server: process.env.SQL_SERVER as string,
  database: process.env.SQL_DB,
  port: Number(process.env.SQL_PORT) || 1433,
  options: {
    encrypt: false, // set true for Azure
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// ✅ Connection pool instance
let pool: sql.ConnectionPool | null = null;
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 5000;

/**
 * Creates or returns an existing SQL connection pool.
 * Includes retries and helpful debug messages.
 */
export const getPool = async (): Promise<sql.ConnectionPool> => {
  if (pool) return pool;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`\x1b[36m[DB]\x1b[0m Attempt ${attempt}/${MAX_RETRIES} - connecting to ${process.env.SQL_SERVER}...`);
      pool = await sql.connect(config);
      console.log("\x1b[32m[DB]\x1b[0m ✅ Connected successfully to SQL Server");
      return pool;
    } catch (error: any) {
      const code = error.code || "UNKNOWN";
      const message = error.message || "No error message provided";

      console.error(`\x1b[31m[DB]\x1b[0m ❌ Connection failed [${code}]: ${message}`);

      // Common failure hints
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

      if (attempt < MAX_RETRIES) {
        console.log(`\x1b[33m[DB]\x1b[0m ⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error("\x1b[31m[DB]\x1b[0m 🚨 Max retries reached. Unable to connect to SQL Server.");
        throw error;
      }
    }
  }

  throw new Error("SQL connection failed after multiple retries.");
};

/**
 * Gracefully closes the SQL connection pool when shutting down.
 */
export const closePool = async (): Promise<void> => {
  if (pool) {
    try {
      await pool.close();
      console.log("\x1b[33m[DB]\x1b[0m 🔒 SQL connection pool closed gracefully.");
      pool = null;
    } catch (err) {
      console.error("\x1b[31m[DB]\x1b[0m ⚠️ Error closing SQL pool:", err);
    }
  }
};
