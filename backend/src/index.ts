/**
 * MAIN APPLICATION ENTRY POINT
 *
 * This is the central file that sets up and starts the Bug Tracking System backend.
 * It configures Express.js, connects to the database, sets up middleware, and mounts all API routes.
 *
 * Architecture: Layered Architecture (Routes → Controllers → Services → Repositories)
 * - Routes: Define API endpoints and HTTP methods
 * - Controllers: Handle HTTP requests/responses and input validation
 * - Services: Contain business logic and orchestrate data operations
 * - Repositories: Handle direct database interactions
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getPool, closePool } from "./config/db.js";
import { loggerMiddleware } from "./middleware/loggerMiddleware.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRateLimiter, authRateLimiter, adminRateLimiter } from "./middleware/rateLimitMiddleware.js";

// Import route modules - each handles a specific domain of the application
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import bugRoutes from "./routes/bugs.js";
import issueRoutes from "./routes/issues.js";
import customFieldRoutes from "./routes/customFields.js";
import commentRoutes from "./routes/comments.js";
import adminRoutes from "./routes/admin.js";

// Load environment variables from .env file
dotenv.config();

// Create Express application instance
const app = express();

// Get port from environment variables or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * MIDDLEWARE CONFIGURATION
 *
 * Middleware functions that run on every request to process or modify the request/response
 */

// Enable Cross-Origin Resource Sharing (allows frontend to call our API)
app.use(cors());

// Parse incoming JSON payloads in request bodies
app.use(express.json());

// Log all incoming requests for debugging and monitoring
app.use(loggerMiddleware);

// Apply rate limiting to all routes
app.use(apiRateLimiter);

/**
 * ROUTE CONFIGURATION
 *
 * Define all API endpoints by mounting route modules
 */

// Health check endpoint - returns basic server status
app.get("/", (_, res) => res.send("Bug Tracker Backend Running"));

// Authentication routes (login, register)
app.use("/auth", authRoutes);

// Project management routes (CRUD operations for projects)
app.use("/projects", projectRoutes);

// Bug tracking routes (report, update, query bugs)
app.use("/bugs", bugRoutes);

// Issue tracking routes (create, update, query issues)
app.use("/issues", issueRoutes);

// Custom field routes (manage custom fields and values)
app.use("/custom-fields", customFieldRoutes);

// Comment system routes (add comments to bugs/issues)
app.use("/comments", commentRoutes);

// Administrative routes (user management, analytics)
app.use("/admin", adminRoutes);

/**
 * ERROR HANDLING
 *
 * Global error handling middleware - must be last to catch all errors
 */
app.use(errorHandler);

/**
 * DATABASE CONNECTION & SERVER STARTUP
 *
 * Establish database connection before starting the server
 */
(async () => {
  try {
    // Attempt to connect to SQL Server database
    await getPool();
    console.log("✅ Database connection established successfully");
  } catch (err) {
    // If database connection fails, exit the application
    console.error("❌ [App] Database connection could not be established. Exiting...");
    process.exit(1);
  }
})();

// Start the HTTP server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/**
 * GRACEFUL SHUTDOWN HANDLING
 *
 * Handle process termination signals to clean up resources
 */
process.on("SIGINT", async () => {
  console.log("🛑 Received SIGINT signal. Shutting down gracefully...");

  // Close database connection pool
  await closePool();
  console.log("👋 Server shutting down gracefully.");

  // Exit the process
  process.exit(0);
});
