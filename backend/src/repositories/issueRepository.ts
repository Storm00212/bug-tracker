/**
 * ISSUE REPOSITORY
 *
 * Handles direct database operations for Issue entities.
 * Contains SQL queries for issue CRUD operations.
 * Issues are the core tracking entities in the system.
 */

import { getPool } from "../config/db.js";
import { issueSchema } from "../models/Issue.js";
import type { Issue } from "../models/Issue.js";

/**
 * Create a new issue in the database
 *
 * Process: Validate → Insert → Return result
 * Issues can be created by authenticated users
 */
export const createIssue = async (issue: Issue) => {
  // Step 1: Validate issue data using Zod schema
  const parsed = issueSchema.safeParse(issue);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e: any) => e.message).join(", ");
    throw new Error(`Issue validation failed: ${errors}`);
  }

  // Step 2: Get database connection from pool
  const pool = await getPool();

  // Step 3: Execute INSERT query with parameterized values
  const result = await pool.request()
    .input("title", issue.title)
    .input("description", issue.description)
    .input("type", issue.type)
    .input("priority", issue.priority || "Medium")
    .input("status", issue.status || "Open")
    .input("reporterId", issue.reporterId)
    .input("assigneeId", issue.assigneeId || null)
    .input("projectId", issue.projectId)
    .input("parentId", issue.parentId || null)
    .input("epicId", issue.epicId || null)
    .input("storyPoints", issue.storyPoints || null)
    .input("labels", JSON.stringify(issue.labels || []))
    .input("components", JSON.stringify(issue.components || []))
    .input("affectsVersions", JSON.stringify(issue.affectsVersions || []))
    .input("fixVersions", JSON.stringify(issue.fixVersions || []))
    .input("dueDate", issue.dueDate || null)
    .input("environment", issue.environment || null)
    .query(`
      INSERT INTO Issues (title, description, type, priority, status, reporterId, assigneeId, projectId, parentId, epicId, storyPoints, labels, components, affectsVersions, fixVersions, dueDate, environment)
      VALUES (@title, @description, @type, @priority, @status, @reporterId, @assigneeId, @projectId, @parentId, @epicId, @storyPoints, @labels, @components, @affectsVersions, @fixVersions, @dueDate, @environment);
      SELECT SCOPE_IDENTITY() AS id;
    `);

  // Step 4: Return the newly created issue record with generated ID
  return result.recordset[0];
};

/**
 * Get all issues for a specific project
 *
 * Returns issues ordered by creation date (newest first)
 * Used for project-specific issue listings
 */
export const getIssuesByProject = async (projectId: number) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("projectId", projectId)
    .query(`SELECT * FROM Issues WHERE projectId = @projectId ORDER BY createdAt DESC`);
  return result.recordset;
};

/**
 * Get a specific issue by ID
 *
 * Returns issue with the specified ID or null if not found
 * Used for issue detail views and updates
 */
export const getIssueById = async (issueId: number) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("id", issueId)
    .query(`SELECT * FROM Issues WHERE id = @id`);
  return result.recordset[0] || null;
};

/**
 * Get all issues with optional filtering
 *
 * Supports filtering by status, priority, type, reporterId, assigneeId, projectId, labels
 * Returns issues ordered by creation date (newest first)
 * Used for global issue listings with filtering
 */
export const getAllIssues = async (filters?: {
  status?: string;
  priority?: string;
  type?: string;
  reporterId?: number;
  assigneeId?: number;
  projectId?: number;
  labels?: string[];
  epicId?: number;
  parentId?: number;
  components?: string[];
  affectsVersions?: string[];
  fixVersions?: string[];
}) => {
  const pool = await getPool();
  let query = `SELECT * FROM Issues WHERE 1=1`;
  const request = pool.request();

  // Add filters dynamically
  if (filters?.status) {
    query += ` AND status = @status`;
    request.input("status", filters.status);
  }

  if (filters?.priority) {
    query += ` AND priority = @priority`;
    request.input("priority", filters.priority);
  }

  if (filters?.type) {
    query += ` AND type = @type`;
    request.input("type", filters.type);
  }

  if (filters?.reporterId) {
    query += ` AND reporterId = @reporterId`;
    request.input("reporterId", filters.reporterId);
  }

  if (filters?.assigneeId) {
    query += ` AND assigneeId = @assigneeId`;
    request.input("assigneeId", filters.assigneeId);
  }

  if (filters?.projectId) {
    query += ` AND projectId = @projectId`;
    request.input("projectId", filters.projectId);
  }

  if (filters?.epicId) {
    query += ` AND epicId = @epicId`;
    request.input("epicId", filters.epicId);
  }

  if (filters?.parentId) {
    query += ` AND parentId = @parentId`;
    request.input("parentId", filters.parentId);
  }

  // Handle array filters (JSON stored fields)
  if (filters?.labels && filters.labels.length > 0) {
    query += ` AND EXISTS (SELECT 1 FROM OPENJSON(labels) WHERE value IN (${filters.labels.map((_, i) => `@label${i}`).join(',')}))`;
    filters.labels.forEach((label, i) => request.input(`label${i}`, label));
  }

  if (filters?.components && filters.components.length > 0) {
    query += ` AND EXISTS (SELECT 1 FROM OPENJSON(components) WHERE value IN (${filters.components.map((_, i) => `@component${i}`).join(',')}))`;
    filters.components.forEach((component, i) => request.input(`component${i}`, component));
  }

  if (filters?.affectsVersions && filters.affectsVersions.length > 0) {
    query += ` AND EXISTS (SELECT 1 FROM OPENJSON(affectsVersions) WHERE value IN (${filters.affectsVersions.map((_, i) => `@affectsVersion${i}`).join(',')}))`;
    filters.affectsVersions.forEach((version, i) => request.input(`affectsVersion${i}`, version));
  }

  if (filters?.fixVersions && filters.fixVersions.length > 0) {
    query += ` AND EXISTS (SELECT 1 FROM OPENJSON(fixVersions) WHERE value IN (${filters.fixVersions.map((_, i) => `@fixVersion${i}`).join(',')}))`;
    filters.fixVersions.forEach((version, i) => request.input(`fixVersion${i}`, version));
  }

  query += ` ORDER BY createdAt DESC`;

  const result = await request.query(query);
  return result.recordset;
};

