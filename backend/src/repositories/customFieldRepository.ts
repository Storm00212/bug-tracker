/**
 * CUSTOM FIELD REPOSITORY
 *
 * Handles direct database operations for Custom Field entities.
 * Contains SQL queries for custom field CRUD operations.
 */

import { getPool } from "../config/db.js";
import { customFieldSchema } from "../models/CustomField.js";
import type { CustomField } from "../models/CustomField.js";

/**
 * Create a new custom field in the database
 */
export const createCustomField = async (field: CustomField) => {
  const parsed = customFieldSchema.safeParse(field);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e: any) => e.message).join(", ");
    throw new Error(`Custom field validation failed: ${errors}`);
  }

  const pool = await getPool();
  const result = await pool.request()
    .input("name", field.name)
    .input("label", field.label)
    .input("type", field.type)
    .input("description", field.description || null)
    .input("projectId", field.projectId)
    .input("required", field.required)
    .input("defaultValue", field.defaultValue ? JSON.stringify(field.defaultValue) : null)
    .input("options", field.options ? JSON.stringify(field.options) : null)
    .input("validation", field.validation ? JSON.stringify(field.validation) : null)
    .input("order", field.order)
    .input("isActive", field.isActive)
    .query(`
      INSERT INTO CustomFields (name, label, type, description, projectId, required, defaultValue, options, validation, [order], isActive)
      VALUES (@name, @label, @type, @description, @projectId, @required, @defaultValue, @options, @validation, @order, @isActive);
      SELECT SCOPE_IDENTITY() AS id;
    `);

  return result.recordset[0];
};

/**
 * Get all custom fields for a specific project
 */
export const getCustomFieldsByProject = async (projectId: number) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("projectId", projectId)
    .query(`SELECT * FROM CustomFields WHERE projectId = @projectId AND isActive = 1 ORDER BY [order] ASC`);
  return result.recordset;
};

/**
 * Get a specific custom field by ID
 */
export const getCustomFieldById = async (fieldId: number) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("id", fieldId)
    .query(`SELECT * FROM CustomFields WHERE id = @id`);
  return result.recordset[0] || null;
};

/**
 * Update an existing custom field
 */
export const updateCustomField = async (fieldId: number, fieldData: Partial<CustomField>) => {
  const pool = await getPool();
  const updateFields: string[] = [];
  const request = pool.request().input("id", fieldId);

  if (fieldData.name !== undefined) {
    updateFields.push("name = @name");
    request.input("name", fieldData.name);
  }

  if (fieldData.label !== undefined) {
    updateFields.push("label = @label");
    request.input("label", fieldData.label);
  }

  if (fieldData.type !== undefined) {
    updateFields.push("type = @type");
    request.input("type", fieldData.type);
  }

  if (fieldData.description !== undefined) {
    updateFields.push("description = @description");
    request.input("description", fieldData.description);
  }

  if (fieldData.required !== undefined) {
    updateFields.push("required = @required");
    request.input("required", fieldData.required);
  }

  if (fieldData.defaultValue !== undefined) {
    updateFields.push("defaultValue = @defaultValue");
    request.input("defaultValue", fieldData.defaultValue ? JSON.stringify(fieldData.defaultValue) : null);
  }

  if (fieldData.options !== undefined) {
    updateFields.push("options = @options");
    request.input("options", fieldData.options ? JSON.stringify(fieldData.options) : null);
  }

  if (fieldData.validation !== undefined) {
    updateFields.push("validation = @validation");
    request.input("validation", fieldData.validation ? JSON.stringify(fieldData.validation) : null);
  }

  if (fieldData.order !== undefined) {
    updateFields.push("[order] = @order");
    request.input("order", fieldData.order);
  }

  if (fieldData.isActive !== undefined) {
    updateFields.push("isActive = @isActive");
    request.input("isActive", fieldData.isActive);
  }

  updateFields.push("updatedAt = GETDATE()");

  if (updateFields.length === 0) {
    throw new Error("No fields provided for update");
  }

  await request.query(`
    UPDATE CustomFields
    SET ${updateFields.join(", ")}
    WHERE id = @id
  `);

  return await getCustomFieldById(fieldId);
};

/**
 * Delete a custom field
 */
export const deleteCustomField = async (fieldId: number) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("fieldId", fieldId)
    .query(`DELETE FROM CustomFields WHERE id = @fieldId`);
  return result.rowsAffected[0];
};