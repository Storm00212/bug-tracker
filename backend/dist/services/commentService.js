/**
 * COMMENT SERVICE
 *
 * Contains business logic for comment operations on bugs.
 * Services handle core application logic for bug discussions and clarifications.
 * Comments enable team collaboration and provide context for bug resolution.
 */
import { addComment, getCommentsByBug } from "../repositories/commentRepository.js";
export class CommentService {
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
    static async addComment(commentData) {
        // Future business logic can be added here:
        // - Validate bug exists and user has access to it
        // - Check if user ID is valid and active
        // - Send email notifications to bug reporter and assigned developer
        // - Create activity log entry
        // - Apply content filtering or validation rules
        // - Handle @mentions or special formatting
        // Call repository to persist the comment
        const newComment = await addComment(commentData);
        return newComment;
    }
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
    static async getCommentsByBug(bugId) {
        // Future validation: Check if bug exists and user has access
        // Get comments from repository
        const comments = await getCommentsByBug(bugId);
        // Future business logic can be added here:
        // - Include user details (name, avatar, role) with each comment
        // - Sort comments chronologically (already done in repository)
        // - Add computed fields like "posted X minutes ago"
        // - Filter comments based on user permissions
        // - Include comment metadata (edit history, attachments, etc.)
        // - Apply pagination for long comment threads
        return comments;
    }
}
//# sourceMappingURL=commentService.js.map