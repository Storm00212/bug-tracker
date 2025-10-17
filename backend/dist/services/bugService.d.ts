import type { Bug } from "../models/Bug.js";
export declare class BugService {
    static createBug(bugData: Omit<Bug, "id" | "createdAt">): Promise<Bug>;
    static getBugsByProject(projectId: number): Promise<Bug[]>;
    static getBugById(bugId: number): Promise<Bug | null>;
}
//# sourceMappingURL=bugService.d.ts.map