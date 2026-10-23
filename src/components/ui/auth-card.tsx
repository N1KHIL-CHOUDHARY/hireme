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
import { cn, safeStyle } from '@/lib/utils';

import { GradientBackground } from './gradient-background';

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
  colorScheme = 'default',
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
  // Get border gradient based on color scheme
  const getBorderGradient = () => {
    switch (colorScheme) {
      case 'blue':
        return 'border-blue-500/20';
      case 'purple':
        return 'border-purple-500/20';
      case 'cyan':
        return 'border-cyan-500/20';
      case 'indigo':
        return 'border-indigo-500/20';
      default:
        return 'border-primary/20';
    }
  };

  // Get shadow color based on color scheme
  const getShadowColor = () => {
    switch (colorScheme) {
      case 'blue':
        return 'shadow-blue-500/10';
      case 'purple':
        return 'shadow-purple-500/10';
      case 'cyan':
        return 'shadow-cyan-500/10';
      case 'indigo':
        return 'shadow-indigo-500/10';
      default:
        return 'shadow-primary/10';
    }
  };

  // Get base color for animations based on color scheme
  const getBaseColor = () => {
    switch (colorScheme) {
      case 'blue':
        return 'rgb(59, 130, 246)'; // blue-500
      case 'purple':
        return 'rgb(168, 85, 247)'; // purple-500
      case 'cyan':
        return 'rgb(14, 165, 233)'; // cyan-500
      case 'indigo':
      default:
        return 'rgb(99, 102, 241)'; // indigo-500
    }
  };

  return (
    <motion.div
      className="relative w-full"
      initial={{ boxShadow: `0 0 0 rgba(0,0,0,0)` }}
      animate={{
        boxShadow: [
          `0 0 8px ${getBaseColor()}10`,
          `0 0 12px ${getBaseColor()}15`,
          `0 0 8px ${getBaseColor()}10`,
        ],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      }}
    >
      {' '}
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={safeStyle({
          background: `linear-gradient(45deg, ${getBaseColor()}15, ${getBaseColor()}45, ${getBaseColor()}15)`,
          backgroundSize: '200% 200%',
          zIndex: -1,
        })}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />
      <Card
        className={cn(
          'w-full backdrop-blur-sm border-2 relative overflow-hidden',
          getBorderGradient(),
          'bg-card/85',
          'shadow-xl',
          getShadowColor(),
          className
        )}
        {...props}
      >
        {/* Animated border glow effect */}
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={safeStyle({
            zIndex: 0,
            opacity: 0.5,
          })}
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />

        <CardHeader className={cn('space-y-1 relative z-10', headerClassName)}>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className={cn('relative z-10', contentClassName)}>{children}</CardContent>
        {footer && (
          <CardFooter className={cn('flex flex-col space-y-4 relative z-10', footerClassName)}>
            {footer}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}

// Animated version of the AuthCard
export function AnimatedAuthCard({
  colorScheme = 'default',
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
  // Get border gradient based on color scheme
  const getBorderGradient = () => {
    switch (colorScheme) {
      case 'blue':
        return 'border-blue-500/20';
      case 'purple':
        return 'border-purple-500/20';
      case 'cyan':
        return 'border-cyan-500/20';
      case 'indigo':
        return 'border-indigo-500/20';
      default:
        return 'border-primary/20';
    }
  };

  // Get shadow color based on color scheme
  const getShadowColor = () => {
    switch (colorScheme) {
      case 'blue':
        return 'shadow-blue-500/10';
      case 'purple':
        return 'shadow-purple-500/10';
      case 'cyan':
        return 'shadow-cyan-500/10';
      case 'indigo':
        return 'shadow-indigo-500/10';
      default:
        return 'shadow-primary/10';
    }
  };

  // Get base color for animations based on color scheme
  const getBaseColor = () => {
    switch (colorScheme) {
      case 'blue':
        return 'rgb(59, 130, 246)'; // blue-500
      case 'purple':
        return 'rgb(168, 85, 247)'; // purple-500
      case 'cyan':
        return 'rgb(14, 165, 233)'; // cyan-500
      case 'indigo':
      default:
        return 'rgb(99, 102, 241)'; // indigo-500
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="relative w-full"
        initial={{ boxShadow: `0 0 0 rgba(0,0,0,0)` }}
        animate={{
          boxShadow: [
            `0 0 8px ${getBaseColor()}10`,
            `0 0 12px ${getBaseColor()}15`,
            `0 0 8px ${getBaseColor()}10`,
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <GradientBackground baseColor={getBaseColor()} className="rounded-lg" />
        <Card
          className={cn(
            'w-full backdrop-blur-sm border-2 relative overflow-hidden',
            getBorderGradient(),
            'bg-card/85',
            'shadow-xl',
            getShadowColor(),
            className
          )}
          {...props}
        >
          {/* Animated border glow effect */}
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={safeStyle({
              opacity: 0.3,
              zIndex: 0,
            })}
            animate={{
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />

          <CardHeader className={cn('space-y-1 relative z-10', headerClassName)}>
            <div className="flex flex-col items-center mb-6">
              <Image
                src="/images/hirelytics-logo.svg"
                alt="Hirelytics"
                width={64}
                height={64}
                className="h-16 w-16 mb-4"
              />
            </div>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent className={cn('relative z-10', contentClassName)}>{children}</CardContent>
          {footer && (
            <CardFooter className={cn('flex flex-col space-y-4 relative z-10', footerClassName)}>
              {footer}
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
