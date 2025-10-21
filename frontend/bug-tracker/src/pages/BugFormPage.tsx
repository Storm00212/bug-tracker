/**
 * BUG FORM PAGE COMPONENT
 *
 * Form for creating new bugs or editing existing ones.
 * Includes form validation, project selection, and role-based features.
 * Supports both "Report Bug" and "Edit Bug" modes.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { ProjectService } from '../services/projectService';
import { BugService } from '../services/bugService';
import {
  Bug,
  ArrowLeft,
  Save,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { gsap } from 'gsap';

// Form validation schema
const bugFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
  description: z.string().min(5, 'Description must be at least 5 characters').max(1000, 'Description is too long'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  projectId: z.number().min(1, 'Please select a project'),
  developerId: z.number().optional(),
});

type BugFormData = z.infer<typeof bugFormSchema>;

const BugFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const pageRef = useRef<HTMLDivElement>(null);

  const isEditMode = !!id;
  const projectIdFromUrl = searchParams.get('projectId');

  // Fetch projects for dropdown
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: ProjectService.getAllProjects,
  });

  // Fetch bug data if in edit mode
  const { data: bugData, isLoading: bugLoading } = useQuery({
    queryKey: ['bug', id],
    queryFn: () => BugService.getBugById(Number(id)),
    enabled: isEditMode,
  });

  const bug = bugData?.bug;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BugFormData>({
    resolver: zodResolver(bugFormSchema),
    defaultValues: {
      severity: 'medium',
    },
  });

  // Create bug mutation
  const createBugMutation = useMutation({
    mutationFn: (data: BugFormData) => BugService.createBug({
      ...data,
      reporterId: user?.id || 0,
      status: 'Open',
    }),
    onSuccess: () => {
      toast.success('Bug reported successfully!');
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      navigate('/bugs');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to report bug');
    },
  });

  // Update bug mutation
  const updateBugMutation = useMutation({
    mutationFn: ({ bugId, data }: { bugId: number; data: Partial<BugFormData> }) =>
      BugService.updateBug(bugId, data),
    onSuccess: () => {
      toast.success('Bug updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['bug', id] });
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      navigate(`/bugs/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update bug');
    },
  });

  // Set form values when editing
  useEffect(() => {
    if (isEditMode && bug) {
      setValue('title', bug.title);
      setValue('description', bug.description);
      setValue('severity', bug.severity);
      setValue('projectId', bug.projectId);
      if (bug.developerId) {
        setValue('developerId', bug.developerId);
      }
    } else if (projectIdFromUrl) {
      setValue('projectId', Number(projectIdFromUrl));
    }
  }, [bug, isEditMode, projectIdFromUrl, setValue]);

  const onSubmit = (data: BugFormData) => {
    if (isEditMode && id) {
      updateBugMutation.mutate({ bugId: Number(id), data });
    } else {
      createBugMutation.mutate(data);
    }
  };

  // GSAP animations
  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(pageRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  const isLoading = projectsLoading || (isEditMode && bugLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div ref={pageRef} className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/bugs" className="btn btn-ghost btn-sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bugs
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center glow-primary">
            <Bug className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-accent">
              {isEditMode ? 'Edit Bug' : 'Report New Bug'}
            </h1>
            <p className="text-base-content/70 mt-1">
              {isEditMode ? 'Update bug information and status' : 'Submit a detailed bug report'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title Field */}
          <div>
            <label className="label">
              <span className="label-text text-base-content font-medium">Bug Title</span>
            </label>
            <input
              type="text"
              className={`input input-tech w-full focus-glow ${errors.title ? 'input-error' : ''}`}
              placeholder="Brief, descriptive title for the bug"
              {...register('title')}
            />
            {errors.title && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.title.message}</span>
              </label>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="label">
              <span className="label-text text-base-content font-medium">Description</span>
            </label>
            <textarea
              className={`textarea input-tech w-full focus-glow ${errors.description ? 'textarea-error' : ''}`}
              rows={6}
              placeholder="Detailed description including steps to reproduce, expected behavior, and actual behavior"
              {...register('description')}
            />
            {errors.description && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.description.message}</span>
              </label>
            )}
          </div>

          {/* Severity and Project Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Severity Field */}
            <div>
              <label className="label">
                <span className="label-text text-base-content font-medium">Severity</span>
              </label>
              <select
                className={`select select-tech w-full focus-glow ${errors.severity ? 'select-error' : ''}`}
                {...register('severity')}
              >
                <option value="low">Low - Minor issue, no immediate impact</option>
                <option value="medium">Medium - Affects functionality but has workarounds</option>
                <option value="high">High - Major functionality broken, affects many users</option>
                <option value="critical">Critical - System down, no workarounds available</option>
              </select>
              {errors.severity && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.severity.message}</span>
                </label>
              )}
            </div>

            {/* Project Field */}
            <div>
              <label className="label">
                <span className="label-text text-base-content font-medium">Project</span>
              </label>
              <select
                className={`select select-tech w-full focus-glow ${errors.projectId ? 'select-error' : ''}`}
                {...register('projectId', { valueAsNumber: true })}
              >
                <option value="">Select a project</option>
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.projectId.message}</span>
                </label>
              )}
            </div>
          </div>

          {/* Developer Assignment (for Admins and Testers) */}
          {(hasRole('Admin') || hasRole('Tester')) && (
            <div>
              <label className="label">
                <span className="label-text text-base-content font-medium">Assign Developer (Optional)</span>
              </label>
              <select
                className="select select-tech w-full focus-glow"
                {...register('developerId', { valueAsNumber: true })}
              >
                <option value="">Unassigned - will be assigned later</option>
                {/* In a real app, you'd fetch users with Developer role */}
                <option value="1">Developer 1</option>
                <option value="2">Developer 2</option>
              </select>
              <p className="text-xs text-base-content/60 mt-1">
                Developers can be assigned later if not specified now
              </p>
            </div>
          )}

          {/* Severity Guidelines */}
          <div className="bg-base-200 rounded-lg p-4">
            <h3 className="font-medium mb-3 text-base-content">Severity Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-info mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-info">Low:</span> Cosmetic issues, minor inconveniences
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-warning">Medium:</span> Functional issues with workarounds
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-error mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-error">High:</span> Major functionality broken
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-error mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-error">Critical:</span> System unusable, blocking all work
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link to="/bugs" className="btn btn-tech-outline">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-tech-primary glow-primary"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  {isEditMode ? 'Updating...' : 'Reporting...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Update Bug' : 'Report Bug'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BugFormPage;