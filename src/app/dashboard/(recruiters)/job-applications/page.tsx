'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import JobFilter from '@/components/job-applications/job-filter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { MatchScoreBadge, StatusBadge } from '@/components/ui/status-badge';

// Define JobApplication type
interface JobApplication {
  _id: string;
  jobId: string;
  userId: string;
  fileName: string;
  resumeUrl: string;
  preferredLanguage: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  parsedResume?: {
    skills: string[];
    matchScore?: number;
    aiComments?: string;
    matchedAt?: string;
    topSkillMatches?: string[];
    missingSkills?: string[];
  };
  interviewState?: {
    currentPhase: string;
    completedAt?: string;
    feedback?: {
      technicalSkills?: number;
      communicationSkills?: number;
      problemSolving?: number;
      cultureFit?: number;
      strengths: string[];
      areasOfImprovement: string[];
      overallImpression: string;
    };
  };
  job: {
    title: string;
    companyName: string;
  };
  candidateName?: string;
  createdAt: string;
  updatedAt: string;
}

// JobFilterWithData component that fetches job data
function JobFilterWithData({
  selectedJobId,
  onChange,
}: {
  selectedJobId: string;
  onChange: (id: string) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: async () => {
      const response = await fetch('/api/jobs/recruiter/list');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="text-xs text-slate-400">Loading job filters...</div>;
  }

  return <JobFilter jobs={data?.jobs || []} selectedJobId={selectedJobId} onChange={onChange} />;
}

export default function RecruiterJobApplicationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get('job') || '';

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Function to handle job filter changes
  const handleJobFilterChange = (selectedJobId: string) => {
    setPage(0);
    const params = new URLSearchParams(searchParams.toString());

    if (selectedJobId) {
      params.set('job', selectedJobId);
    } else {
      params.delete('job');
    }

    const newPath = `/dashboard/job-applications?${params.toString()}`;
    router.push(newPath);
  };

  // Define table columns
  const columns: ColumnDef<JobApplication>[] = [
    {
      accessorKey: 'job',
      header: 'Target Job',
      cell: ({ row }) => {
        const job = row.original.job;
        return (
          <div>
            <div className="font-medium text-slate-900">{job?.title || 'Unknown Position'}</div>
            <div className="text-xs text-slate-500">{job?.companyName || ''}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'candidateName',
      header: 'Candidate',
      cell: ({ row }) => {
        return (
          <div className="font-medium text-slate-900">
            {row.original.candidateName || 'Anonymous Candidate'}
          </div>
        );
      },
    },
    {
      accessorKey: 'parsedResume.matchScore',
      header: 'Match Score',
      cell: ({ row }) => {
        const score = row.original.parsedResume?.matchScore;
        return <MatchScoreBadge score={score} />;
      },
    },
    {
      accessorKey: 'interviewState',
      header: 'Interview',
      cell: ({ row }) => {
        const interviewState = row.original.interviewState;
        if (!interviewState) {
          return <StatusBadge status="not_started" />;
        }
        if (interviewState.completedAt) {
          return <StatusBadge status="completed" />;
        }
        return <StatusBadge status="in_progress" />;
      },
    },
    {
      accessorKey: 'status',
      header: 'Application Status',
      cell: ({ row }) => {
        return <StatusBadge status={row.original.status} />;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Applied Date',
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return (
          <span className="font-mono text-xs tabular-nums text-slate-600">
            {date ? format(new Date(date), 'MMM dd, yyyy') : 'N/A'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        return (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 text-xs font-medium hover:text-primary hover:border-primary/40 hover:bg-blue-50"
            >
              <Link href={`/dashboard/job-applications/${row.original._id}`}>
                Review
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  // Fetch job applications
  const { data: applications, isLoading } = useQuery({
    queryKey: ['job-applications', jobId, page, pageSize],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (jobId) {
        queryParams.append('jobId', jobId);
      }

      queryParams.append('page', String(page + 1));
      queryParams.append('limit', String(pageSize));

      const response = await fetch(`/api/applications/recruiter?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch applications');

      const data = await response.json();
      return {
        applications: data.applications || [],
        pagination: data.pagination || { totalPages: 1 },
      };
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Applications"
        description="Filter and evaluate applicants across all posted roles."
      />

      {/* Job Filter Card */}
      <Card className="bg-white border border-border shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-900">
            Filter by Job Posting
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Select a specific job listing to narrow down applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobFilterWithData selectedJobId={jobId} onChange={handleJobFilterChange} />
        </CardContent>
      </Card>

      {/* Applications Table */}
      <DataTable
        columns={columns}
        data={applications?.applications || []}
        searchKey="candidateName"
        searchPlaceholder="Filter candidate by name..."
        isLoading={isLoading}
        pagination={{
          pageIndex: page,
          pageSize: pageSize,
          pageCount: applications?.pagination?.totalPages || 1,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  );
}
