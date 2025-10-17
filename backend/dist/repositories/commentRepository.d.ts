/**
 * COMMENT REPOSITORY
 *
 * Handles direct database operations for Comment entities.
 * Contains SQL queries for comment CRUD operations.
 * Comments enable team collaboration on bug resolution.
 */
import type { Comment } from "../models/Comment.js";
/**
 * Add a new comment to a bug
 *
 * Process: Validate → Insert → Return result
 * Comments can be added by any authenticated user
 */
export declare const addComment: (comment: Comment) => Promise<any>;
/**
 * Get all comments for a specific bug
 *
 * Uses JOIN to include username with each comment for display
 * Returns comments ordered chronologically (oldest first)
 * Used for displaying comment threads on bug detail pages
 */
export declare const getCommentsByBug: (bugId: number) => Promise<import("mssql").IRecordSet<any>>;
//# sourceMappingURL=commentRepository.d.ts.map