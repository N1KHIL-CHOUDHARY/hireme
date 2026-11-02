import * as React from 'react';

import { cn } from '@/lib/utils';

export type StatusType =
  | 'applied'
  | 'under review'
  | 'under_review'
  | 'shortlisted'
  | 'interview scheduled'
  | 'interview_scheduled'
  | 'assessment'
  | 'offered'
  | 'withdrawn'
  | 'pending'
  | 'reviewed'
  | 'accepted'
  | 'rejected'
  | 'active'
  | 'inactive'
  | 'expired'
  | 'completed'
  | 'in_progress'
  | 'not_started'
  | string;

interface StatusConfig {
  label: string;
  className: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  // Candidate application workflow statuses
  applied: {
    label: 'Applied',
    className: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
  },
  'under review': {
    label: 'Under Review',
    className: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  },
  shortlisted: {
    label: 'Shortlisted',
    className: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
  },
  'interview scheduled': {
    label: 'Interview Scheduled',
    className: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
  },
  interview_scheduled: {
    label: 'Interview Scheduled',
    className: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
  },
  assessment: {
    label: 'Assessment',
    className: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  },
  offered: {
    label: 'Offered',
    className: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
  },
  withdrawn: {
    label: 'Withdrawn',
    className: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
  },

  // Legacy application statuses
  pending: {
    label: 'Applied',
    className: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
  },
  reviewed: {
    label: 'Under Review',
    className: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  },
  accepted: {
    label: 'Offered',
    className: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
  },

  // Job statuses
  active: {
    label: 'Active',
    className: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
  },
  expired: {
    label: 'Expired',
    className: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
  },

  // Interview statuses
  completed: {
    label: 'Completed',
    className: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
  },
  'in progress': {
    label: 'In Progress',
    className: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  },
  'not started': {
    label: 'Not Started',
    className: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
  },
  not_started: {
    label: 'Not Started',
    className: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
  },
};

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  customLabel?: string;
  size?: 'sm' | 'default';
}

export function StatusBadge({
  status,
  customLabel,
  size = 'default',
  className,
  ...props
}: StatusBadgeProps) {
  const normalizedKey = status?.toLowerCase().trim() || '';
  const config = STATUS_MAP[normalizedKey] || {
    label: customLabel || status,
    className: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-medium border rounded-md transition-colors',
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        config.className,
        className
      )}
      {...props}
    >
      {customLabel || config.label}
    </span>
  );
}

export interface MatchScoreBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  score?: number | null;
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
}

export function MatchScoreBadge({
  score,
  size = 'default',
  showLabel = false,
  className,
  ...props
}: MatchScoreBadgeProps) {
  if (score === undefined || score === null) {
    return (
      <span
        className={cn(
          'inline-flex items-center font-mono tabular-nums text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5',
          className
        )}
        {...props}
      >
        --
      </span>
    );
  }

  const numScore = Math.round(score);

  let colorClasses = 'text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]'; // < 50 red
  if (numScore >= 70) {
    colorClasses = 'text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]'; // >= 70 green
  } else if (numScore >= 50) {
    colorClasses = 'text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]'; // 50-69 amber
  }

  const sizeClasses = {
    sm: 'text-[11px] px-1.5 py-0.5',
    default: 'text-xs px-2 py-0.5',
    lg: 'text-sm font-semibold px-2.5 py-1',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono tabular-nums font-semibold border rounded-md',
        sizeClasses,
        colorClasses,
        className
      )}
      {...props}
    >
      {showLabel && <span className="font-sans font-normal mr-1 text-[11px]">Match:</span>}
      {numScore}%
    </span>
  );
}
