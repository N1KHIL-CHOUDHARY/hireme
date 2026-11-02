import Link from 'next/link';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface EmptyStateActionConfig {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'action'> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode | EmptyStateActionConfig;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  const renderAction = () => {
    if (!action) return null;

    if (React.isValidElement(action)) {
      return action;
    }

    if (typeof action === 'object' && 'label' in action) {
      const config = action as EmptyStateActionConfig;
      if (config.href) {
        return (
          <Link href={config.href}>
            <Button size="sm">{config.label}</Button>
          </Link>
        );
      }
      return (
        <Button size="sm" onClick={config.onClick}>
          {config.label}
        </Button>
      );
    }

    return action as React.ReactNode;
  };

  return (
    <Card className={cn('border-dashed border-border bg-white', className)} {...props}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            {icon}
          </div>
        )}
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-slate-500 max-w-sm leading-relaxed">{description}</p>
        )}
        {action && <div className="mt-6">{renderAction()}</div>}
      </CardContent>
    </Card>
  );
}
