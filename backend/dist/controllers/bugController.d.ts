/**
 * BUG CONTROLLERS
 *
 * Handles HTTP requests for bug tracking operations.
 * Controllers manage bug reporting, status updates, and queries.
 * Bugs are the core entities that track software issues.
 */
import { Request, Response } from "express";
/**
 * Handle bug reporting
 *
 * Process: Validate input → Create bug → Return result
 * Any authenticated user can report bugs
 */
export declare const reportBug: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Handle fetching bugs for a specific project
 *
 * Process: Extract project ID → Get bugs from service → Return list
 * All authenticated users can view bugs in projects they have access to
 */
export declare const getProjectBugs: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=bugController.d.ts.map