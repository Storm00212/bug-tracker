/**
 * ISSUES PAGE COMPONENT
 *
 * Enhanced version of BugsPage with full Jira-like functionality
 * Supports all issue types, advanced filtering, and Kanban view
 */

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { IssueService } from '../services/issueService';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  Grid3X3,
  List,
  KanbanSquare,
  BarChart3
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import IssueTypeIcon from '../components/IssueTypeIcon';
import PriorityIcon from '../components/PriorityIcon';
import StatusBadge from '../components/StatusBadge';
import { gsap } from 'gsap';

type ViewMode = 'list' | 'kanban' | 'board';

const IssuesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const pageRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Fetch all issues
  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ['issues', { statusFilter, priorityFilter, typeFilter, assigneeFilter }],
    queryFn: () => IssueService.getAllIssues({
      status: statusFilter.length > 0 ? statusFilter : undefined,
      priority: priorityFilter.length > 0 ? priorityFilter : undefined,
      type: typeFilter.length > 0 ? typeFilter : undefined,
      assigneeId: assigneeFilter || undefined,
    }),
  });

  // Filter issues based on search term
  const filteredIssues = issues?.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.key?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  // Calculate statistics
  const totalIssues = filteredIssues.length;
  const openIssues = filteredIssues.filter(issue => issue.status === 'Open' || issue.status === 'To Do').length;
  const inProgressIssues = filteredIssues.filter(issue => issue.status === 'In Progress' || issue.status === 'In Review').length;
  const doneIssues = filteredIssues.filter(issue => issue.status === 'Resolved' || issue.status === 'Closed' || issue.status === 'Done').length;
  const criticalIssues = filteredIssues.filter(issue => issue.priority === 'Highest' || issue.priority === 'High').length;

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
  }, [totalIssues, openIssues, inProgressIssues, doneIssues, criticalIssues]);

  const handleStatusFilterChange = (status: string, checked: boolean) => {
    if (checked) {
      setStatusFilter(prev => [...prev, status]);
    } else {
      setStatusFilter(prev => prev.filter(s => s !== status));
    }
  };

  const handlePriorityFilterChange = (priority: string, checked: boolean) => {
    if (checked) {
      setPriorityFilter(prev => [...prev, priority]);
    } else {
      setPriorityFilter(prev => prev.filter(p => p !== priority));
    }
  };

  const handleTypeFilterChange = (type: string, checked: boolean) => {
    if (checked) {
      setTypeFilter(prev => [...prev, type]);
    } else {
      setTypeFilter(prev => prev.filter(t => t !== type));
    }
  };

  const clearAllFilters = () => {
    setStatusFilter([]);
    setPriorityFilter([]);
    setTypeFilter([]);
    setAssigneeFilter(null);
    setSearchTerm('');
  };

  if (issuesLoading) {
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
          <h1 className="text-3xl font-bold gradient-accent">Issues</h1>
          <p className="text-base-content/70 mt-1">
            Track and manage all issues across projects
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="btn-group">
            <button
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-active' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              <KanbanSquare className="h-4 w-4" />
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'board' ? 'btn-active' : ''}`}
              onClick={() => setViewMode('board')}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>

          <Link to="/issues/new" className="btn btn-tech-primary glow-primary pulse-glow">
            <Plus className="h-4 w-4 mr-2" />
            Create Issue
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content/70 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold gradient-accent">{totalIssues}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-accent-primary glow-secondary" />
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content/70 text-sm font-medium">Open</p>
              <p className="text-3xl font-bold text-yellow-600">{openIssues}</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600 glow-secondary" />
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content/70 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{inProgressIssues}</p>
            </div>
            <Filter className="h-8 w-8 text-blue-600 glow-secondary" />
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content/70 text-sm font-medium">Done</p>
              <p className="text-3xl font-bold text-green-600">{doneIssues}</p>
            </div>
            <Eye className="h-8 w-8 text-green-600 glow-secondary" />
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content/70 text-sm font-medium">High Priority</p>
              <p className="text-3xl font-bold text-red-600">{criticalIssues}</p>
            </div>
            <PriorityIcon priority="Highest" size={32} />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
          <input
            type="text"
            placeholder="Search issues by key, title, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-tech w-full pl-10 focus-glow"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-outline btn-sm">
              Status ({statusFilter.length})
            </label>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              {['Open', 'In Progress', 'Resolved', 'Closed', 'To Do', 'In Review', 'Done', 'Backlog'].map(status => (
                <li key={status}>
                  <label className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusFilter.includes(status)}
                      onChange={(e) => handleStatusFilterChange(status, e.target.checked)}
                      className="checkbox checkbox-sm"
                    />
                    <span className="ml-2">{status}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Priority Filter */}
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-outline btn-sm">
              Priority ({priorityFilter.length})
            </label>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              {['Lowest', 'Low', 'Medium', 'High', 'Highest'].map(priority => (
                <li key={priority}>
                  <label className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={priorityFilter.includes(priority)}
                      onChange={(e) => handlePriorityFilterChange(priority, e.target.checked)}
                      className="checkbox checkbox-sm"
                    />
                    <span className="ml-2">{priority}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Type Filter */}
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-outline btn-sm">
              Type ({typeFilter.length})
            </label>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              {['Bug', 'Task', 'Story', 'Epic', 'Subtask'].map(type => (
                <li key={type}>
                  <label className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={typeFilter.includes(type)}
                      onChange={(e) => handleTypeFilterChange(type, e.target.checked)}
                      className="checkbox checkbox-sm"
                    />
                    <span className="ml-2 flex items-center">
                      <IssueTypeIcon type={type as 'Bug' | 'Task' | 'Story' | 'Epic' | 'Subtask'} size={14} className="mr-1" />
                      {type}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {(statusFilter.length > 0 || priorityFilter.length > 0 || typeFilter.length > 0 || searchTerm) && (
            <button
              onClick={clearAllFilters}
              className="btn btn-ghost btn-sm text-error"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Issues Display */}
      {filteredIssues.length === 0 ? (
        <div className="text-center py-12">
          <Grid3X3 className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-base-content mb-2">
            {searchTerm || statusFilter.length > 0 || priorityFilter.length > 0 || typeFilter.length > 0
              ? 'No issues found'
              : 'No issues created yet'}
          </h3>
          <p className="text-base-content/70 mb-6">
            {searchTerm || statusFilter.length > 0 || priorityFilter.length > 0 || typeFilter.length > 0
              ? 'Try adjusting your search or filters'
              : 'Be the first to create an issue'}
          </p>
          {!searchTerm && statusFilter.length === 0 && priorityFilter.length === 0 && typeFilter.length === 0 && (
            <Link to="/issues/new" className="btn btn-tech-primary glow-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create First Issue
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-base-100 shadow-lg rounded-lg card-hover glow-primary">
          <div className="p-6">
            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="border border-accent-primary/30 rounded-lg p-4 hover:bg-gradient-to-r hover:from-accent-primary/5 hover:to-accent-secondary/5 transition-all duration-300 glow-secondary"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <IssueTypeIcon type={issue.type} />
                        <Link
                          to={`/issues/${issue.id}`}
                          className="text-lg font-semibold gradient-accent hover:text-accent-secondary transition-colors"
                        >
                          {issue.key ? `${issue.key}: ` : ''}{issue.title}
                        </Link>
                        <StatusBadge status={issue.status} />
                        <PriorityIcon priority={issue.priority} showLabel />
                      </div>

                      <p className="text-base-content/70 mb-3 line-clamp-2">
                        {issue.description}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-base-content/60">
                        {issue.labels.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <span>Labels:</span>
                            {issue.labels.map((label, index) => (
                              <span key={index} className="badge badge-outline badge-sm">{label}</span>
                            ))}
                          </div>
                        )}
                        {issue.components.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <span>Components:</span>
                            {issue.components.map((component, index) => (
                              <span key={index} className="badge badge-primary badge-sm">{component}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/issues/${issue.id}`}
                      className="btn btn-tech-outline btn-sm glow-secondary"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesPage;