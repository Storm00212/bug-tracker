/**
 * COMMENT CONTROLLERS
 *
 * Handles HTTP requests for comment operations on bugs.
 * Controllers manage adding comments and retrieving comment threads.
 * Comments enable team collaboration and bug discussion.
 */
import { Request, Response } from "express";
/**
 * Handle adding a comment to a bug
 *
 * Process: Validate input → Create comment → Return result
 * Any authenticated user can comment on bugs
 */
export declare const addBugComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Handle fetching all comments for a specific bug
 *
 * Process: Extract bug ID → Get comments from service → Return list
 * All authenticated users can view comments on bugs
 */
export declare const listBugComments: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=commentController.d.ts.map