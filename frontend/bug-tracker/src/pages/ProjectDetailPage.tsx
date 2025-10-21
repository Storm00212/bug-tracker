/**
 * PROJECT DETAIL PAGE COMPONENT
 *
 * Displays detailed information about a specific project.
 * Shows project bugs, statistics, and management options.
 * Allows admins to edit project details.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { ProjectService } from '../services/projectService';
import { BugService } from '../services/bugService';
import {
  FolderKanban,
  Edit,
  Trash2,
  Bug,
  Plus,
  Eye,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { gsap } from 'gsap';

// Form validation schema for editing projects
const editProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().optional(),
});

type EditProjectFormData = z.infer<typeof editProjectSchema>;

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  // Fetch project details
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => ProjectService.getProjectById(Number(id)),
    enabled: !!id,
  });

  // Fetch project bugs
  const { data: bugs, isLoading: bugsLoading } = useQuery({
    queryKey: ['project-bugs', id],
    queryFn: () => BugService.getBugsByProject(Number(id)),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: EditProjectFormData }) =>
      ProjectService.updateProject(projectId, data),
    onSuccess: () => {
      toast.success('Project updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowEditModal(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update project');
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: number) => ProjectService.deleteProject(projectId),
    onSuccess: () => {
      toast.success('Project deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Navigate back to projects list
      window.location.href = '/projects';
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete project');
    },
  });

  const onSubmit = (data: EditProjectFormData) => {
    if (id) {
      updateProjectMutation.mutate({ projectId: Number(id), data });
    }
  };

  const handleDelete = () => {
    if (id && window.confirm('Are you sure you want to delete this project? This will also delete all associated bugs and comments.')) {
      deleteProjectMutation.mutate(Number(id));
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
  }, [project]);

  // Calculate statistics
  const totalBugs = bugs?.length || 0;
  const openBugs = bugs?.filter(bug => bug.status === 'Open').length || 0;
  const inProgressBugs = bugs?.filter(bug => bug.status === 'In Progress').length || 0;
  const resolvedBugs = bugs?.filter(bug => bug.status === 'Resolved' || bug.status === 'Closed').length || 0;
  const criticalBugs = bugs?.filter(bug => bug.severity === 'critical').length || 0;

  const isLoading = projectLoading || bugsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <FolderKanban className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-base-content mb-2">Project not found</h3>
        <p className="text-base-content/70 mb-6">The project you're looking for doesn't exist.</p>
        <Link to="/projects" className="btn btn-tech-primary glow-primary">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center glow-primary">
            <FolderKanban className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-accent">{project.name}</h1>
            <p className="text-base-content/70 mt-1">{project.description || 'No description provided'}</p>
            <div className="flex items-center text-sm text-base-content/60 mt-2">
              <Calendar className="h-4 w-4 mr-1" />
              Created {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>

        {hasRole('Admin') && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="btn btn-tech-outline glow-secondary"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-outline btn-error glow-secondary"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Project
            </button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content/70 text-sm font-medium">Total Bugs</p>
              <p className="text-3xl font-bold gradient-accent">{totalBugs}</p>
            </div>
            <Bug className="h-8 w-8 text-accent-primary glow-secondary" />
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content/70 text-sm font-medium">Open</p>
              <p className="text-3xl font-bold text-warning">{openBugs}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-warning glow-secondary" />
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content/70 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-info">{inProgressBugs}</p>
            </div>
            <Clock className="h-8 w-8 text-info glow-secondary" />
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content/70 text-sm font-medium">Resolved</p>
              <p className="text-3xl font-bold text-success">{resolvedBugs}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-success glow-secondary" />
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content/70 text-sm font-medium">Critical</p>
              <p className="text-3xl font-bold text-error">{criticalBugs}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-error glow-secondary" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
        <h2 className="text-xl font-semibold mb-4 gradient-accent">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to={`/bugs/new?projectId=${id}`}
            className="btn btn-tech-primary glow-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Report Bug
          </Link>
          <Link
            to={`/bugs?projectId=${id}`}
            className="btn btn-tech-outline glow-secondary"
          >
            <Eye className="h-4 w-4 mr-2" />
            View All Bugs
          </Link>
        </div>
      </div>

      {/* Recent Bugs */}
      {bugs && bugs.length > 0 && (
        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold gradient-accent">Recent Bugs</h2>
            <Link
              to={`/bugs?projectId=${id}`}
              className="text-accent-primary hover:text-accent-secondary text-sm font-medium transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {bugs.slice(0, 5).map((bug) => (
              <Link
                key={bug.id}
                to={`/bugs/${bug.id}`}
                className="block p-4 border border-accent-primary/30 rounded-lg hover:bg-gradient-to-r hover:from-accent-primary/5 hover:to-accent-secondary/5 transition-all duration-300 glow-secondary"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-base-content">{bug.title}</h3>
                      <span className={`badge ${bug.status === 'Open' ? 'badge-warning' : bug.status === 'In Progress' ? 'badge-info' : 'badge-success'}`}>
                        {bug.status || 'Open'}
                      </span>
                      <span className={`badge badge-outline ${bug.severity === 'critical' ? 'text-error' : bug.severity === 'high' ? 'text-warning' : bug.severity === 'medium' ? 'text-info' : 'text-success'}`}>
                        {bug.severity}
                      </span>
                    </div>
                    <p className="text-base-content/70 text-sm line-clamp-2">{bug.description}</p>
                  </div>
                  <Eye className="h-5 w-5 text-accent-primary flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100 border border-accent-primary glow-primary">
            <h3 className="font-bold text-lg mb-4 gradient-accent">Edit Project</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text text-base-content">Project Name</span>
                </label>
                <input
                  type="text"
                  defaultValue={project.name}
                  className={`input input-tech w-full focus-glow ${errors.name ? 'input-error' : ''}`}
                  {...register('name')}
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.name.message}</span>
                  </label>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text text-base-content">Description (Optional)</span>
                </label>
                <textarea
                  className="textarea input-tech w-full focus-glow"
                  rows={3}
                  defaultValue={project.description || ''}
                  {...register('description')}
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-tech-outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-tech-primary glow-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <LoadingSpinner size="sm" /> : null}
                  Update Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;