/**
 * Update an existing issue
 *
 * Process: Validate → Update → Return result
 * Users with appropriate roles can update issues
 */
export const updateIssue = async (issueId: number, issueData: Partial<Issue>) => {
  // Step 1: Get database connection from pool
  const pool = await getPool();

  // Step 2: Build dynamic UPDATE query based on provided fields
  const updateFields: string[] = [];
  const request = pool.request().input("id", issueId);

  if (issueData.title !== undefined) {
    updateFields.push("title = @title");
    request.input("title", issueData.title);
  }

  if (issueData.description !== undefined) {
    updateFields.push("description = @description");
    request.input("description", issueData.description);
  }

  if (issueData.type !== undefined) {
    updateFields.push("type = @type");
    request.input("type", issueData.type);
  }

  if (issueData.priority !== undefined) {
    updateFields.push("priority = @priority");
    request.input("priority", issueData.priority);
  }

  if (issueData.status !== undefined) {
    updateFields.push("status = @status");
    request.input("status", issueData.status);
  }

  if (issueData.assigneeId !== undefined) {
    updateFields.push("assigneeId = @assigneeId");
    request.input("assigneeId", issueData.assigneeId);
  }

  if (issueData.parentId !== undefined) {
    updateFields.push("parentId = @parentId");
    request.input("parentId", issueData.parentId);
  }

  if (issueData.epicId !== undefined) {
    updateFields.push("epicId = @epicId");
    request.input("epicId", issueData.epicId);
  }

  if (issueData.storyPoints !== undefined) {
    updateFields.push("storyPoints = @storyPoints");
    request.input("storyPoints", issueData.storyPoints);
  }

  if (issueData.labels !== undefined) {
    updateFields.push("labels = @labels");
    request.input("labels", JSON.stringify(issueData.labels));
  }

  if (issueData.components !== undefined) {
    updateFields.push("components = @components");
    request.input("components", JSON.stringify(issueData.components));
  }

  if (issueData.affectsVersions !== undefined) {
    updateFields.push("affectsVersions = @affectsVersions");
    request.input("affectsVersions", JSON.stringify(issueData.affectsVersions));
  }

  if (issueData.fixVersions !== undefined) {
    updateFields.push("fixVersions = @fixVersions");
    request.input("fixVersions", JSON.stringify(issueData.fixVersions));
  }

  if (issueData.dueDate !== undefined) {
    updateFields.push("dueDate = @dueDate");
    request.input("dueDate", issueData.dueDate);
  }

  if (issueData.environment !== undefined) {
    updateFields.push("environment = @environment");
    request.input("environment", issueData.environment);
  }

  // Always update the updatedAt timestamp
  updateFields.push("updatedAt = GETDATE()");

  if (updateFields.length === 0) {
    throw new Error("No fields provided for update");
  }

  // Step 3: Execute UPDATE query
  await request.query(`
    UPDATE Issues
    SET ${updateFields.join(", ")}
    WHERE id = @id
  `);

  // Step 4: Return the updated issue
  return await getIssueById(issueId);
};

/**
 * Delete an issue
 *
 * Process: Delete comments first → Delete issue
 * Only users with appropriate permissions can delete issues
 */
export const deleteIssue = async (issueId: number) => {
  // Step 1: Get database connection from pool
  const pool = await getPool();

  // Step 2: Start transaction for atomic operation
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    // Step 3: Delete all comments for this issue
    await transaction.request()
      .input("issueId", issueId)
      .query(`DELETE FROM Comments WHERE issueId = @issueId`);

    // Step 4: Delete the issue
    const result = await transaction.request()
      .input("issueId", issueId)
      .query(`DELETE FROM Issues WHERE id = @issueId`);

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