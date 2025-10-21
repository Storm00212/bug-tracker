/**
 * PROJECTS PAGE COMPONENT
 *
 * Displays all projects with filtering and search capabilities.
 * Allows admins to create new projects and all users to view project details.
 * Includes project statistics and management actions.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { ProjectService } from '../services/projectService';
import { BugService } from '../services/bugService';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Eye,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { gsap } from 'gsap';

// Form validation schema for creating projects
const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

const ProjectsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const projectsGridRef = useRef<HTMLDivElement>(null);

  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: ProjectService.getAllProjects,
  });

  // Fetch bugs for project statistics
  const { data: bugs } = useQuery({
    queryKey: ['bugs'],
    queryFn: BugService.getAllBugs,
    enabled: hasRole('Admin') || hasRole('Developer'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: ProjectService.createProject,
    onSuccess: () => {
      toast.success('Project created successfully!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowCreateModal(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create project');
    },
  });

  const onSubmit = (data: CreateProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  // Filter projects based on search term
  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // GSAP animations
  useEffect(() => {
    if (projectsGridRef.current) {
      gsap.fromTo(projectsGridRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.2
        }
      );
    }
  }, [filteredProjects]);

  // Button hover animations
  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      duration: 0.2,
      ease: 'power2.out'
    });
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.out'
    });
  };

  // Get bug count for each project
  const getProjectBugCount = (projectId: number) => {
    return bugs?.filter(bug => bug.projectId === projectId).length || 0;
  };

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div ref={pageRef} className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-accent">Projects</h1>
          <p className="text-base-content/70 mt-1">
            Manage and track all your projects
          </p>
        </div>

        {hasRole('Admin') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-tech-primary glow-primary pulse-glow"
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
        </div>
        <button className="btn btn-outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <FolderKanban className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-base-content mb-2">
            {searchTerm ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-base-content/70 mb-6">
            {searchTerm
              ? 'Try adjusting your search terms'
              : hasRole('Admin')
                ? 'Create your first project to get started'
                : 'Projects will appear here once created'
            }
          </p>
          {hasRole('Admin') && !searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-tech-primary glow-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div ref={projectsGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center mr-3 glow-primary">
                    <FolderKanban className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base-content">{project.name}</h3>
                    <p className="text-sm text-base-content/70">
                      {project.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="dropdown dropdown-end">
                  <button className="btn btn-ghost btn-sm">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li>
                      <Link to={`/projects/${project.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </li>
                    {hasRole('Admin') && (
                      <>
                        <li>
                          <a>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Project
                          </a>
                        </li>
                        <li>
                          <a className="text-error">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                          </a>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-accent">
                    {getProjectBugCount(project.id!)}
                  </div>
                  <div className="text-xs text-base-content/70">Bugs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-secondary">
                    {/* Active team members - placeholder for now */}
                    0
                  </div>
                  <div className="text-xs text-base-content/70">Team</div>
                </div>
              </div>

              {/* View Details Button */}
              <Link
                to={`/projects/${project.id}`}
                className="btn btn-tech-outline btn-sm w-full elastic-scale"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100 border border-accent-primary glow-primary">
            <h3 className="font-bold text-lg mb-4 gradient-accent">Create New Project</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text text-base-content">Project Name</span>
                </label>
                <input
                  type="text"
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
                  {...register('description')}
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-tech-outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-tech-primary glow-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <LoadingSpinner size="sm" /> : null}
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;