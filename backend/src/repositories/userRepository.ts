import { getPool } from "../config/db.js";
import bcrypt from "bcryptjs";
import { userSchema } from "../models/User.js";
import type { User } from "../models/User.js";

export const createUser = async (user: User) => {
  // ✅ Validate using Zod
  const parsed = userSchema.safeParse(user);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e: any) => e.message).join(", ");
    throw new Error(`User validation failed: ${errors}`);
  }

  const pool = await getPool();
  const hashedPassword = await bcrypt.hash(user.password, 10);

  const result = await pool.request()
    .input("username", user.username)
    .input("email", user.email)
    .input("password", hashedPassword)
    .input("role", user.role)
    .query(`
      INSERT INTO Users (username, email, password, role)
      VALUES (@username, @email, @password, @role);
      SELECT SCOPE_IDENTITY() AS id;
    `);

  return result.recordset[0];
};

export const findUserByEmail = async (email: string) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("email", email)
    .query(`SELECT * FROM Users WHERE email = @email`);
  return result.recordset[0];
};

export const verifyCredentials = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : null;
};
