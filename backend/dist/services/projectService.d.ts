import type { Project } from "../models/Project.js";
export declare class ProjectService {
    static createProject(projectData: Omit<Project, "id" | "createdAt">): Promise<Project>;
    static getAllProjects(): Promise<Project[]>;
    static getProjectById(projectId: number): Promise<Project | null>;
}
//# sourceMappingURL=projectService.d.ts.map