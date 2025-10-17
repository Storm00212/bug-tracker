/**
 * PROJECT CONTROLLERS
 *
 * Handles HTTP requests for project management operations.
 * Controllers validate input, call services, and format responses.
 * Projects are containers for organizing and managing bug reports.
 */
import { Request, Response } from "express";
/**
 * Handle project creation
 *
 * Process: Validate input → Create project → Return result
 * Only Admin users can create projects
 */
export declare const addProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Handle fetching all projects
 *
 * Process: Get projects from service → Return list
 * All authenticated users can view projects
 */
export declare const listProjects: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=projectController.d.ts.map