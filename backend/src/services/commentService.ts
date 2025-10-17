import { addComment, getCommentsByBug } from "../repositories/commentRepository.js";
import type { Comment } from "../models/Comment.js";

export class CommentService {
  static async addComment(commentData: Omit<Comment, "id" | "createdAt">): Promise<Comment> {
    // Additional business logic can be added here
    // For example: validate bug exists, check user permissions, send notifications, etc.

    const newComment = await addComment(commentData);
    return newComment;
  }

  static async getCommentsByBug(bugId: number): Promise<Comment[]> {
    // Validate bug exists (can be added later)
    const comments = await getCommentsByBug(bugId);

    // Additional business logic can be added here
    // For example: filter comments based on user permissions, add user info, etc.

    return comments;
  }
}