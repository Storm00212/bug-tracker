/**
 * ISSUE TYPE ICON COMPONENT
 *
 * Displays appropriate icons for different issue types
 * Supports all Jira-like issue types with consistent styling
 */

import React from 'react';
import { Bug, CheckSquare, FileText, Target, GitBranch } from 'lucide-react';
import type { IssueType } from '../services/issueService';

interface IssueTypeIconProps {
  type: IssueType;
  size?: number;
  className?: string;
}

const IssueTypeIcon: React.FC<IssueTypeIconProps> = ({
  type,
  size = 16,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'Bug':
        return <Bug size={size} className={`text-red-500 ${className}`} />;
      case 'Task':
        return <CheckSquare size={size} className={`text-blue-500 ${className}`} />;
      case 'Story':
        return <FileText size={size} className={`text-green-500 ${className}`} />;
      case 'Epic':
        return <Target size={size} className={`text-purple-500 ${className}`} />;
      case 'Subtask':
        return <GitBranch size={size} className={`text-orange-500 ${className}`} />;
      default:
        return <FileText size={size} className={`text-gray-500 ${className}`} />;
    }
  };

  return getIcon();
};

export default IssueTypeIcon;