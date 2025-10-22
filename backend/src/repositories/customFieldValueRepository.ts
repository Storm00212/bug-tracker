/**
 * CUSTOM FIELD VALUE REPOSITORY
 *
 * Handles direct database operations for Custom Field Value entities.
 * Contains SQL queries for custom field value CRUD operations.
 */

import { getPool } from "../config/db.js";
import { customFieldValueSchema } from "../models/CustomField.js";
import type { CustomFieldValue } from "../models/CustomField.js";

/**
 * Create a new custom field value in the database
 */
export const createCustomFieldValue = async (fieldValue: CustomFieldValue) => {
  const parsed = customFieldValueSchema.safeParse(fieldValue);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e: any) => e.message).join(", ");
    throw new Error(`Custom field value validation failed: ${errors}`);
  }

  const pool = await getPool();
  const result = await pool.request()
    .input("issueId", fieldValue.issueId)
    .input("customFieldId", fieldValue.customFieldId)
    .input("value", JSON.stringify(fieldValue.value))
    .query(`
      INSERT INTO CustomFieldValues (issueId, customFieldId, value)
      VALUES (@issueId, @customFieldId, @value);
      SELECT SCOPE_IDENTITY() AS id;
    `);

  return result.recordset[0];
};

/**
 * Get all custom field values for a specific issue
 */
export const getCustomFieldValuesByIssue = async (issueId: number) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("issueId", issueId)
    .query(`SELECT * FROM CustomFieldValues WHERE issueId = @issueId`);
  return result.recordset;
};

/**
 * Get a specific custom field value by ID
 */
export const getCustomFieldValueById = async (valueId: number) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("id", valueId)
    .query(`SELECT * FROM CustomFieldValues WHERE id = @id`);
  return result.recordset[0] || null;
};

/**
 * Update an existing custom field value
 */
export const updateCustomFieldValue = async (valueId: number, fieldValueData: Partial<CustomFieldValue>) => {
  const pool = await getPool();
  const updateFields: string[] = [];
  const request = pool.request().input("id", valueId);

  if (fieldValueData.value !== undefined) {
    updateFields.push("value = @value");
    request.input("value", JSON.stringify(fieldValueData.value));
  }

  updateFields.push("updatedAt = GETDATE()");

  if (updateFields.length === 0) {
    throw new Error("No fields provided for update");
  }

  await request.query(`
    UPDATE CustomFieldValues
    SET ${updateFields.join(", ")}
    WHERE id = @id
  `);

  return await getCustomFieldValueById(valueId);
};

/**
 * Delete a custom field value
 */
export const deleteCustomFieldValue = async (valueId: number) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("valueId", valueId)
    .query(`DELETE FROM CustomFieldValues WHERE id = @valueId`);
  return result.rowsAffected[0];
};

/**
 * Delete all custom field values for an issue
 */
export const deleteCustomFieldValuesByIssue = async (issueId: number) => {
  const pool = await getPool();
  await pool.request()
    .input("issueId", issueId)
    .query(`DELETE FROM CustomFieldValues WHERE issueId = @issueId`);
};

/**
 * Delete all custom field values for a custom field
 */
export const deleteCustomFieldValuesByField = async (customFieldId: number) => {
  const pool = await getPool();
  await pool.request()
    .input("customFieldId", customFieldId)
    .query(`DELETE FROM CustomFieldValues WHERE customFieldId = @customFieldId`);
};

/**
 * Upsert custom field value (insert or update if exists)
 */
export const upsertCustomFieldValue = async (issueId: number, customFieldId: number, value: any) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("issueId", issueId)
    .input("customFieldId", customFieldId)
    .input("value", JSON.stringify(value))
    .query(`
      MERGE CustomFieldValues AS target
      USING (SELECT @issueId as issueId, @customFieldId as customFieldId) AS source
      ON target.issueId = source.issueId AND target.customFieldId = source.customFieldId
      WHEN MATCHED THEN
        UPDATE SET value = @value, updatedAt = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (issueId, customFieldId, value) VALUES (@issueId, @customFieldId, @value);
      SELECT SCOPE_IDENTITY() AS id;
    `);

  return result.recordset[0];
};