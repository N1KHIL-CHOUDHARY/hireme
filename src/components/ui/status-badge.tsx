import * as React from 'react';

import { cn } from '@/lib/utils';

export type StatusType =
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
  // Application statuses
  pending: {
    label: 'Pending',
    className: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  },
  reviewed: {
    label: 'Reviewed',
    className: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
  },
  accepted: {
    label: 'Accepted',
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
  const normalizedKey = status?.toLowerCase() || '';
  const config = STATUS_MAP[normalizedKey] || {
    label: customLabel || status,
    className: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-md whitespace-nowrap select-none',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs',
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
}

export function MatchScoreBadge({
  score,
  size = 'default',
  className,
  ...props
}: MatchScoreBadgeProps) {
  if (score === undefined || score === null) {
    return (
      <span
        className={cn(
          'inline-flex items-center font-mono tabular-nums font-medium border rounded-md bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
          size === 'sm'
            ? 'px-1.5 py-0.5 text-xs'
            : size === 'lg'
              ? 'px-3 py-1 text-sm'
              : 'px-2 py-0.5 text-xs',
          className
        )}
        {...props}
      >
        N/A
      </span>
    );
  }

  const colorClass =
    score >= 70
      ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
      : score >= 50
        ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
        : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]';

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono tabular-nums font-medium border rounded-md whitespace-nowrap',
        size === 'sm'
          ? 'px-1.5 py-0.5 text-xs'
          : size === 'lg'
            ? 'px-3 py-1 text-sm font-semibold'
            : 'px-2 py-0.5 text-xs',
        colorClass,
        className
      )}
      {...props}
    >
      {score}%
    </span>
  );
}
