import { getPool } from "../config/db.js";
import { commentSchema } from "../models/Comment.js";
export const addComment = async (comment) => {
    const parsed = commentSchema.safeParse(comment);
    if (!parsed.success) {
        const errors = parsed.error.issues.map((e) => e.message).join(", ");
        throw new Error(`Comment validation failed: ${errors}`);
    }
    const pool = await getPool();
    const result = await pool.request()
        .input("bugId", comment.bugId)
        .input("userId", comment.userId)
        .input("content", comment.content)
        .query(`
      INSERT INTO Comments (bugId, userId, content)
      VALUES (@bugId, @userId, @content);
      SELECT SCOPE_IDENTITY() AS id;
    `);
    return result.recordset[0];
};
export const getCommentsByBug = async (bugId) => {
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
//# sourceMappingURL=commentRepository.js.map