import { getPool } from "../config/db.js";
import { projectSchema, Project } from "../models/Project.js";

export const createProject = async (project: Project) => {
  const parsed = projectSchema.safeParse(project);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e: any) => e.message).join(", ");
    throw new Error(`Project validation failed: ${errors}`);
  }

  const pool = await getPool();
  const result = await pool.request()
    .input("name", project.name)
    .input("description", project.description || "")
    .query(`
      INSERT INTO Projects (name, description)
      VALUES (@name, @description);
      SELECT SCOPE_IDENTITY() AS id;
    `);

  return result.recordset[0];
};

export const getAllProjects = async () => {
  const pool = await getPool();
  const result = await pool.request().query(`SELECT * FROM Projects ORDER BY createdAt DESC`);
  return result.recordset;
};
