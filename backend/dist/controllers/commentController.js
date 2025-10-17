/**
 * COMMENT CONTROLLERS
 *
 * Handles HTTP requests for comment operations on bugs.
 * Controllers manage adding comments and retrieving comment threads.
 * Comments enable team collaboration and bug discussion.
 */
import { CommentService } from "../services/commentService.js";
import { commentSchema } from "../models/Comment.js";
/**
 * Handle adding a comment to a bug
 *
 * Process: Validate input → Create comment → Return result
 * Any authenticated user can comment on bugs
 */
export const addBugComment = async (req, res) => {
    try {
        // Step 1: Validate comment data using Zod schema
        const parse = commentSchema.safeParse(req.body);
        if (!parse.success) {
            // Return validation errors if input is invalid
            const errors = parse.error.issues.map((e) => e.message).join(", ");
            return res.status(400).json({ message: errors });
        }
        // Step 2: Call service to create the comment
        const comment = await CommentService.addComment(req.body);
        // Step 3: Return success response with created comment
        res.status(201).json({ message: "Comment added successfully", comment });
    }
    catch (err) {
        // Log error and return generic server error
        console.error("Add Comment Error:", err.message);
        res.status(500).json({ message: "Server error adding comment" });
    }
};
/**
 * Handle fetching all comments for a specific bug
 *
 * Process: Extract bug ID → Get comments from service → Return list
 * All authenticated users can view comments on bugs
 */
export const listBugComments = async (req, res) => {
    try {
        // Step 1: Extract and convert bug ID from URL parameters
        const bugId = Number(req.params.bugId);
        // Step 2: Call service to get comments for this bug
        const comments = await CommentService.getCommentsByBug(bugId);
        // Step 3: Return comments list
        res.json({ comments });
    }
    catch (err) {
        // Log error and return generic server error
        console.error("Fetch Comments Error:", err.message);
        res.status(500).json({ message: "Server error fetching comments" });
    }
};
//# sourceMappingURL=commentController.js.map