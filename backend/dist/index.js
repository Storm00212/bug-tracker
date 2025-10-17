import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getPool, closePool } from "./config/db.js";
import { loggerMiddleware } from "./middleware/loggerMiddleware.js";
import { errorHandler } from "./middleware/errorHandler.js";
// Import route modules
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import bugRoutes from "./routes/bugs.js";
import commentRoutes from "./routes/comments.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);
// Routes
app.get("/", (_, res) => res.send("Bug Tracker Backend Running"));
// Mount route modules
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/bugs", bugRoutes);
app.use("/comments", commentRoutes);
// Error handling middleware (must be last)
app.use(errorHandler);
// Database connection
(async () => {
    try {
        await getPool();
    }
    catch (err) {
        console.error("❌ [App] Database connection could not be established. Exiting...");
        process.exit(1);
    }
})();
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
process.on("SIGINT", async () => {
    await closePool();
    console.log("👋 Server shutting down gracefully.");
    process.exit(0);
});
//# sourceMappingURL=index.js.map