import express from "express";
import dotenv from "dotenv";
import { getPool, closePool } from "./config/db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await getPool();
  } catch (err) {
    console.error("❌ [App] Database connection could not be established. Exiting...");
    process.exit(1);
  }
})();

app.get("/", (_, res) => res.send("Bug Tracker Backend Running"));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  await closePool();
  console.log("👋 Server shutting down gracefully.");
  process.exit(0);
});
