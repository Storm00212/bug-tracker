import { CommentService } from "../services/commentService.js";
import { commentSchema } from "../models/Comment.js";
export const addBugComment = async (req, res) => {
    try {
        const parse = commentSchema.safeParse(req.body);
        if (!parse.success) {
            const errors = parse.error.issues.map((e) => e.message).join(", ");
            return res.status(400).json({ message: errors });
        }
        const comment = await CommentService.addComment(req.body);
        res.status(201).json({ message: "Comment added successfully", comment });
    }
    catch (err) {
        console.error("Add Comment Error:", err.message);
        res.status(500).json({ message: "Server error adding comment" });
    }
};
export const listBugComments = async (req, res) => {
    try {
        const bugId = Number(req.params.bugId);
        const comments = await CommentService.getCommentsByBug(bugId);
        res.json({ comments });
    }
    catch (err) {
        console.error("Fetch Comments Error:", err.message);
        res.status(500).json({ message: "Server error fetching comments" });
    }
};
//# sourceMappingURL=commentController.js.map