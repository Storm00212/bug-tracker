/**
 * WORKFLOW SERVICE
 *
 * Contains business logic for workflow operations.
 * Services handle workflow management, validation, and transition logic.
 */

import {
  createWorkflow,
  getWorkflowsByProject,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
  createWorkflowStep,
  getWorkflowSteps,
  createWorkflowTransition,
  getWorkflowTransitions,
  getWorkflowForIssue
} from "../repositories/workflowRepository.js";
import type { Workflow, WorkflowStep, WorkflowTransition, WorkflowValidationResult } from "../models/Workflow.js";

export class WorkflowService {
  /**
   * Create a new workflow
   */
  static async createWorkflow(workflowData: Omit<Workflow, "id" | "createdAt" | "updatedAt">): Promise<Workflow> {
    // Future business logic can be added here:
    // - Validate workflow name uniqueness within project
    // - Check user permissions
    // - Set as default if it's the first workflow for the project

    const workflow = await createWorkflow(workflowData);
    return workflow;
  }

  /**
   * Get all workflows for a project
   */
  static async getWorkflowsByProject(projectId: number): Promise<Workflow[]> {
    const workflows = await getWorkflowsByProject(projectId);
    return workflows;
  }

  /**
   * Get a specific workflow by ID
   */
  static async getWorkflowById(workflowId: number): Promise<Workflow | null> {
    return await getWorkflowById(workflowId);
  }

  /**
   * Update a workflow
   */
  static async updateWorkflow(workflowId: number, workflowData: Partial<Workflow>): Promise<Workflow> {
    // Future business logic can be added here:
    // - Validate workflow changes
    // - Check for circular references
    // - Update related issues if workflow changes

    return await updateWorkflow(workflowId, workflowData);
  }

  /**
   * Delete a workflow
   */
  static async deleteWorkflow(workflowId: number): Promise<number> {
    // Future business logic can be added here:
    // - Check if workflow is in use
    // - Prevent deletion of default workflows
    // - Reassign issues to default workflow

    const result = await deleteWorkflow(workflowId);
    return result || 0;
  }

  /**
   * Create a workflow step
   */
  static async createWorkflowStep(stepData: Omit<WorkflowStep, "id">): Promise<WorkflowStep> {
    const step = await createWorkflowStep(stepData);
    return step;
  }

  /**
   * Get all steps for a workflow
   */
  static async getWorkflowSteps(workflowId: number): Promise<WorkflowStep[]> {
    const steps = await getWorkflowSteps(workflowId);
    return steps.sort((a, b) => a.order - b.order);
  }

  /**
   * Create a workflow transition
   */
  static async createWorkflowTransition(transitionData: Omit<WorkflowTransition, "id">): Promise<WorkflowTransition> {
    const transition = await createWorkflowTransition(transitionData);
    return transition;
  }

  /**
   * Get all transitions for a workflow
   */
  static async getWorkflowTransitions(workflowId: number): Promise<WorkflowTransition[]> {
    const transitions = await getWorkflowTransitions(workflowId);
    return transitions;
  }

  /**
   * Validate if a status transition is allowed for an issue
   */
  static async validateTransition(
    issueId: number,
    currentStatus: string,
    newStatus: string,
    userId: number,
    userRoles: string[]
  ): Promise<WorkflowValidationResult> {
    try {
      // Get the workflow for this issue
      const workflow = await getWorkflowForIssue(issueId);

      if (!workflow) {
        return {
          isValid: false,
          errors: ["No workflow found for this issue"],
          warnings: [],
          allowedTransitions: []
        };
      }

      // Get workflow steps and transitions
      const steps = await this.getWorkflowSteps(workflow.id);
      const transitions = await this.getWorkflowTransitions(workflow.id);

      // Find current and target steps
      const currentStep = steps.find(step => step.status === currentStatus);
      const targetStep = steps.find(step => step.status === newStatus);

      if (!currentStep) {
        return {
          isValid: false,
          errors: [`Current status '${currentStatus}' not found in workflow`],
          warnings: [],
          allowedTransitions: []
        };
      }

      if (!targetStep) {
        return {
          isValid: false,
          errors: [`Target status '${newStatus}' not found in workflow`],
          warnings: [],
          allowedTransitions: []
        };
      }

      // Find valid transitions from current step
      const validTransitions = transitions.filter(t => t.fromStepId === currentStep.id);

      // Check if the target transition exists
      const targetTransition = validTransitions.find(t => t.toStepId === targetStep.id);

      if (!targetTransition) {
        const allowedTransitions = validTransitions.map(t => {
          const toStep = steps.find(s => s.id === t.toStepId);
          return {
            transitionId: t.id!,
            name: t.name,
            toStatus: toStep?.status || ""
          };
        });

        return {
          isValid: false,
          errors: [`Transition from '${currentStatus}' to '${newStatus}' is not allowed`],
          warnings: [],
          allowedTransitions
        };
      }

      // Check role permissions
      if (targetTransition.requiredRoles.length > 0) {
        const hasRequiredRole = targetTransition.requiredRoles.some(role => userRoles.includes(role));
        if (!hasRequiredRole) {
          return {
            isValid: false,
            errors: [`User does not have required role for this transition`],
            warnings: [],
            allowedTransitions: []
          };
        }
      }

      // TODO: Evaluate conditions for conditional transitions
      // TODO: Run validators
      // TODO: Execute post-functions

      return {
        isValid: true,
        errors: [],
        warnings: [],
        allowedTransitions: []
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [`Workflow validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        allowedTransitions: []
      };
    }
  }

  /**
   * Get allowed transitions for an issue's current status
   */
  static async getAllowedTransitions(issueId: number, userRoles: string[]): Promise<WorkflowTransition[]> {
    try {
      // Get the workflow for this issue
      const workflow = await getWorkflowForIssue(issueId);
      if (!workflow) return [];

      // Get current issue status (this would need to be passed or fetched)
      // For now, return all transitions - this should be filtered by current status
      const transitions = await this.getWorkflowTransitions(workflow.id);

      // Filter by user roles
      return transitions.filter(transition =>
        transition.requiredRoles.length === 0 ||
        transition.requiredRoles.some(role => userRoles.includes(role))
      );

    } catch (error) {
      console.error("Error getting allowed transitions:", error);
      return [];
    }
  }
}