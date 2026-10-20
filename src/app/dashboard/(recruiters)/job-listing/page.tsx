'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Edit, Eye, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { JobFormDialog } from '@/components/jobs/job-form-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getCountryLabel } from '@/data/countries';

// Define job type
interface Job {
  id: string;
  title: string;
  companyName: string;
  skills: string[];
  location: string;
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

export default function JobsPage() {
  const t = useTranslations('Dashboard');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery] = useState('');

  // Fetch jobs with pagination and search
  const { data, refetch, isLoading } = useQuery({
    queryKey: ['jobs', page, pageSize, searchQuery],
    queryFn: async () => {
      const searchParam = searchQuery ? `&search=${searchQuery}` : '';
      const response = await fetch(`/api/jobs?page=${page + 1}&limit=${pageSize}${searchParam}`);

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
        return <div className="font-medium text-slate-900">{row.getValue('title')}</div>;
      },
    },
    {
      accessorKey: 'companyName',
      header: 'Company',
      cell: ({ row }) => (
        <span className="text-slate-600 text-sm">{row.getValue('companyName')}</span>
      ),
    },
    {
      accessorKey: 'skills',
      header: 'Required Skills',
      cell: ({ row }) => {
        const skills = (row.getValue('skills') as string[]) || [];
        return (
          <div className="flex flex-wrap gap-1 max-w-[220px]">
            {skills.slice(0, 3).map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-[11px] font-normal text-slate-600 bg-slate-50 border-slate-200"
              >
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge
                variant="outline"
                className="text-[11px] font-normal text-slate-400 border-slate-200"
              >
                +{skills.length - 3}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => {
        const location = row.getValue('location') as string;
        return <span className="text-xs text-slate-600">{getCountryLabel(location)}</span>;
      },
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expires On',
      cell: ({ row }) => {
        const rawDate = row.getValue('expiryDate');
        if (!rawDate) return <span className="text-xs text-slate-400">No date</span>;
        const date = new Date(rawDate as string);
        const isExpired = date < new Date();

        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs tabular-nums text-slate-600">
              {format(date, 'MMM dd, yyyy')}
            </span>
            {isExpired && <StatusBadge status="expired" size="sm" />}
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return <StatusBadge status={isActive ? 'active' : 'inactive'} />;
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const job = row.original;
        const jobUrl = `/jobs/${job.urlId}`;

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-slate-500 hover:text-primary hover:bg-blue-50"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/jobs/${job.urlId}`);
                toast.success('Job application link copied');
              }}
              title="Copy job URL"
            >
              <LinkIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => window.open(jobUrl, '_blank')}
              title="View public job posting"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-slate-500 hover:text-primary hover:bg-blue-50"
              title="Edit job"
              onClick={() => {
                setSelectedJobId(job.id);
                setDialogMode('edit');
                setIsDialogOpen(true);
              }}
            >
              <Edit className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-slate-500 hover:text-destructive hover:bg-red-50"
              title="Delete job"
              onClick={() => handleDeleteJob(job.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Handle job deletion
  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job listing?')) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete job');
      }

      refetch();
      toast.success('Job deleted successfully');
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(errorMessage);
    }
  };

  // Handle job creation success
  const handleJobCreated = () => {
    refetch();
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('jobManagement') || 'Job Listings'}
        description={t('manageJobs') || 'Create, update, and manage your job openings.'}
        actions={
          <Button
            onClick={() => {
              setDialogMode('create');
              setSelectedJobId(undefined);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-1.5 size-4" />
            Create Job
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.jobs || []}
        searchKey="title"
        searchPlaceholder="Search jobs by title..."
        isLoading={isLoading}
        pagination={{
          pageIndex: page,
          pageSize: pageSize,
          pageCount: data?.pagination?.totalPages || 1,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />

      <JobFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmitSuccess={handleJobCreated}
        jobId={selectedJobId}
        mode={dialogMode}
      />
    </div>
  );
}
