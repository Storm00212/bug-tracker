/**
 * BUG REPOSITORY
 *
 * Handles direct database operations for Bug entities.
 * Contains SQL queries for bug CRUD operations.
 * Bugs are the core tracking entities in the system.
 */
import { getPool } from "../config/db.js";
import { bugSchema } from "../models/Bug.js";
/**
 * Create a new bug report in the database
 *
 * Process: Validate → Insert → Return result
 * Bugs can be reported by any authenticated user
 */
export const createBug = async (bug) => {
    // Step 1: Validate bug data using Zod schema
    const parsed = bugSchema.safeParse(bug);
    if (!parsed.success) {
        const errors = parsed.error.issues.map((e) => e.message).join(", ");
        throw new Error(`Bug validation failed: ${errors}`);
    }
    // Step 2: Get database connection from pool
    const pool = await getPool();
    // Step 3: Execute INSERT query with parameterized values
    // Handle optional developerId by converting undefined to null
    const result = await pool.request()
        .input("title", bug.title)
        .input("description", bug.description)
        .input("severity", bug.severity)
        .input("reporterId", bug.reporterId)
        .input("developerId", bug.developerId || null)
        .input("projectId", bug.projectId)
        .query(`
      INSERT INTO Bugs (title, description, severity, reporterId, developerId, projectId)
      VALUES (@title, @description, @severity, @reporterId, @developerId, @projectId);
      SELECT SCOPE_IDENTITY() AS id;
    `);
    // Step 4: Return the newly created bug record with generated ID
    return result.recordset[0];
};
/**
 * Get all bugs for a specific project
 *
 * Returns bugs ordered by creation date (newest first)
 * Used for project-specific bug listings
 */
export const getBugsByProject = async (projectId) => {
    const pool = await getPool();
    const result = await pool.request()
        .input("projectId", projectId)
        .query(`SELECT * FROM Bugs WHERE projectId = @projectId ORDER BY createdAt DESC`);
    return result.recordset;
};
//# sourceMappingURL=bugRepository.js.map