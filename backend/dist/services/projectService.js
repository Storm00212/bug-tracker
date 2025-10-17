import { createProject, getAllProjects } from "../repositories/projectRepository.js";
export class ProjectService {
    static async createProject(projectData) {
        // Additional business logic can be added here
        // For example: validate project name uniqueness, check user permissions, etc.
        const newProject = await createProject(projectData);
        return newProject;
    }
    static async getAllProjects() {
        const projects = await getAllProjects();
        // Additional business logic can be added here
        // For example: filter projects based on user permissions, add computed fields, etc.
        return projects;
    }
    static async getProjectById(projectId) {
        // This method can be added to repository if needed
        const projects = await getAllProjects();
        return projects.find(p => p.id === projectId) || null;
    }
}
//# sourceMappingURL=projectService.js.map