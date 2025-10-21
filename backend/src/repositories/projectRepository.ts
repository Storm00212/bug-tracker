/**
 * PROJECT REPOSITORY
 *
 * Handles direct database operations for Project entities.
 * Contains SQL queries for project CRUD operations.
 * Projects serve as containers for organizing bugs.
 */

import { getPool } from "../config/db.js";
import { projectSchema } from "../models/Project.js";
import type { Project } from "../models/Project.js";

/**
 * Create a new project in the database
 *
 * Process: Validate → Insert → Return result
 * Projects are created by Admin users only
 */
export const createProject = async (project: Project) => {
  // Step 1: Validate project data using Zod schema
  const parsed = projectSchema.safeParse(project);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e: any) => e.message).join(", ");
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

/**
 * Get a specific project by ID
 *
 * Returns project with the specified ID or null if not found
 * Used for project detail views and updates
 */
export const getProjectById = async (projectId: number) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("id", projectId)
    .query(`SELECT * FROM Projects WHERE id = @id`);
  return result.recordset[0] || null;
};

/**
 * Update an existing project
 *
 * Process: Validate → Update → Return result
 * Only Admin users can update projects
 */
export const updateProject = async (projectId: number, projectData: Partial<Project>) => {
  // Step 1: Get database connection from pool
  const pool = await getPool();

  // Step 2: Build dynamic UPDATE query based on provided fields
  const updateFields: string[] = [];
  const request = pool.request().input("id", projectId);

  if (projectData.name !== undefined) {
    updateFields.push("name = @name");
    request.input("name", projectData.name);
  }

  if (projectData.description !== undefined) {
    updateFields.push("description = @description");
    request.input("description", projectData.description);
  }

  if (updateFields.length === 0) {
    throw new Error("No fields provided for update");
  }

  // Step 3: Execute UPDATE query
  await request.query(`
    UPDATE Projects
    SET ${updateFields.join(", ")}
    WHERE id = @id
  `);

  // Step 4: Return the updated project
  return await getProjectById(projectId);
};

/**
 * Delete a project and all associated bugs
 *
 * Process: Delete bugs first → Delete project
 * Only Admin users can delete projects
 */
export const deleteProject = async (projectId: number) => {
  // Step 1: Get database connection from pool
  const pool = await getPool();

  // Step 2: Start transaction for atomic operation
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    // Step 3: Delete all comments associated with bugs in this project
    await transaction.request()
      .input("projectId", projectId)
      .query(`
        DELETE c FROM Comments c
        INNER JOIN Bugs b ON c.bugId = b.id
        WHERE b.projectId = @projectId
      `);

    // Step 4: Delete all bugs in the project
    await transaction.request()
      .input("projectId", projectId)
      .query(`DELETE FROM Bugs WHERE projectId = @projectId`);

    // Step 5: Delete the project
    const result = await transaction.request()
      .input("projectId", projectId)
      .query(`DELETE FROM Projects WHERE id = @projectId`);

    // Step 6: Commit transaction
    await transaction.commit();

    // Step 7: Return number of affected rows
    return result.rowsAffected[0];
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    throw error;
  }
};
