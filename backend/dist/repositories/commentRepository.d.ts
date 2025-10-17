import { Comment } from "../models/Comment.js";
export declare const addComment: (comment: Comment) => Promise<any>;
export declare const getCommentsByBug: (bugId: number) => Promise<import("mssql").IRecordSet<any>>;
//# sourceMappingURL=commentRepository.d.ts.map