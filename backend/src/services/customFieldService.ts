/**
 * CUSTOM FIELD SERVICE
 *
 * Contains business logic for custom field operations.
 * Services handle core application logic for managing custom fields
 * and their values within issues.
 */

import { createCustomField, getCustomFieldsByProject, getCustomFieldById, updateCustomField, deleteCustomField } from "../repositories/customFieldRepository.js";
import { createCustomFieldValue, getCustomFieldValuesByIssue, updateCustomFieldValue, deleteCustomFieldValuesByIssue } from "../repositories/customFieldValueRepository.js";
import type { CustomField, CustomFieldValue } from "../models/CustomField.js";

export class CustomFieldService {
  /**
   * Create a new custom field
   */
  static async createCustomField(fieldData: Omit<CustomField, "id" | "createdAt" | "updatedAt">): Promise<CustomField> {
    // Future business logic can be added here:
    // - Validate field name uniqueness within project
    // - Check user permissions to create fields in this project
    // - Validate field configuration based on type
    // - Set default order if not provided

    const newField = await createCustomField(fieldData);
    return newField;
  }

  /**
   * Get all custom fields for a project
   */
  static async getCustomFieldsByProject(projectId: number): Promise<CustomField[]> {
    const fields = await getCustomFieldsByProject(projectId);

    // Future business logic can be added here:
    // - Filter fields based on user permissions
    // - Sort fields by order
    // - Include field usage statistics

    return fields;
  }

  /**
   * Get a specific custom field by ID
   */
  static async getCustomFieldById(fieldId: number): Promise<CustomField | null> {
    return await getCustomFieldById(fieldId);
  }

  /**
   * Update a custom field
   */
  static async updateCustomField(fieldId: number, fieldData: Partial<CustomField>): Promise<CustomField> {
    // Future business logic can be added here:
    // - Validate field name uniqueness
    // - Check if field can be modified (existing values)
    // - Update field order and reorder other fields
    // - Validate configuration changes

    return await updateCustomField(fieldId, fieldData);
  }

  /**
   * Delete a custom field
   */
  static async deleteCustomField(fieldId: number): Promise<number> {
    // Future business logic can be added here:
    // - Check if field has values and handle cleanup
    // - Check user permissions
    // - Update field orders for remaining fields

    const result = await deleteCustomField(fieldId);
    return result || 0;
  }

  /**
   * Set custom field value for an issue
   */
  static async setCustomFieldValue(issueId: number, customFieldId: number, value: any): Promise<CustomFieldValue> {
    // Future business logic can be added here:
    // - Validate field exists and belongs to issue's project
    // - Validate value against field configuration
    // - Check user permissions to set this field

    const fieldValue = await createCustomFieldValue({
      issueId,
      customFieldId,
      value
    });

    return fieldValue;
  }

  /**
   * Get all custom field values for an issue
   */
  static async getCustomFieldValuesByIssue(issueId: number): Promise<CustomFieldValue[]> {
    const values = await getCustomFieldValuesByIssue(issueId);

    // Future business logic can be added here:
    // - Include field metadata with values
    // - Filter based on user permissions

    return values;
  }

  /**
   * Update custom field value
   */
  static async updateCustomFieldValue(valueId: number, value: any): Promise<CustomFieldValue> {
    // Future business logic can be added here:
    // - Validate value against field configuration
    // - Check user permissions

    return await updateCustomFieldValue(valueId, { value });
  }

  /**
   * Delete all custom field values for an issue
   */
  static async deleteCustomFieldValuesByIssue(issueId: number): Promise<void> {
    await deleteCustomFieldValuesByIssue(issueId);
  }

  /**
   * Bulk set custom field values for an issue
   */
  static async setCustomFieldValuesForIssue(issueId: number, fieldValues: { customFieldId: number; value: any }[]): Promise<CustomFieldValue[]> {
    const results: CustomFieldValue[] = [];

    for (const fieldValue of fieldValues) {
      const result = await this.setCustomFieldValue(issueId, fieldValue.customFieldId, fieldValue.value);
      results.push(result);
    }

    return results;
  }
}