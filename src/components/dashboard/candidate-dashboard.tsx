/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { format } from 'date-fns';
import { ArrowRight, Briefcase, Clock, FileCheck, Layers } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';

// Design system status colors
const STATUS_COLORS: Record<string, string> = {
  pending: '#D97706', // amber
  reviewed: '#2563EB', // primary blue
  accepted: '#16A34A', // green
  rejected: '#DC2626', // red
};

export function CandidateDashboard() {
  const { stats, loading, error } = useDashboardStats();
  const [applicationsByStatusData, setApplicationsByStatusData] = useState<any[]>([]);
  const [recentApplicationsList, setRecentApplicationsList] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    if (stats) {
      if (stats.myApplicationsByStatus) {
        setApplicationsByStatusData(
          stats.myApplicationsByStatus.map((item: any) => ({
            name: item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : 'Unknown',
            statusKey: item._id,
            value: item.count,
            color: STATUS_COLORS[item._id] || '#94A3B8',
          }))
        );
      }

      if (stats.myRecentApplications) {
        setRecentApplicationsList(
          stats.myRecentApplications.map((app: any) => ({
            id: app._id,
            title: app.jobInfo?.title || 'Unknown Job',
            company: app.jobInfo?.companyName || 'Unknown Company',
            timestamp: format(new Date(app.createdAt), 'MMM dd, yyyy'),
            status: app.status,
          }))
        );
      }

      if (stats.recentJobs) {
        setRecentJobs(
          stats.recentJobs.map((job: any) => ({
            id: job._id || job.urlId,
            urlId: job.urlId,
            title: job.title,
            company: job.companyName,
            location: job.location,
            timestamp: format(new Date(job.createdAt), 'MMM dd, yyyy'),
          }))
        );
      }
    }
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50 p-6 text-red-700">
        <p className="text-sm font-medium">Error loading dashboard data: {error}</p>
      </Card>
    );
  }

  const successRate = calculateSuccessRate(stats?.myApplicationsByStatus || []);
  const interviewCount = countInterviewOpportunities(stats?.myApplicationsByStatus || []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Candidate Dashboard"
        description="Track your applications, interview progress, and find new opportunities"
        actions={
          <Link href="/dashboard/jobs">
            <Button size="sm" className="gap-2">
              Browse Open Roles
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      {/* Overview Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="My Applications"
          value={stats?.myApplicationsCount || 0}
          description="Total jobs applied to"
          icon={<FileCheck className="h-4 w-4" />}
          href="/dashboard/applications"
        />
        <StatCard
          title="Application Success Rate"
          value={`${successRate}%`}
          description="Applications accepted"
          icon={<Briefcase className="h-4 w-4" />}
        />
        <StatCard
          title="Interview Opportunities"
          value={interviewCount}
          description="In review or accepted status"
          icon={<Clock className="h-4 w-4" />}
          href="/dashboard/applications"
        />
      </div>

      {/* Charts & Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Status Distribution Chart (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Applications by Status</CardTitle>
            <CardDescription>Current status breakdown of your submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {applicationsByStatusData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={applicationsByStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {applicationsByStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '8px',
                          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  {applicationsByStatusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-600 truncate">{item.name}</span>
                      <span className="font-mono font-medium text-slate-900 ml-auto tabular-nums">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Layers className="h-8 w-8" />}
                title="No application data"
                description="Status breakdown will appear once you submit applications"
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Applications (3 cols) */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recent Applications</CardTitle>
              <CardDescription>Your latest job application submissions</CardDescription>
            </div>
            <Link href="/dashboard/applications">
              <Button variant="ghost" size="sm" className="text-xs">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentApplicationsList.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentApplicationsList.map((app, idx) => (
                  <div
                    key={app.id || idx}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="space-y-1 min-w-0 pr-4">
                      <p className="font-medium text-sm text-slate-900 truncate">{app.title}</p>
                      <p className="text-xs text-slate-500 truncate">{app.company}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs font-mono text-slate-500 tabular-nums hidden sm:inline-block">
                        {app.timestamp}
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FileCheck className="h-8 w-8" />}
                title="No applications yet"
                description="Start browsing open jobs and apply with your resume"
                action={{
                  label: 'Browse Jobs',
                  href: '/dashboard/jobs',
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Latest Job Postings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Latest Job Openings</CardTitle>
            <CardDescription>New positions available on the platform</CardDescription>
          </div>
          <Link href="/dashboard/jobs">
            <Button variant="ghost" size="sm" className="text-xs">
              View all jobs
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentJobs.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentJobs.slice(0, 6).map((job) => (
                <div
                  key={job.id}
                  className="rounded-lg border border-slate-200/80 bg-white p-4 hover:border-slate-300 hover:bg-slate-50/50 transition-colors duration-150 flex flex-col justify-between"
                >
                  <div className="space-y-1 mb-3">
                    <h3 className="font-semibold text-sm text-slate-900 line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-1">{job.company}</p>
                    {job.location && (
                      <p className="text-xs text-slate-400 capitalize">{job.location}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="font-mono text-slate-500 tabular-nums">{job.timestamp}</span>
                    <Link href={`/dashboard/jobs/${job.urlId || job.id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Briefcase className="h-8 w-8" />}
              title="No recent job postings"
              description="Check back soon for new opportunities"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function calculateSuccessRate(applicationsByStatus: any[]): string {
  const accepted = applicationsByStatus.find((item) => item._id === 'accepted')?.count || 0;
  const total = applicationsByStatus.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) return '0';

  const rate = (accepted / total) * 100;
  return rate.toFixed(1);
}

function countInterviewOpportunities(applicationsByStatus: any[]): number {
  const reviewed = applicationsByStatus.find((item) => item._id === 'reviewed')?.count || 0;
  const accepted = applicationsByStatus.find((item) => item._id === 'accepted')?.count || 0;

  return reviewed + accepted;
}
