'use client';

import { StatCard, type StatCardProps } from '@/components/ui/stat-card';

export type ClickableStatCardProps = StatCardProps;

export function ClickableStatCard(props: ClickableStatCardProps) {
  return <StatCard {...props} />;
}
