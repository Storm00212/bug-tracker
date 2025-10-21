/**
 * BUG DETAIL PAGE COMPONENT
 *
 * Displays detailed information about a specific bug.
 * Shows bug details, comments, and allows status updates.
 * Enables team collaboration through commenting.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { BugService } from '../services/bugService';
import {
  Bug,
  Edit,
  MessageSquare,
  Send,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { gsap } from 'gsap';

// Form validation schema for comments
const commentSchema = z.object({
  content: z.string().min(2, 'Comment cannot be empty').max(1000, 'Comment is too long'),
});

type CommentFormData = z.infer<typeof commentSchema>;

const BugDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  // Fetch bug details
  const { data: bugData, isLoading: bugLoading } = useQuery({
    queryKey: ['bug', id],
    queryFn: () => BugService.getBugById(Number(id)),
    enabled: !!id,
  });

  const bug = bugData?.bug;
  const comments = bugData?.comments || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (data: CommentFormData) =>
      BugService.addComment({
        bugId: Number(id),
        userId: user?.id || 0,
        content: data.content,
      }),
    onSuccess: () => {
      toast.success('Comment added successfully!');
      queryClient.invalidateQueries({ queryKey: ['bug', id] });
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });

  // Update bug status mutation
  const updateBugMutation = useMutation({
    mutationFn: ({ bugId, status }: { bugId: number; status: string }) =>
      BugService.updateBug(bugId, { status }),
    onSuccess: () => {
      toast.success('Bug status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['bug', id] });
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      setShowStatusUpdate(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update bug status');
    },
  });

  const onCommentSubmit = (data: CommentFormData) => {
    addCommentMutation.mutate(data);
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (id) {
      updateBugMutation.mutate({ bugId: Number(id), status: newStatus });
    }
  };

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

  // GSAP animations
  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(pageRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, [bug]);

  if (bugLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="text-center py-12">
        <Bug className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-base-content mb-2">Bug not found</h3>
        <p className="text-base-content/70 mb-6">The bug you're looking for doesn't exist.</p>
        <Link to="/bugs" className="btn btn-tech-primary glow-primary">
          Back to Bugs
        </Link>
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

      {/* Bug Details Card */}
      <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center glow-primary">
              <Bug className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-accent">{bug.title}</h1>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`badge ${getStatusColor(bug.status || 'Open')}`}>
                  {bug.status || 'Open'}
                </span>
                <span className={`badge badge-outline ${getSeverityColor(bug.severity)}`}>
                  {bug.severity}
                </span>
              </div>
            </div>
          </div>

          {(hasRole('Developer') || hasRole('Admin')) && (
            <div className="dropdown dropdown-end">
              <button
                onClick={() => setShowStatusUpdate(!showStatusUpdate)}
                className="btn btn-tech-outline btn-sm glow-secondary"
              >
                <Edit className="h-4 w-4 mr-2" />
                Update Status
              </button>
            </div>
          )}
        </div>

        {/* Status Update Options */}
        {showStatusUpdate && (
          <div className="mb-6 p-4 bg-base-200 rounded-lg">
            <h3 className="font-medium mb-3 text-base-content">Update Bug Status</h3>
            <div className="flex flex-wrap gap-2">
              {['Open', 'In Progress', 'Resolved', 'Closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={updateBugMutation.isPending}
                  className={`btn btn-sm ${
                    status === 'Open' ? 'btn-warning' :
                    status === 'In Progress' ? 'btn-info' :
                    status === 'Resolved' ? 'btn-success' : 'btn-neutral'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bug Description */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-base-content">Description</h3>
          <p className="text-base-content/80 leading-relaxed">{bug.description}</p>
        </div>

        {/* Bug Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-base-content/70">
              <User className="h-4 w-4 mr-2" />
              <span>Reporter ID: {bug.reporterId}</span>
            </div>
            {bug.developerId && (
              <div className="flex items-center text-sm text-base-content/70">
                <User className="h-4 w-4 mr-2" />
                <span>Developer ID: {bug.developerId}</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-base-content/70">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Created: {bug.createdAt ? new Date(bug.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm text-base-content/70">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>Project ID: {bug.projectId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-base-100 shadow-lg rounded-lg p-6 card-hover glow-primary">
        <div className="flex items-center mb-6">
          <MessageSquare className="h-5 w-5 mr-2 text-accent-primary" />
          <h2 className="text-xl font-semibold gradient-accent">Comments ({comments.length})</h2>
        </div>

        {/* Comments List */}
        <div className="space-y-4 mb-6">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No comments yet. Be the first to add one!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border border-accent-primary/30 rounded-lg p-4 bg-base-200/50">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {(comment.username || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-base-content">{comment.username || 'Unknown User'}</span>
                      <span className="text-xs text-base-content/50">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <p className="text-base-content/80">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleSubmit(onCommentSubmit)} className="border-t border-accent-primary/30 pt-6">
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text text-base-content">Add a comment</span>
              </label>
              <textarea
                className={`textarea input-tech w-full focus-glow ${errors.content ? 'textarea-error' : ''}`}
                rows={3}
                placeholder="Share your thoughts about this bug..."
                {...register('content')}
              />
              {errors.content && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.content.message}</span>
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-tech-primary glow-primary"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BugDetailPage;