/**
 * COMMENT REPOSITORY
 *
 * Handles direct database operations for Comment entities.
 * Contains SQL queries for comment CRUD operations.
 * Comments enable team collaboration on bug resolution.
 */

import { getPool } from "../config/db.js";
import { commentSchema } from "../models/Comment.js";
import type { Comment } from "../models/Comment.js";

/**
 * Add a new comment to a bug
 *
 * Process: Validate → Insert → Return result
 * Comments can be added by any authenticated user
 */
export const addComment = async (comment: Comment) => {
  // Step 1: Validate comment data using Zod schema
  const parsed = commentSchema.safeParse(comment);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e: any) => e.message).join(", ");
    throw new Error(`Comment validation failed: ${errors}`);
  }

  // Step 2: Get database connection from pool
  const pool = await getPool();

  // Step 3: Execute INSERT query with parameterized values
  const result = await pool.request()
    .input("bugId", comment.bugId)
    .input("userId", comment.userId)
    .input("content", comment.content)
    .query(`
      INSERT INTO Comments (bugId, userId, content)
      VALUES (@bugId, @userId, @content);
      SELECT SCOPE_IDENTITY() AS id;
    `);

  // Step 4: Return the newly created comment record with generated ID
  return result.recordset[0];
};

/**
 * Get all comments for a specific bug
 *
 * Uses JOIN to include username with each comment for display
 * Returns comments ordered chronologically (oldest first)
 * Used for displaying comment threads on bug detail pages
 */
export const getCommentsByBug = async (bugId: number) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("bugId", bugId)
    .query(`
      SELECT c.*, u.username
      FROM Comments c
      JOIN Users u ON c.userId = u.id
      WHERE c.bugId = @bugId
      ORDER BY c.createdAt ASC
    `);
  return result.recordset;
};
