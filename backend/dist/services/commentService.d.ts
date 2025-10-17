/**
 * COMMENT SERVICE
 *
 * Contains business logic for comment operations on bugs.
 * Services handle core application logic for bug discussions and clarifications.
 * Comments enable team collaboration and provide context for bug resolution.
 */
import type { Comment } from "../models/Comment.js";
export declare class CommentService {
    /**
     * Add a new comment to a bug
     *
     * Business Logic:
     * - Could validate that the bug exists
     * - Could check user permissions to comment on this bug
     * - Could validate user ID exists
     * - Could send notifications to bug participants
     * - Could create audit trail for comment history
     */
    static addComment(commentData: Omit<Comment, "id" | "createdAt">): Promise<Comment>;
    /**
     * Get all comments for a specific bug
     *
     * Business Logic:
     * - Could validate user has permission to view the bug
     * - Could include user information with each comment
     * - Could sort comments by creation time
     * - Could add computed fields (time ago, edit permissions, etc.)
     * - Could filter comments based on user roles
     */
    static getCommentsByBug(bugId: number): Promise<Comment[]>;
}
//# sourceMappingURL=commentService.d.ts.map