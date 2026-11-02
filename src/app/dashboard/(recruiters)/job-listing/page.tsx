'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Edit, Eye, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const searchParams = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery] = useState('');

  // Auto-open creation dialog if action=new is present
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setDialogMode('create');
      setSelectedJobId(undefined);
      setIsDialogOpen(true);
    }
  }, [searchParams]);

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
        const countryCode = row.getValue('location') as string;
        return <span className="text-slate-600 text-sm">{getCountryLabel(countryCode)}</span>;
      },
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expires',
      cell: ({ row }) => {
        const date = new Date(row.getValue('expiryDate'));
        return (
          <span className="font-mono text-xs tabular-nums text-slate-600">
            {format(date, 'MMM dd, yyyy')}
          </span>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        const expiryDate = new Date(row.getValue('expiryDate'));
        const isExpired = expiryDate < new Date();

        if (isExpired) {
          return <StatusBadge status="expired" />;
        }

        return <StatusBadge status={isActive ? 'active' : 'inactive'} />;
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const job = row.original;

        const handleCopyLink = () => {
          const url = `${window.location.origin}/jobs/${job.urlId}`;
          navigator.clipboard.writeText(url);
          toast.success('Job link copied to clipboard');
        };

        const handleEdit = () => {
          setSelectedJobId(job.id);
          setDialogMode('edit');
          setIsDialogOpen(true);
        };

        const handleDelete = async () => {
          if (confirm('Are you sure you want to delete this job?')) {
            try {
              const response = await fetch(`/api/jobs/${job.id}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error('Failed to delete job');
              }

              toast.success('Job deleted successfully');
              refetch();
            } catch {
              toast.error('Failed to delete job');
            }
          }
        };

        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyLink}
              title="Copy public link"
              className="h-8 w-8 text-slate-500 hover:text-slate-900"
            >
              <LinkIcon className="size-4" />
              <span className="sr-only">Copy Link</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              title="View public job"
              className="h-8 w-8 text-slate-500 hover:text-slate-900"
            >
              <a href={`/jobs/${job.urlId}`} target="_blank" rel="noopener noreferrer">
                <Eye className="size-4" />
                <span className="sr-only">View</span>
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              title="Edit job"
              className="h-8 w-8 text-slate-500 hover:text-slate-900"
            >
              <Edit className="size-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              title="Delete job"
              className="h-8 w-8 text-slate-500 hover:text-red-600"
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        );
      },
    },
  ];

  const handleJobCreated = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Jobs"
        description="Review, update, and manage job openings published by your organization"
        actions={
          <Button
            onClick={() => {
              setDialogMode('create');
              setSelectedJobId(undefined);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-1.5 size-4" />
            Post a Job
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
