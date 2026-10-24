import * as React from 'react';

import { cn } from '@/lib/utils';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  backAction?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  backAction,
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6',
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {backAction}
          <h1 className="text-[28px] leading-[32px] font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          {badge}
        </div>
        {description && <p className="text-sm text-slate-500 leading-normal">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
