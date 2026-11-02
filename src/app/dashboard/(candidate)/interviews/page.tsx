'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Bot, Building2, Calendar, Clock, Compass, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import * as React from 'react';

import { ApplicationItem } from '@/components/applications/applications-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { MatchScoreBadge, StatusBadge } from '@/components/ui/status-badge';

export default function CandidateInterviewsPage() {
  const { data: session } = useSession();

  const { data, isLoading } = useQuery<{
    success: boolean;
    applications: ApplicationItem[];
  }>({
    queryKey: ['candidate-interviews', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/applications');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  const applications = data?.applications || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Interviews"
        description="Prepare with automated technical simulations and review performance evaluations"
      />

      {/* AI Interview Practice Banner */}
      <Card className="border-blue-100 bg-blue-50/50 p-6 rounded-lg shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Voice & Text Interactive AI</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Interactive AI Interview Simulations
            </h3>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Every job application includes a dedicated AI-evaluated technical session. You are
              asked practical engineering questions, scored on technical accuracy, and receive
              actionable benchmark feedback.
            </p>
          </div>

          <Link href="/dashboard/jobs">
            <Button size="sm" className="gap-2 shrink-0">
              <Compass className="h-4 w-4" />
              <span>Explore Roles with AI Interviews</span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* Interview List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-32 border-slate-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={<Bot className="h-8 w-8 text-slate-400" />}
          title="No interview sessions yet"
          description="Apply for open positions to generate personalized AI interview questions tailored to the required skills."
          action={
            <Link href="/dashboard/jobs">
              <Button size="sm" className="gap-1.5">
                <Compass className="h-4 w-4" />
                <span>Explore Jobs</span>
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Your Interview Sessions ({applications.length})
          </h2>

          <div className="grid gap-4">
            {applications.map((app) => {
              const appId = app._id || app.id || '';
              const isCompleted =
                app.interviewState?.status === 'completed' || !!app.interviewEvaluation;
              const score = app.interviewEvaluation?.score;
              const dateStr = app.createdAt
                ? format(new Date(app.createdAt), 'MMM dd, yyyy')
                : 'Recent';

              return (
                <Card
                  key={appId}
                  className="border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] rounded-lg hover:border-slate-300 transition-colors"
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-900">
                            {app.job?.title || 'Job Interview'}
                          </h3>
                          {score !== undefined && (
                            <MatchScoreBadge score={score} size="sm" showLabel />
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          <span>{app.job?.companyName || 'Company'}</span>
                          <span className="text-slate-300">•</span>
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-mono tabular-nums">{dateStr}</span>
                          <span className="text-slate-300">•</span>
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>~15-30 min</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        {isCompleted ? (
                          <>
                            <StatusBadge status="completed" />
                            <Link href={`/dashboard/applications/${appId}/interview/feedback`}>
                              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                <span>Feedback & Report</span>
                              </Button>
                            </Link>
                          </>
                        ) : (
                          <>
                            <StatusBadge status="in_progress" customLabel="Ready" />
                            <Link href={`/dashboard/applications/${appId}/interview`}>
                              <Button size="sm" className="h-8 text-xs gap-1.5">
                                <Play className="h-3.5 w-3.5" />
                                <span>Start Interview</span>
                              </Button>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
