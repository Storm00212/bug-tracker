/**
 * BUG REPOSITORY
 *
 * Handles direct database operations for Bug entities.
 * Contains SQL queries for bug CRUD operations.
 * Bugs are the core tracking entities in the system.
 */

import { getPool } from "../config/db.js";
import { bugSchema } from "../models/Bug.js";
import type { Bug } from "../models/Bug.js";

/**
 * Create a new bug report in the database
 *
 * Process: Validate → Insert → Return result
 * Bugs can be reported by any authenticated user
 */
export const createBug = async (bug: Bug) => {
  // Step 1: Validate bug data using Zod schema
  const parsed = bugSchema.safeParse(bug);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e: any) => e.message).join(", ");
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
export const getBugsByProject = async (projectId: number) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("projectId", projectId)
    .query(`SELECT * FROM Bugs WHERE projectId = @projectId ORDER BY createdAt DESC`);
  return result.recordset;
};

/**
 * Get a specific bug by ID
 *
 * Returns bug with the specified ID or null if not found
 * Used for bug detail views and updates
 */
export const getBugById = async (bugId: number) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("id", bugId)
    .query(`SELECT * FROM Bugs WHERE id = @id`);
  return result.recordset[0] || null;
};

/**
 * Get all bugs with optional filtering
 *
 * Supports filtering by status, severity, reporterId, developerId
 * Returns bugs ordered by creation date (newest first)
 * Used for global bug listings with filtering
 */
export const getAllBugs = async (filters?: {
  status?: string;
  severity?: string;
  reporterId?: number;
  developerId?: number;
}) => {
  const pool = await getPool();
  let query = `SELECT * FROM Bugs WHERE 1=1`;
  const request = pool.request();

  // Add filters dynamically
  if (filters?.status) {
    query += ` AND status = @status`;
    request.input("status", filters.status);
  }

  if (filters?.severity) {
    query += ` AND severity = @severity`;
    request.input("severity", filters.severity);
  }

  if (filters?.reporterId) {
    query += ` AND reporterId = @reporterId`;
    request.input("reporterId", filters.reporterId);
  }

  if (filters?.developerId) {
    query += ` AND developerId = @developerId`;
    request.input("developerId", filters.developerId);
  }

  query += ` ORDER BY createdAt DESC`;

  const result = await request.query(query);
  return result.recordset;
};

/**
 * Update an existing bug
 *
 * Process: Validate → Update → Return result
 * Developers and Admins can update bugs
 */
export const updateBug = async (bugId: number, bugData: Partial<Bug>) => {
  // Step 1: Get database connection from pool
  const pool = await getPool();

  // Step 2: Build dynamic UPDATE query based on provided fields
  const updateFields: string[] = [];
  const request = pool.request().input("id", bugId);

  if (bugData.status !== undefined) {
    updateFields.push("status = @status");
    request.input("status", bugData.status);
  }

  if (bugData.developerId !== undefined) {
    updateFields.push("developerId = @developerId");
    request.input("developerId", bugData.developerId);
  }

  if (bugData.title !== undefined) {
    updateFields.push("title = @title");
    request.input("title", bugData.title);
  }

  if (bugData.description !== undefined) {
    updateFields.push("description = @description");
    request.input("description", bugData.description);
  }

  if (bugData.severity !== undefined) {
    updateFields.push("severity = @severity");
    request.input("severity", bugData.severity);
  }

  if (updateFields.length === 0) {
    throw new Error("No fields provided for update");
  }

  // Step 3: Execute UPDATE query
  await request.query(`
    UPDATE Bugs
    SET ${updateFields.join(", ")}
    WHERE id = @id
  `);

  // Step 4: Return the updated bug
  return await getBugById(bugId);
};

/**
 * Delete a bug
 *
 * Process: Delete comments first → Delete bug
 * Only Admin users can delete bugs
 */
export const deleteBug = async (bugId: number) => {
  // Step 1: Get database connection from pool
  const pool = await getPool();

  // Step 2: Start transaction for atomic operation
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    // Step 3: Delete all comments for this bug
    await transaction.request()
      .input("bugId", bugId)
      .query(`DELETE FROM Comments WHERE bugId = @bugId`);

    // Step 4: Delete the bug
    const result = await transaction.request()
      .input("bugId", bugId)
      .query(`DELETE FROM Bugs WHERE id = @bugId`);

    // Step 5: Commit transaction
    await transaction.commit();

    // Step 6: Return number of affected rows
    return result.rowsAffected[0];
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    throw error;
  }
};
