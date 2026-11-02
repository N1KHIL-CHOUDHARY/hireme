'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowRight, Briefcase, Search, Video } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { MatchScoreBadge, StatusBadge } from '@/components/ui/status-badge';

interface RecruiterInterviewApplication {
  _id?: string;
  id?: string;
  candidateName?: string;
  fileName?: string;
  status?: string;
  createdAt?: string;
  parsedResume?: {
    matchScore?: number;
  };
  job?: {
    title?: string;
    companyName?: string;
  };
  interviewState?: {
    status?: string;
  };
  interviewEvaluation?: Record<string, unknown>;
}

export default function RecruiterInterviewsPage() {
  const { data: session } = useSession();
  const [search, setSearch] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['recruiter-interviews', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/applications/recruiter?limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch recruiter applications');
      }
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  // Memoize raw applications
  const allApplications = React.useMemo<RecruiterInterviewApplication[]>(() => {
    return data?.applications || [];
  }, [data?.applications]);

  const filteredInterviews = React.useMemo(() => {
    return allApplications.filter((app: RecruiterInterviewApplication) => {
      const candidate = (app.candidateName || app.fileName || '').toLowerCase();
      const job = (app.job?.title || '').toLowerCase();
      const q = search.toLowerCase();

      if (q && !candidate.includes(q) && !job.includes(q)) {
        return false;
      }
      return true;
    });
  }, [allApplications, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interviews & Evaluations"
        description="Review candidate AI interview performances, benchmark scores, and monitoring records"
      />

      {/* Search and summary */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search candidate or job..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-white border-slate-200"
          />
        </div>

        <span className="text-xs text-slate-500 font-mono tabular-nums">
          {filteredInterviews.length} {filteredInterviews.length === 1 ? 'applicant' : 'applicants'}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-28 border-slate-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : filteredInterviews.length === 0 ? (
        <EmptyState
          icon={<Video className="h-8 w-8 text-slate-400" />}
          title="No interview records found"
          description="Candidates who apply to your active jobs can complete real-time AI technical interviews. Completed sessions and audio logs will appear here."
          action={
            <Link href="/dashboard/job-listing">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Briefcase className="h-4 w-4" />
                <span>View My Jobs</span>
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredInterviews.map((app: RecruiterInterviewApplication) => {
            const appId = app._id || app.id;
            const candidateName =
              app.candidateName || app.fileName?.replace(/\.[^/.]+$/, '') || 'Candidate';
            const jobTitle = app.job?.title || 'Unknown Position';
            const companyName = app.job?.companyName || 'Your Company';
            const matchScore = app.parsedResume?.matchScore;
            const dateStr = app.createdAt
              ? format(new Date(app.createdAt), 'MMM dd, yyyy')
              : 'Recent';

            return (
              <Card
                key={appId}
                className="border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] rounded-lg hover:border-slate-300 transition-colors"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs font-mono">
                        {candidateName.charAt(0).toUpperCase()}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900">{candidateName}</h3>
                          {matchScore !== undefined && (
                            <MatchScoreBadge score={matchScore} size="sm" showLabel />
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                          <span className="font-medium text-slate-800">{jobTitle}</span>
                          <span className="text-slate-300">•</span>
                          <span>{companyName}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono tabular-nums text-slate-500">
                            Applied {dateStr}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <StatusBadge status={app.status || 'applied'} />

                      <Link href={`/dashboard/job-applications/${appId}`}>
                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                          <span>Review Applicant</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
