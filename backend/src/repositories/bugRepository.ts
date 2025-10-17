import { getPool } from "../config/db.js";
import { bugSchema, Bug } from "../models/Bug.js";

export const createBug = async (bug: Bug) => {
  const parsed = bugSchema.safeParse(bug);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e: any) => e.message).join(", ");
    throw new Error(`Bug validation failed: ${errors}`);
  }

  const pool = await getPool();
  const result = await pool.request()
    .input("title", bug.title)
    .input("description", bug.description)
    .input("severity", bug.severity)
    .input("reporterId", bug.reporterId)
    .input("developerId", bug.developerId || null)
    .input("projectId", bug.projectId)
    .query(`
      INSERT INTO Bugs (title, description, severity, reporterId, developerId, projectId)
      VALUES (@title, @description, @severity, @reporterId, @developerId, @projectId);
      SELECT SCOPE_IDENTITY() AS id;
    `);

  return result.recordset[0];
};

export const getBugsByProject = async (projectId: number) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("projectId", projectId)
    .query(`SELECT * FROM Bugs WHERE projectId = @projectId ORDER BY createdAt DESC`);
  return result.recordset;
};
