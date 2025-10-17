/**
 * BUG CONTROLLERS
 *
 * Handles HTTP requests for bug tracking operations.
 * Controllers manage bug reporting, status updates, and queries.
 * Bugs are the core entities that track software issues.
 */
import { BugService } from "../services/bugService.js";
import { bugSchema } from "../models/Bug.js";
/**
 * Handle bug reporting
 *
 * Process: Validate input → Create bug → Return result
 * Any authenticated user can report bugs
 */
export const reportBug = async (req, res) => {
    try {
        // Step 1: Validate bug data using Zod schema
        const parse = bugSchema.safeParse(req.body);
        if (!parse.success) {
            // Return validation errors if input is invalid
            const errors = parse.error.issues.map((e) => e.message).join(", ");
            return res.status(400).json({ message: errors });
        }
        // Step 2: Call service to create the bug
        const bug = await BugService.createBug(req.body);
        // Step 3: Return success response with created bug
        res.status(201).json({ message: "Bug reported successfully", bug });
    }
    catch (err) {
        // Log error and return generic server error
        console.error("Bug Report Error:", err.message);
        res.status(500).json({ message: "Server error reporting bug" });
    }
};
/**
 * Handle fetching bugs for a specific project
 *
 * Process: Extract project ID → Get bugs from service → Return list
 * All authenticated users can view bugs in projects they have access to
 */
export const getProjectBugs = async (req, res) => {
    try {
        // Step 1: Extract and convert project ID from URL parameters
        const projectId = Number(req.params.projectId);
        // Step 2: Call service to get bugs for this project
        const bugs = await BugService.getBugsByProject(projectId);
        // Step 3: Return bugs list
        res.json({ bugs });
    }
    catch (err) {
        // Log error and return generic server error
        console.error("Get Bugs Error:", err.message);
        res.status(500).json({ message: "Server error fetching bugs" });
    }
};
//# sourceMappingURL=bugController.js.map