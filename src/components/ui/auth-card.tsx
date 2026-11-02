'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import * as React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AuthCardProps extends React.ComponentProps<typeof Card> {
  colorScheme?: 'blue' | 'purple' | 'cyan' | 'indigo' | 'default';
  children: React.ReactNode;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
}

export function AuthCard({
  children,
  title,
  description,
  footer,
  className,
  contentClassName,
  headerClassName,
  footerClassName,
  ...props
}: AuthCardProps) {
  return (
    <Card
      className={cn(
        'w-full max-w-md border border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] rounded-lg',
        className
      )}
      {...props}
    >
      <CardHeader className={cn('space-y-1.5 text-center pb-4', headerClassName)}>
        <div className="flex justify-center mb-3">
          <Image
            src="/images/hirelytics-logo.svg"
            alt="Hirelytics"
            width={48}
            height={48}
            className="h-12 w-12"
            priority
          />
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-sm text-slate-600">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className={cn('pt-0', contentClassName)}>{children}</CardContent>
      {footer && (
        <CardFooter
          className={cn('flex flex-col space-y-3 pt-4 border-t border-slate-100', footerClassName)}
        >
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

// Animated version of the AuthCard
export function AnimatedAuthCard({ className, ...props }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      <AuthCard className={className} {...props} />
    </motion.div>
  );
}
