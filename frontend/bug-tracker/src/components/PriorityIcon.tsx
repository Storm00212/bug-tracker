/**
 * PRIORITY ICON COMPONENT
 *
 * Displays priority levels with appropriate colors and icons
 * Supports Jira-like priority system
 */

import React from 'react';
import { ArrowUp, ArrowDown, Minus, ChevronUp, ChevronDown } from 'lucide-react';
import type { Priority } from '../services/issueService';

interface PriorityIconProps {
  priority: Priority;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

const PriorityIcon: React.FC<PriorityIconProps> = ({
  priority,
  size = 16,
  className = '',
  showLabel = false
}) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'Highest':
        return {
          icon: <ChevronUp size={size} className={`text-red-600 ${className}`} />,
          label: 'Highest',
          color: 'text-red-600'
        };
      case 'High':
        return {
          icon: <ArrowUp size={size} className={`text-orange-600 ${className}`} />,
          label: 'High',
          color: 'text-orange-600'
        };
      case 'Medium':
        return {
          icon: <Minus size={size} className={`text-yellow-600 ${className}`} />,
          label: 'Medium',
          color: 'text-yellow-600'
        };
      case 'Low':
        return {
          icon: <ArrowDown size={size} className={`text-blue-600 ${className}`} />,
          label: 'Low',
          color: 'text-blue-600'
        };
      case 'Lowest':
        return {
          icon: <ChevronDown size={size} className={`text-gray-600 ${className}`} />,
          label: 'Lowest',
          color: 'text-gray-600'
        };
      default:
        return {
          icon: <Minus size={size} className={`text-gray-500 ${className}`} />,
          label: 'Unknown',
          color: 'text-gray-500'
        };
    }
  };

  const config = getPriorityConfig();

  if (showLabel) {
    return (
      <div className="flex items-center space-x-1">
        {config.icon}
        <span className={`text-sm ${config.color}`}>{config.label}</span>
      </div>
    );
  }

  return config.icon;
};

export default PriorityIcon;