/**
 * BUGS PAGE COMPONENT
 *
 * Displays all bugs with filtering and search capabilities.
 * Allows users to view bug details and create new bugs.
 * Includes bug statistics and management actions.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BugService } from '../services/bugService';
import {
  Bug,
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Users
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { gsap } from 'gsap';

const BugsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const pageRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Fetch all bugs
  const { data: bugs, isLoading: bugsLoading } = useQuery({
    queryKey: ['bugs'],
    queryFn: BugService.getAllBugs,
  });

  // Filter bugs based on search term and filters
  const filteredBugs = bugs?.filter(bug => {
    const matchesSearch = bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bug.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || bug.status === statusFilter;
    const matchesSeverity = !severityFilter || bug.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  }) || [];

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-error';
      case 'high': return 'text-warning';
      case 'medium': return 'text-info';
      case 'low': return 'text-success';
      default: return 'text-base-content';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'badge-warning';
      case 'In Progress': return 'badge-info';
      case 'Resolved': return 'badge-success';
      case 'Closed': return 'badge-neutral';
      default: return 'badge-neutral';
    }
  };

  // Calculate statistics
  const totalBugs = bugs?.length || 0;
  const openBugs = bugs?.filter(bug => bug.status === 'Open').length || 0;
  const inProgressBugs = bugs?.filter(bug => bug.status === 'In Progress').length || 0;
  const resolvedBugs = bugs?.filter(bug => bug.status === 'Resolved' || bug.status === 'Closed').length || 0;
  const criticalBugs = bugs?.filter(bug => bug.severity === 'critical').length || 0;

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
  }, [totalBugs, openBugs, inProgressBugs, resolvedBugs, criticalBugs]);

  // Update stats when filters change
  const filteredStats = {
    totalBugs: filteredBugs.length,
    openBugs: filteredBugs.filter(bug => bug.status === 'Open').length,
    inProgressBugs: filteredBugs.filter(bug => bug.status === 'In Progress').length,
    resolvedBugs: filteredBugs.filter(bug => bug.status === 'Resolved' || bug.status === 'Closed').length,
    criticalBugs: filteredBugs.filter(bug => bug.severity === 'critical').length,
  };

  if (bugsLoading) {
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
          <h1 className="text-3xl font-bold gradient-accent">Bugs</h1>
          <p className="text-base-content/70 mt-1">
            Track and manage all reported bugs
          </p>
        </div>

        <Link to="/bugs/new" className="btn btn-tech-primary glow-primary pulse-glow">
          <Plus className="h-4 w-4 mr-2" />
          Report Bug
        </Link>
      </div>

      {/* Statistics Cards */}
      <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content/70 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold gradient-accent">{filteredStats.totalBugs}</p>
            </div>
            <Bug className="h-8 w-8 text-accent-primary glow-secondary" />
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content/70 text-sm font-medium">Open</p>
              <p className="text-3xl font-bold text-warning">{filteredStats.openBugs}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-warning glow-secondary" />
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content/70 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-info">{filteredStats.inProgressBugs}</p>
            </div>
            <Clock className="h-8 w-8 text-info glow-secondary" />
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content/70 text-sm font-medium">Resolved</p>
              <p className="text-3xl font-bold text-success">{filteredStats.resolvedBugs}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-success glow-secondary" />
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content/70 text-sm font-medium">Critical</p>
              <p className="text-3xl font-bold text-error">{filteredStats.criticalBugs}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-error glow-secondary" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
          <input
            type="text"
            placeholder="Search bugs by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-tech w-full pl-10 focus-glow"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Bugs List */}
      {filteredBugs.length === 0 ? (
        <div className="text-center py-12">
          <Bug className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-base-content mb-2">
            {searchTerm ? 'No bugs found' : 'No bugs reported yet'}
          </h3>
          <p className="text-base-content/70 mb-6">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Be the first to report a bug'
            }
          </p>
          {!searchTerm && (
            <Link to="/bugs/new" className="btn btn-tech-primary glow-primary">
              <Plus className="h-4 w-4 mr-2" />
              Report First Bug
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-base-100 shadow-lg rounded-lg card-hover glow-primary">
          <div className="p-6">
            <div className="space-y-4">
              {filteredBugs.map((bug) => (
                <div
                  key={bug.id}
                  className="border border-accent-primary/30 rounded-lg p-4 hover:bg-gradient-to-r hover:from-accent-primary/5 hover:to-accent-secondary/5 transition-all duration-300 glow-secondary"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Link
                          to={`/bugs/${bug.id}`}
                          className="text-lg font-semibold gradient-accent hover:text-accent-secondary transition-colors"
                        >
                          {bug.title}
                        </Link>
                        <span className={`badge ${getStatusColor(bug.status || 'Open')}`}>
                          {bug.status || 'Open'}
                        </span>
                        <span className={`badge badge-outline ${getSeverityColor(bug.severity)}`}>
                          {bug.severity}
                        </span>
                      </div>

                      <p className="text-base-content/70 mb-3 line-clamp-2">
                        {bug.description}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-base-content/60">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Reporter ID: {bug.reporterId}
                        </div>
                        {bug.developerId && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            Developer ID: {bug.developerId}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {bug.createdAt ? new Date(bug.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/bugs/${bug.id}`}
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

export default BugsPage;