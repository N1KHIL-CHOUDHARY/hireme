'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Briefcase, Building, ExternalLink, Eye, MapPin, User } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { getCountryLabel } from '@/data/countries';
import { getSkillLabel } from '@/data/technical-skills';

interface Job {
  id: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  skills: string[];
  expiryDate: string;
  urlId: string;
  isActive: boolean;
  createdAt: string;
  recruiter: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminJobsPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch jobs data
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-jobs', page, pageSize],
    queryFn: async () => {
      const response = await fetch(`/api/admin/jobs?page=${page + 1}&limit=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      return response.json();
    },
  });

  // Define columns for the data table
  const columns: ColumnDef<Job>[] = [
    {
      accessorKey: 'title',
      header: 'Job Title',
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="space-y-0.5 max-w-xs">
            <p className="font-medium text-sm text-slate-900 truncate" title={job.title}>
              {job.title}
            </p>
            <div className="flex items-center text-xs text-slate-500 gap-1">
              <Building className="h-3 w-3 text-slate-400" />
              <span className="truncate">{job.companyName}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'recruiter',
      header: 'Recruiter',
      cell: ({ row }) => {
        const recruiter = row.getValue('recruiter') as Job['recruiter'];
        return (
          <div className="space-y-0.5 max-w-[180px]">
            <div className="flex items-center gap-1.5 text-xs text-slate-900 font-medium">
              <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{recruiter.name}</span>
            </div>
            <p className="text-[11px] font-mono text-slate-500 truncate tabular-nums">
              {recruiter.email}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => {
        const location = row.getValue('location') as string;
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>{getCountryLabel(location)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'skills',
      header: 'Required Skills',
      cell: ({ row }) => {
        const skills = row.getValue('skills') as string[];
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {skills.slice(0, 2).map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-xs font-normal bg-slate-100 text-slate-700 border-slate-200"
              >
                {getSkillLabel(skill)}
              </Badge>
            ))}
            {skills.length > 2 && (
              <Badge
                variant="outline"
                className="text-xs font-normal text-slate-500 border-slate-200"
              >
                +{skills.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Listing Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        const expiryDate = new Date(row.original.expiryDate);
        const isExpired = expiryDate < new Date();

        return (
          <StatusBadge
            status={isActive && !isExpired ? 'active' : isExpired ? 'expired' : 'inactive'}
          />
        );
      },
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expiry Date',
      cell: ({ row }) => {
        const date = row.getValue('expiryDate') as string;
        return (
          <span className="font-mono text-xs tabular-nums text-slate-600">
            {format(new Date(date), 'MMM dd, yyyy')}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => window.open(`/jobs/${job.urlId}`, '_blank')}
            >
              <ExternalLink className="h-3 w-3 text-slate-500" />
              Public View
            </Button>
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Job Management"
          description="Manage and monitor all published job listings across recruiters"
        />
        <Card className="p-6 border-red-200 bg-red-50/50 text-red-700">
          <p className="text-sm font-medium">Failed to load jobs. Please try refreshing.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Management"
        description="Review, monitor, and manage all job postings across recruiters"
      />

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Jobs"
          value={data?.pagination?.total || 0}
          description="All listings across the system"
          icon={<Briefcase className="h-4 w-4" />}
        />
        <StatCard
          title="Jobs on Current Page"
          value={data?.jobs?.length || 0}
          description="Items visible in table"
          icon={<Eye className="h-4 w-4" />}
        />
        <StatCard
          title="Total Pages"
          value={data?.pagination?.totalPages || 1}
          description="Pagination index"
          icon={<Building className="h-4 w-4" />}
        />
      </div>

      <Card className="p-4 sm:p-6 bg-white border-slate-200 shadow-sm">
        <DataTable
          columns={columns}
          data={data?.jobs || []}
          searchKey="title"
          searchPlaceholder="Search by job title, company, or description..."
          pagination={{
            pageIndex: page,
            pageSize: pageSize,
            pageCount: data?.pagination?.totalPages || 1,
            onPageChange: setPage,
            onPageSizeChange: setPageSize,
          }}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
}
