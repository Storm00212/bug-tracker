/**
 * CUSTOM FIELD CONTROLLERS
 *
 * Handles HTTP requests for custom field operations.
 * Controllers manage custom field creation, updates, and value management.
 */

import { Request, Response } from "express";
import { CustomFieldService } from "../services/customFieldService.js";
import { customFieldSchema } from "../models/CustomField.js";

/**
 * Handle creating a new custom field
 */
export const createCustomField = async (req: Request, res: Response) => {
  try {
    const parse = customFieldSchema.safeParse(req.body);
    if (!parse.success) {
      const errors = parse.error.issues.map((e: any) => e.message).join(", ");
      return res.status(400).json({ message: errors });
    }

    const field = await CustomFieldService.createCustomField(req.body);
    res.status(201).json({ message: "Custom field created successfully", field });
  } catch (err: any) {
    console.error("Create Custom Field Error:", err.message);
    res.status(500).json({ message: "Server error creating custom field" });
  }
};

/**
 * Handle getting all custom fields for a project
 */
export const getCustomFieldsByProject = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const fields = await CustomFieldService.getCustomFieldsByProject(projectId);
    res.json({ fields });
  } catch (err: any) {
    console.error("Get Custom Fields Error:", err.message);
    res.status(500).json({ message: "Server error fetching custom fields" });
  }
};

/**
 * Handle getting a specific custom field
 */
export const getCustomField = async (req: Request, res: Response) => {
  try {
    const fieldId = Number(req.params.id);
    const field = await CustomFieldService.getCustomFieldById(fieldId);

    if (!field) {
      return res.status(404).json({ message: "Custom field not found" });
    }

    res.json({ field });
  } catch (err: any) {
    console.error("Get Custom Field Error:", err.message);
    res.status(500).json({ message: "Server error fetching custom field" });
  }
};

/**
 * Handle updating a custom field
 */
export const updateCustomField = async (req: Request, res: Response) => {
  try {
    const fieldId = Number(req.params.id);
    const field = await CustomFieldService.updateCustomField(fieldId, req.body);
    res.json({ message: "Custom field updated successfully", field });
  } catch (err: any) {
    console.error("Update Custom Field Error:", err.message);
    res.status(500).json({ message: "Server error updating custom field" });
  }
};

/**
 * Handle deleting a custom field
 */
export const deleteCustomField = async (req: Request, res: Response) => {
  try {
    const fieldId = Number(req.params.id);
    const affectedRows = await CustomFieldService.deleteCustomField(fieldId);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Custom field not found" });
    }

    res.json({ message: "Custom field deleted successfully" });
  } catch (err: any) {
    console.error("Delete Custom Field Error:", err.message);
    res.status(500).json({ message: "Server error deleting custom field" });
  }
};

/**
 * Handle setting custom field values for an issue
 */
export const setCustomFieldValues = async (req: Request, res: Response) => {
  try {
    const issueId = Number(req.params.issueId);
    const fieldValues = req.body.fieldValues; // Array of { customFieldId, value }

    const values = await CustomFieldService.setCustomFieldValuesForIssue(issueId, fieldValues);
    res.json({ message: "Custom field values set successfully", values });
  } catch (err: any) {
    console.error("Set Custom Field Values Error:", err.message);
    res.status(500).json({ message: "Server error setting custom field values" });
  }
};

/**
 * Handle getting custom field values for an issue
 */
export const getCustomFieldValues = async (req: Request, res: Response) => {
  try {
    const issueId = Number(req.params.issueId);
    const values = await CustomFieldService.getCustomFieldValuesByIssue(issueId);
    res.json({ values });
  } catch (err: any) {
    console.error("Get Custom Field Values Error:", err.message);
    res.status(500).json({ message: "Server error fetching custom field values" });
  }
};

/**
 * Handle updating a custom field value
 */
export const updateCustomFieldValue = async (req: Request, res: Response) => {
  try {
    const valueId = Number(req.params.valueId);
    const { value } = req.body;

    const updatedValue = await CustomFieldService.updateCustomFieldValue(valueId, value);
    res.json({ message: "Custom field value updated successfully", value: updatedValue });
  } catch (err: any) {
    console.error("Update Custom Field Value Error:", err.message);
    res.status(500).json({ message: "Server error updating custom field value" });
  }
};