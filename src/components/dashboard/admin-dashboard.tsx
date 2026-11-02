/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { format } from 'date-fns';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  ExternalLink,
  Heart,
  Layers,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';

// Design system status colors
const STATUS_COLORS: Record<string, string> = {
  pending: '#D97706', // amber
  reviewed: '#2563EB', // primary blue
  accepted: '#16A34A', // green
  rejected: '#DC2626', // red
};

export function AdminDashboard() {
  const { stats, loading, error } = useDashboardStats();

  const [applicationStatusData, setApplicationStatusData] = useState<any[]>([]);
  const [jobsPerRecruiterData, setJobsPerRecruiterData] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    if (stats) {
      // Format application status data for pie chart
      if (stats.applicationStatusData) {
        setApplicationStatusData(
          stats.applicationStatusData.map((item: any) => ({
            name: item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : 'Unknown',
            statusKey: item._id,
            value: item.count,
            color: STATUS_COLORS[item._id] || '#94A3B8',
          }))
        );
      }

      // Format jobs per recruiter data for bar chart
      if (stats.jobsPerRecruiter) {
        setJobsPerRecruiterData(
          stats.jobsPerRecruiter.map((item: any) => ({
            recruiterName: item._id || 'Unknown',
            jobCount: item.count,
          }))
        );
      }

      // Format recent jobs
      if (stats.recentJobs) {
        setRecentJobs(
          stats.recentJobs.map((job: any) => ({
            id: job._id || job.urlId,
            urlId: job.urlId,
            title: job.title || 'Untitled Job',
            company: job.companyName || 'Unknown Company',
            recruiterName: job.recruiter?.name || 'Recruiter',
            recruiterEmail: job.recruiter?.email || '',
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Dashboard"
        description="Platform-wide overview of jobs, candidates, recruiters, and activity metrics"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/dashboard/manage-jobs">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                Manage Jobs
              </Button>
            </Link>
            <Link href="/dashboard/candidates">
              <Button size="sm" className="gap-1.5 text-xs">
                Manage Users
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Jobs"
          value={stats?.totalJobs || 0}
          description="Active job postings"
          icon={<Briefcase className="h-4 w-4" />}
          href="/dashboard/manage-jobs"
        />
        <StatCard
          title="Total Candidates"
          value={stats?.totalCandidates || 0}
          description="Registered candidate profiles"
          icon={<Users className="h-4 w-4" />}
          href="/dashboard/candidates"
        />
        <StatCard
          title="Total Recruiters"
          value={stats?.totalRecruiters || 0}
          description="Verified hiring organizations"
          icon={<UserCheck className="h-4 w-4" />}
          href="/dashboard/recruiters"
        />
        <StatCard
          title="Wishlist Inquiries"
          value="Directory"
          description="Prospective platform users"
          icon={<Heart className="h-4 w-4" />}
          href="/dashboard/wishlist"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Applications by Status Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">
              Applications by Status
            </CardTitle>
            <CardDescription>Overall breakdown of candidate applications</CardDescription>
          </CardHeader>
          <CardContent>
            {applicationStatusData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={applicationStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {applicationStatusData.map((entry, index) => (
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
                  {applicationStatusData.map((item) => (
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
                description="Status metrics will appear once applications are submitted"
              />
            )}
          </CardContent>
        </Card>

        {/* Jobs per Recruiter Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">
              Jobs per Recruiter
            </CardTitle>
            <CardDescription>Number of active job listings by recruiter</CardDescription>
          </CardHeader>
          <CardContent>
            {jobsPerRecruiterData.length > 0 ? (
              <div className="h-[270px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={jobsPerRecruiterData.slice(0, 8)}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="recruiterName"
                      tickLine={false}
                      axisLine={{ stroke: '#E2E8F0' }}
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      interval={0}
                      tickFormatter={(value) =>
                        value.length > 10 ? `${value.substring(0, 8)}...` : value
                      }
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'monospace' }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E2E8F0',
                        borderRadius: '8px',
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                        fontSize: '12px',
                      }}
                      formatter={(val: number) => [`${val} jobs`, 'Posted']}
                    />
                    <Bar dataKey="jobCount" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={<BarChart3 className="h-8 w-8" />}
                title="No recruiter jobs yet"
                description="Job distribution will display as recruiters create listings"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recently Posted Jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Recently Posted Jobs
            </CardTitle>
            <CardDescription>Latest positions created by platform recruiters</CardDescription>
          </div>
          <Link href="/dashboard/manage-jobs">
            <Button variant="ghost" size="sm" className="text-xs">
              View all jobs
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentJobs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentJobs.slice(0, 6).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-slate-900 truncate">{job.title}</p>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-600 truncate">{job.company}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Added by{' '}
                      <span className="text-slate-700 font-medium">{job.recruiterName}</span>
                      {job.recruiterEmail && (
                        <span className="text-slate-400 font-mono text-[11px] ml-1">
                          ({job.recruiterEmail})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-mono text-slate-500 tabular-nums hidden sm:inline-block">
                      {job.timestamp}
                    </span>
                    {job.urlId && (
                      <Link href={`/jobs/${job.urlId}`} target="_blank">
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                          <ExternalLink className="h-3 w-3" />
                          View
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Briefcase className="h-8 w-8" />}
              title="No recent jobs"
              description="New postings will appear here when recruiters publish them"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
