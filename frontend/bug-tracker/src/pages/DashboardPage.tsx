/**
 * DASHBOARD PAGE COMPONENT
 *
 * Main dashboard showing project overview and key metrics.
 * Displays recent activity, project statistics, and quick actions.
 * Role-based content for different user types.
 */

import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { ProjectService } from '../services/projectService';
import { BugService } from '../services/bugService';
import {
  FolderKanban,
  Bug,
  Plus,
  Eye,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { gsap } from 'gsap';

const DashboardPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const pageRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Fetch projects data
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: ProjectService.getAllProjects,
  });

  // Fetch bugs data (simplified - in real app you'd want paginated results)
  const { data: bugs, isLoading: bugsLoading } = useQuery({
    queryKey: ['bugs'],
    queryFn: BugService.getAllBugs,
    enabled: hasRole('Admin') || hasRole('Developer'), // Only fetch for relevant roles
  });

  const isLoading = projectsLoading || bugsLoading;

  // Calculate statistics
  const totalProjects = projects?.length || 0;
  const totalBugs = bugs?.length || 0;
  const openBugs = bugs?.filter(bug => bug.status === 'Open' || bug.status === 'In Progress').length || 0;
  const criticalBugs = bugs?.filter(bug => bug.severity === 'critical').length || 0;

  // Get recent projects (last 3)
  const recentProjects = projects?.slice(0, 3) || [];

  // GSAP animations
  useEffect(() => {
    if (statsRef.current) {
      gsap.fromTo(statsRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.3
        }
      );
    }
  }, [totalProjects, totalBugs, openBugs, criticalBugs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div ref={pageRef} className="space-y-6 fade-in-up">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-accent-primary via-accent-secondary to-accent-tertiary rounded-lg p-6 text-white glow-primary">
        <h1 className="text-3xl font-bold mb-2 gradient-accent">Welcome back, {user?.username}!</h1>
        <p className="text-white/80">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Projects Card */}
        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content/70 text-sm font-medium">Total Projects</p>
              <p className="text-3xl font-bold gradient-accent">{totalProjects}</p>
            </div>
            <FolderKanban className="h-8 w-8 text-accent-primary glow-secondary" />
          </div>
        </div>

        {/* Bugs Card */}
        {(hasRole('Admin') || hasRole('Developer')) && (
          <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/70 text-sm font-medium">Total Bugs</p>
                <p className="text-3xl font-bold text-accent-secondary">{totalBugs}</p>
              </div>
              <Bug className="h-8 w-8 text-accent-secondary glow-secondary" />
            </div>
          </div>
        )}

        {/* Open Bugs Card */}
        {(hasRole('Admin') || hasRole('Developer')) && (
          <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/70 text-sm font-medium">Open Bugs</p>
                <p className="text-3xl font-bold text-warning">{openBugs}</p>
              </div>
              <Clock className="h-8 w-8 text-warning glow-secondary" />
            </div>
          </div>
        )}

        {/* Critical Bugs Card */}
        {(hasRole('Admin') || hasRole('Developer')) && (
          <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/70 text-sm font-medium">Critical Bugs</p>
                <p className="text-3xl font-bold text-error">{criticalBugs}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-error glow-secondary" />
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
        <h2 className="text-xl font-semibold mb-4 gradient-accent">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hasRole('Admin') && (
            <Link
              to="/projects"
              className="flex items-center p-4 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 hover:from-accent-primary/20 hover:to-accent-secondary/20 rounded-lg transition-all duration-300 glow-secondary"
            >
              <Plus className="h-6 w-6 text-accent-primary mr-3" />
              <div>
                <p className="font-medium text-base-content">Create Project</p>
                <p className="text-sm text-base-content/70">Start a new project</p>
              </div>
            </Link>
          )}

          <Link
            to="/bugs"
            className="flex items-center p-4 bg-gradient-to-br from-accent-secondary/10 to-accent-tertiary/10 hover:from-accent-secondary/20 hover:to-accent-tertiary/20 rounded-lg transition-all duration-300 glow-secondary"
          >
            <Bug className="h-6 w-6 text-accent-secondary mr-3" />
            <div>
              <p className="font-medium text-base-content">Report Bug</p>
              <p className="text-sm text-base-content/70">Submit a new bug report</p>
            </div>
          </Link>

          <Link
            to="/projects"
            className="flex items-center p-4 bg-gradient-to-br from-accent-tertiary/10 to-accent-primary/10 hover:from-accent-tertiary/20 hover:to-accent-primary/20 rounded-lg transition-all duration-300 glow-secondary"
          >
            <Eye className="h-6 w-6 text-accent-tertiary mr-3" />
            <div>
              <p className="font-medium text-base-content">View Projects</p>
              <p className="text-sm text-base-content/70">Browse all projects</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold gradient-accent">Recent Projects</h2>
            <Link
              to="/projects"
              className="text-accent-primary hover:text-accent-secondary text-sm font-medium transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="block p-4 border border-accent-primary/30 rounded-lg hover:bg-gradient-to-r hover:from-accent-primary/5 hover:to-accent-secondary/5 transition-all duration-300 glow-secondary"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-base-content">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-base-content/70 mt-1">{project.description}</p>
                    )}
                  </div>
                  <FolderKanban className="h-5 w-5 text-accent-primary" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started for New Users */}
      {totalProjects === 0 && (
        <div className="bg-base-100 shadow-lg rounded-lg p-6 text-center card-hover glow-primary">
          <FolderKanban className="h-16 w-16 text-accent-primary mx-auto mb-4 glow-secondary" />
          <h2 className="text-xl font-semibold mb-2 gradient-accent">Welcome to Bug Tracker!</h2>
          <p className="text-base-content/70 mb-6">
            Get started by creating your first project or exploring existing ones.
          </p>
          {hasRole('Admin') && (
            <Link
              to="/projects"
              className="btn btn-tech-primary glow-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;