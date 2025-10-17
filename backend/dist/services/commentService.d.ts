import type { Comment } from "../models/Comment.js";
export declare class CommentService {
    static addComment(commentData: Omit<Comment, "id" | "createdAt">): Promise<Comment>;
    static getCommentsByBug(bugId: number): Promise<Comment[]>;
}
//# sourceMappingURL=commentService.d.ts.map