/**
 * PROJECT REPOSITORY
 *
 * Handles direct database operations for Project entities.
 * Contains SQL queries for project CRUD operations.
 * Projects serve as containers for organizing bugs.
 */
import { getPool } from "../config/db.js";
import { projectSchema } from "../models/Project.js";
/**
 * Create a new project in the database
 *
 * Process: Validate → Insert → Return result
 * Projects are created by Admin users only
 */
export const createProject = async (project) => {
    // Step 1: Validate project data using Zod schema
    const parsed = projectSchema.safeParse(project);
    if (!parsed.success) {
        const errors = parsed.error.issues.map((e) => e.message).join(", ");
        throw new Error(`Project validation failed: ${errors}`);
    }
    // Step 2: Get database connection from pool
    const pool = await getPool();
    // Step 3: Execute INSERT query with parameterized values
    const result = await pool.request()
        .input("name", project.name)
        .input("description", project.description || "")
        .query(`
      INSERT INTO Projects (name, description)
      VALUES (@name, @description);
      SELECT SCOPE_IDENTITY() AS id;
    `);
    // Step 4: Return the newly created project record with generated ID
    return result.recordset[0];
};
/**
 * Retrieve all projects from the database
 *
 * Returns projects ordered by creation date (newest first)
 * Used for project listings and dropdowns
 */
export const getAllProjects = async () => {
    const pool = await getPool();
    const result = await pool.request().query(`SELECT * FROM Projects ORDER BY createdAt DESC`);
    return result.recordset;
};
//# sourceMappingURL=projectRepository.js.map