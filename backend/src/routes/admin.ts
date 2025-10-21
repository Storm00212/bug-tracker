/**
 * ADMINISTRATIVE ROUTES
 *
 * Handles administrative operations including user management, system analytics,
 * and reporting features. These endpoints are restricted to Admin role only.
 */

import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { getAllUsers, updateUserRole } from "../repositories/userRepository.js";
import { getPool } from "../config/db.js";

// Create Express router for admin-only endpoints
const router = Router();

/**
 * GET /admin/users
 * Get list of all users in the system
 *
 * Returns: { users: [...] }
 * Requires: Admin role
 * Protected: Requires authentication
 */
router.get("/users", authMiddleware, authorizeRoles("Admin"), async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ users });
  } catch (err: any) {
    console.error("Get All Users Error:", err.message);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

/**
 * PUT /admin/users/:id/role
 * Update a user's role (promote/demote users)
 *
 * Params: id (user ID)
 * Body: { role: "Admin" | "Developer" | "Tester" }
 * Returns: { message, user }
 * Requires: Admin role
 * Protected: Requires authentication
 */
router.put("/users/:id/role", authMiddleware, authorizeRoles("Admin"), async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const updatedUser = await updateUserRole(userId, role);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User role updated successfully", user: updatedUser });
  } catch (err: any) {
    console.error("Update User Role Error:", err.message);
    res.status(500).json({ message: "Server error updating user role" });
  }
});

/**
 * GET /admin/analytics
 * Get system-wide analytics and statistics
 *
 * Returns: { totalUsers, totalProjects, totalBugs, bugsByStatus, ... }
 * Requires: Admin role
 * Protected: Requires authentication
 */
router.get("/analytics", authMiddleware, authorizeRoles("Admin"), async (req, res) => {
  try {
    const pool = await getPool();

    // Get basic counts
    const [userResult, projectResult, bugResult] = await Promise.all([
      pool.request().query("SELECT COUNT(*) as count FROM Users"),
      pool.request().query("SELECT COUNT(*) as count FROM Projects"),
      pool.request().query("SELECT COUNT(*) as count FROM Bugs")
    ]);

    // Get bugs by status
    const statusResult = await pool.request().query(`
      SELECT status, COUNT(*) as count
      FROM Bugs
      GROUP BY status
    `);

    // Get bugs by severity
    const severityResult = await pool.request().query(`
      SELECT severity, COUNT(*) as count
      FROM Bugs
      GROUP BY severity
    `);

    // Get recent activity (last 30 days)
    const recentActivity = await pool.request().query(`
      SELECT COUNT(*) as recentBugs
      FROM Bugs
      WHERE createdAt >= DATEADD(day, -30, GETDATE())
    `);

    const analytics = {
      totalUsers: userResult.recordset[0].count,
      totalProjects: projectResult.recordset[0].count,
      totalBugs: bugResult.recordset[0].count,
      bugsByStatus: statusResult.recordset,
      bugsBySeverity: severityResult.recordset,
      recentActivity: recentActivity.recordset[0].recentBugs
    };

    res.json(analytics);
  } catch (err: any) {
    console.error("Analytics Error:", err.message);
    res.status(500).json({ message: "Server error fetching analytics" });
  }
});

/**
 * GET /admin/reports/bugs
 * Generate comprehensive bug reports
 *
 * Query params: startDate, endDate, projectId, status (optional filters)
 * Returns: { summary, detailedReport, chartsData }
 * Requires: Admin role
 * Protected: Requires authentication
 */
router.get("/reports/bugs", authMiddleware, authorizeRoles("Admin"), async (req, res) => {
  try {
    const pool = await getPool();
    const { startDate, endDate, projectId, status } = req.query;

    // Build dynamic query based on filters
    let whereClause = "1=1";
    const request = pool.request();

    if (startDate) {
      whereClause += " AND createdAt >= @startDate";
      request.input("startDate", startDate);
    }

    if (endDate) {
      whereClause += " AND createdAt <= @endDate";
      request.input("endDate", endDate);
    }

    if (projectId) {
      whereClause += " AND projectId = @projectId";
      request.input("projectId", Number(projectId));
    }

    if (status) {
      whereClause += " AND status = @status";
      request.input("status", status);
    }

    // Get detailed bug report
    const bugsQuery = `
      SELECT b.*, p.name as projectName, u.username as reporterName, d.username as developerName
      FROM Bugs b
      LEFT JOIN Projects p ON b.projectId = p.id
      LEFT JOIN Users u ON b.reporterId = u.id
      LEFT JOIN Users d ON b.developerId = d.id
      WHERE ${whereClause}
      ORDER BY b.createdAt DESC
    `;

    const bugsResult = await request.query(bugsQuery);

    // Get summary statistics
    const summaryQuery = `
      SELECT
        COUNT(*) as totalBugs,
        COUNT(CASE WHEN status = 'Open' THEN 1 END) as openBugs,
        COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as inProgressBugs,
        COUNT(CASE WHEN status IN ('Resolved', 'Closed') THEN 1 END) as resolvedBugs,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as criticalBugs
      FROM Bugs
      WHERE ${whereClause}
    `;

    const summaryResult = await request.query(summaryQuery);

    const report = {
      summary: summaryResult.recordset[0],
      detailedReport: bugsResult.recordset,
      filters: { startDate, endDate, projectId, status }
    };

    res.json(report);
  } catch (err: any) {
    console.error("Bug Reports Error:", err.message);
    res.status(500).json({ message: "Server error generating bug reports" });
  }
});

// Export router for mounting in main application
export default router;