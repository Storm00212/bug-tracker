/**
 * ADMIN DASHBOARD PAGE COMPONENT
 *
 * Administrative interface for system management.
 * Displays analytics, user management, and system reports.
 * Restricted to Admin role only.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { ProjectService } from '../services/projectService';
import { BugService } from '../services/bugService';
import {
  Shield,
  Users,
  FolderKanban,
  Bug,
  BarChart3,
  FileText,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { gsap } from 'gsap';

import { AdminService } from '../services/adminService';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const pageRef = useRef<HTMLDivElement>(null);

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: AdminService.getAnalytics,
  });

  // Fetch users data
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: AdminService.getUsers,
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      AdminService.updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('User role updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user role');
    },
  });

  // GSAP animations
  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(pageRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  const handleRoleUpdate = (userId: number, newRole: 'Admin' | 'Developer' | 'Tester') => {
    updateUserRoleMutation.mutate({ userId, role: newRole });
  };

  const isLoading = analyticsLoading || usersLoading;

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
      <div className="bg-gradient-to-br from-accent-primary via-accent-secondary to-accent-tertiary rounded-lg p-6 text-white glow-primary">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-white/80 mt-1">
              System administration and analytics
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs tabs-boxed bg-base-100 p-1">
        <button
          className={`tab ${activeTab === 'dashboard' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Dashboard
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users className="h-4 w-4 mr-2" />
          User Management
        </button>
        <button
          className={`tab ${activeTab === 'reports' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <FileText className="h-4 w-4 mr-2" />
          Reports
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && analytics && (
        <div className="space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/70 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold gradient-accent">{analytics.totalUsers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-accent-primary glow-secondary" />
              </div>
            </div>

            <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/70 text-sm font-medium">Total Projects</p>
                  <p className="text-3xl font-bold text-accent-secondary">{analytics.totalProjects || 0}</p>
                </div>
                <FolderKanban className="h-8 w-8 text-accent-secondary glow-secondary" />
              </div>
            </div>

            <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/70 text-sm font-medium">Total Bugs</p>
                  <p className="text-3xl font-bold text-warning">{analytics.totalBugs || 0}</p>
                </div>
                <Bug className="h-8 w-8 text-warning glow-secondary" />
              </div>
            </div>

            <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/70 text-sm font-medium">Recent Activity</p>
                  <p className="text-3xl font-bold text-info">{analytics.recentActivity || 0}</p>
                  <p className="text-xs text-base-content/60">Last 30 days</p>
                </div>
                <BarChart3 className="h-8 w-8 text-info glow-secondary" />
              </div>
            </div>
          </div>

          {/* Bug Status Breakdown */}
          {analytics.bugsByStatus && (
            <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
              <h2 className="text-xl font-semibold mb-4 gradient-accent">Bug Status Distribution</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {analytics.bugsByStatus.map((status: any) => (
                  <div key={status.status} className="text-center">
                    <div className="text-2xl font-bold text-accent-primary">{status.count}</div>
                    <div className="text-sm text-base-content/70">{status.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && users && (
        <div className="bg-base-100 shadow-lg rounded-lg card-hover glow-primary">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 gradient-accent">User Management</h2>

            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id}>
                      <td className="font-medium">{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${
                          user.role === 'Admin' ? 'badge-primary' :
                          user.role === 'Developer' ? 'badge-secondary' : 'badge-accent'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="dropdown dropdown-end">
                          <button className="btn btn-ghost btn-sm">
                            <Edit className="h-4 w-4" />
                          </button>
                          <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                            <li>
                              <button
                                onClick={() => handleRoleUpdate(user.id, 'Admin')}
                                disabled={user.role === 'Admin'}
                                className={user.role === 'Admin' ? 'disabled' : ''}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Make Admin
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleRoleUpdate(user.id, 'Developer')}
                                disabled={user.role === 'Developer'}
                                className={user.role === 'Developer' ? 'disabled' : ''}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Make Developer
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleRoleUpdate(user.id, 'Tester')}
                                disabled={user.role === 'Tester'}
                                className={user.role === 'Tester' ? 'disabled' : ''}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Make Tester
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
            <h2 className="text-xl font-semibold mb-4 gradient-accent">Bug Reports</h2>
            <p className="text-base-content/70 mb-6">
              Generate comprehensive bug reports with filtering options.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="btn btn-tech-primary glow-primary">
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </button>
              <button className="btn btn-tech-outline glow-secondary">
                <FileText className="h-4 w-4 mr-2" />
                View Recent Reports
              </button>
            </div>
          </div>

          <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
            <h2 className="text-xl font-semibold mb-4 gradient-accent">System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">✓</div>
                <div className="text-sm text-base-content/70">Database</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">✓</div>
                <div className="text-sm text-base-content/70">API</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">✓</div>
                <div className="text-sm text-base-content/70">Authentication</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;