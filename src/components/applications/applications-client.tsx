'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ArrowRight,
  Bot,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Search,
  Sparkles,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { MatchScoreBadge, StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface ApplicationJob {
  title: string;
  companyName: string;
  location?: string;
  urlId?: string;
}

export interface ApplicationItem {
  _id: string;
  id?: string;
  jobId: string;
  userId: string;
  fileName: string;
  resumeUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  interviewState?: {
    status?: string;
    completedAt?: string;
  };
  interviewEvaluation?: {
    score?: number;
    feedback?: string;
  };
  parsedResume?: {
    matchScore?: number;
    matchedAt?: string;
    skills?: string[];
  };
  job?: ApplicationJob;
}

// Visual status stepper helper
function ApplicationTimeline({ status }: { status: string }) {
  const norm = status?.toLowerCase().trim();

  // Determine active step index:
  // 0 = Applied
  // 1 = Under Review / Shortlisted
  // 2 = Interview / Assessment
  // 3 = Decision (Offered / Rejected / Withdrawn)
  let currentStep = 0;
  if (norm === 'under review' || norm === 'under_review' || norm === 'reviewed') {
    currentStep = 1;
  } else if (
    norm === 'shortlisted' ||
    norm === 'interview scheduled' ||
    norm === 'interview_scheduled' ||
    norm === 'assessment'
  ) {
    currentStep = 2;
  } else if (
    norm === 'offered' ||
    norm === 'accepted' ||
    norm === 'rejected' ||
    norm === 'withdrawn'
  ) {
    currentStep = 3;
  }

  const isRejected = norm === 'rejected';
  const isWithdrawn = norm === 'withdrawn';
  const isOffered = norm === 'offered' || norm === 'accepted';

  const steps = [
    { label: 'Applied' },
    { label: 'Under Review' },
    { label: 'Interview' },
    {
      label: isRejected
        ? 'Rejected'
        : isWithdrawn
          ? 'Withdrawn'
          : isOffered
            ? 'Offered'
            : 'Decision',
    },
  ];

  return (
    <div className="w-full pt-3 pb-1">
      <div className="relative flex items-center justify-between">
        {/* Connecting progress bar */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-slate-200 z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-300 z-0"
          style={{
            width:
              currentStep === 0
                ? '12%'
                : currentStep === 1
                  ? '40%'
                  : currentStep === 2
                    ? '70%'
                    : '100%',
          }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep || (idx === currentStep && currentStep === 3);
          const isCurrent = idx === currentStep;

          let bubbleClasses = 'border-slate-300 bg-white text-slate-400';
          if (isCurrent && isRejected) {
            bubbleClasses = 'border-red-500 bg-red-50 text-red-600 ring-2 ring-red-100';
          } else if (isCurrent && isWithdrawn) {
            bubbleClasses = 'border-slate-400 bg-slate-100 text-slate-600';
          } else if (isCurrent && isOffered) {
            bubbleClasses =
              'border-emerald-600 bg-emerald-50 text-emerald-600 ring-2 ring-emerald-100';
          } else if (isCurrent) {
            bubbleClasses = 'border-primary bg-blue-50 text-primary ring-2 ring-blue-100';
          } else if (isCompleted) {
            bubbleClasses = 'border-primary bg-primary text-white';
          }

          return (
            <div
              key={step.label}
              className="relative z-10 flex flex-col items-center group cursor-default"
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-mono font-semibold transition-colors ${bubbleClasses}`}
              >
                {isCompleted && !isCurrent ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : isCurrent && isRejected ? (
                  <XCircle className="h-3.5 w-3.5" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`mt-1.5 text-[11px] font-medium whitespace-nowrap ${
                  isCurrent
                    ? 'text-slate-900 font-semibold'
                    : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ApplicationsClient() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = React.useState<string>('all');
  const [search, setSearch] = React.useState<string>('');

  const { data, isLoading } = useQuery<{
    success: boolean;
    applications: ApplicationItem[];
  }>({
    queryKey: ['candidate-applications', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/applications');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  const rawApplications = React.useMemo<ApplicationItem[]>(() => {
    return data?.applications || [];
  }, [data?.applications]);

  // Summary Metrics (restrained and non-dominating)
  const metrics = React.useMemo(() => {
    let total = 0;
    let inReview = 0;
    let interviews = 0;
    let offered = 0;

    rawApplications.forEach((app) => {
      total++;
      const s = app.status?.toLowerCase().trim();
      if (s === 'reviewed' || s === 'under review' || s === 'under_review' || s === 'shortlisted') {
        inReview++;
      } else if (
        s === 'interview scheduled' ||
        s === 'interview_scheduled' ||
        s === 'assessment' ||
        app.interviewState?.status === 'completed'
      ) {
        interviews++;
      } else if (s === 'offered' || s === 'accepted') {
        offered++;
      }
    });

    return { total, inReview, interviews, offered };
  }, [rawApplications]);

  // Filter applications by tab and search
  const filteredApplications = React.useMemo(() => {
    return rawApplications.filter((app) => {
      const statusNorm = app.status?.toLowerCase().trim();
      const jobTitle = app.job?.title?.toLowerCase() || '';
      const company = app.job?.companyName?.toLowerCase() || '';
      const query = search.toLowerCase();

      // Search matching
      if (query && !jobTitle.includes(query) && !company.includes(query)) {
        return false;
      }

      // Tab matching
      if (activeTab === 'all') return true;
      if (activeTab === 'active') {
        return (
          statusNorm === 'pending' ||
          statusNorm === 'applied' ||
          statusNorm === 'under review' ||
          statusNorm === 'under_review' ||
          statusNorm === 'reviewed'
        );
      }
      if (activeTab === 'interviews') {
        return (
          statusNorm === 'shortlisted' ||
          statusNorm === 'interview scheduled' ||
          statusNorm === 'interview_scheduled' ||
          statusNorm === 'assessment' ||
          app.interviewState?.status === 'completed'
        );
      }
      if (activeTab === 'decision') {
        return (
          statusNorm === 'offered' ||
          statusNorm === 'accepted' ||
          statusNorm === 'rejected' ||
          statusNorm === 'withdrawn'
        );
      }
      return true;
    });
  }, [rawApplications, activeTab, search]);

  const getCompanyInitial = (name?: string) => {
    return name?.trim() ? name.trim().charAt(0).toUpperCase() : 'C';
  };

  return (
    <div className="space-y-6">
      {/* Non-dominating Summary Metrics bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Applied</span>
            <FileText className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-slate-900">
            {metrics.total}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">In Review</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-slate-900">
            {metrics.inReview}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Interviews</span>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-slate-900">
            {metrics.interviews}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Offers</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-slate-900">
            {metrics.offered}
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="bg-slate-100 p-1 rounded-md">
            <TabsTrigger value="all" className="text-xs">
              All ({metrics.total})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              Active ({metrics.inReview})
            </TabsTrigger>
            <TabsTrigger value="interviews" className="text-xs">
              Interviews ({metrics.interviews})
            </TabsTrigger>
            <TabsTrigger value="decision" className="text-xs">
              Decisions ({metrics.offered})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search by job or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-white border-slate-200"
          />
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-44 border-slate-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-8 w-8 text-slate-400" />}
          title={
            rawApplications.length === 0
              ? 'No applications submitted yet'
              : 'No matching applications found'
          }
          description={
            rawApplications.length === 0
              ? 'Find career opportunities that align with your background and apply directly with AI-guided match benchmarking.'
              : 'Try clearing your search query or switching to another status tab.'
          }
          action={
            rawApplications.length === 0 ? (
              <Link href="/dashboard/jobs">
                <Button size="sm" className="gap-1.5">
                  <Compass className="h-4 w-4" />
                  <span>Explore Open Jobs</span>
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                Clear search
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const appId = app._id || app.id || '';
            const appDate = app.createdAt
              ? format(new Date(app.createdAt), 'MMM dd, yyyy')
              : 'Recent';

            const jobTitle = app.job?.title || 'Position';
            const companyName = app.job?.companyName || 'Company';
            const matchScore = app.parsedResume?.matchScore;
            const hasInterview =
              app.interviewState?.status === 'completed' || !!app.interviewEvaluation;

            return (
              <Card
                key={appId}
                className="border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] hover:border-slate-300 transition-colors rounded-lg overflow-hidden"
              >
                <CardHeader className="p-5 pb-3 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Company Avatar / Logo */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-base font-mono">
                        {getCompanyInitial(companyName)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-900 leading-tight">
                            {jobTitle}
                          </h3>
                          {matchScore !== undefined && (
                            <MatchScoreBadge score={matchScore} size="sm" showLabel />
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          <span>{companyName}</span>
                          <span className="text-slate-300">•</span>
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-mono tabular-nums">Applied {appDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <StatusBadge status={app.status} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Status Timeline */}
                  <div>
                    <span className="text-xs text-slate-500 font-medium block mb-1">
                      Application Progress
                    </span>
                    <ApplicationTimeline status={app.status} />
                  </div>

                  {/* Interview & Evaluation Details Callout */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 bg-slate-50/50 -mx-5 -mb-5 p-4 rounded-b-lg">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Bot className="h-4 w-4 text-primary shrink-0" />
                      {hasInterview ? (
                        <span>
                          <strong className="text-slate-900 font-semibold">
                            AI Interview Completed:
                          </strong>{' '}
                          {app.interviewEvaluation?.score
                            ? `Evaluation Score ${Math.round(app.interviewEvaluation.score)}%`
                            : 'Transcript and feedback ready'}
                        </span>
                      ) : (
                        <span>
                          <strong className="text-slate-900 font-semibold">
                            Interview Status:
                          </strong>{' '}
                          Ready for interview simulation and skill verification
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {hasInterview ? (
                        <Link href={`/dashboard/applications/${appId}/interview/feedback`}>
                          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            <span>View Interview Feedback</span>
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/dashboard/applications/${appId}/interview`}>
                          <Button size="sm" className="h-8 text-xs gap-1.5">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Start AI Interview</span>
                          </Button>
                        </Link>
                      )}

                      <Link href={`/dashboard/applications/${appId}`}>
                        <Button size="sm" variant="ghost" className="h-8 text-xs gap-1">
                          <span>Details</span>
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
