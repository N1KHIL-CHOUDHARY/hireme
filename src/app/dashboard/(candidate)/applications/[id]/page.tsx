import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  FileText,
  Lightbulb,
  ThumbsUp,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MatchScoreBadge, StatusBadge } from '@/components/ui/status-badge';
import { connectToDatabase } from '@/lib/database';
import { JobApplication } from '@/models/job-application';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationDetailsPage(props: Props) {
  const params = await props.params;
  const applicationId = params.id;

  try {
    await connectToDatabase();
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      notFound();
    }

    // Format date
    const formatDate = (date: Date | string) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    const hasInterviewState = !!application.interviewState;
    const isInterviewCompleted = application.interviewState?.completed;

    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4">
          <Link
            href="/dashboard/applications"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to applications
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Application Details
                </h1>
                <StatusBadge status={application.status} />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Submitted on{' '}
                <span className="font-mono tabular-nums">{formatDate(application.createdAt)}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!isInterviewCompleted ? (
                <Link href={`/dashboard/applications/${applicationId}/interview`}>
                  <Button size="sm" className="gap-2">
                    {hasInterviewState ? 'Continue Interview' : 'Start Virtual Interview'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/dashboard/applications/${applicationId}/interview/feedback`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    View Interview Feedback
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Application Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <div className="flex items-center text-slate-500 gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <span>Resume</span>
                </div>
                <p
                  className="font-medium text-slate-900 truncate font-mono"
                  title={application.fileName}
                >
                  {application.fileName || 'Uploaded Resume'}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <div className="flex items-center text-slate-500 gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Application Status</span>
                </div>
                <div>
                  <StatusBadge status={application.status} />
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <div className="flex items-center text-slate-500 gap-1.5">
                  <Brain className="h-3.5 w-3.5 text-slate-400" />
                  <span>Resume Analysis</span>
                </div>
                <p className="font-medium text-slate-900">
                  {application.parsedResume ? (
                    <span className="text-green-600 font-mono tabular-nums">Completed</span>
                  ) : (
                    <span className="text-slate-400">Pending</span>
                  )}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <div className="flex items-center text-slate-500 gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Interview</span>
                </div>
                <p className="font-medium">
                  {isInterviewCompleted ? (
                    <span className="text-green-600">Completed</span>
                  ) : hasInterviewState ? (
                    <span className="text-amber-600">In Progress</span>
                  ) : (
                    <span className="text-slate-500">Not Started</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resume Analysis Section */}
        {application.parsedResume && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Resume Match Analysis
                </CardTitle>
                <CardDescription>
                  Automated AI screening evaluation against the job profile
                </CardDescription>
              </div>
              {application.parsedResume.matchScore !== undefined && (
                <MatchScoreBadge score={application.parsedResume.matchScore} />
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Bar */}
              {application.parsedResume.matchScore !== undefined && (
                <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-6">
                  <div className="text-center sm:text-left flex-shrink-0">
                    <span className="text-4xl font-mono font-bold tabular-nums text-slate-900">
                      {application.parsedResume.matchScore}%
                    </span>
                    <p className="text-xs text-slate-500">Overall Match Score</p>
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          application.parsedResume.matchScore >= 70
                            ? 'bg-green-600'
                            : application.parsedResume.matchScore >= 50
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${application.parsedResume.matchScore}%` }}
                      />
                    </div>
                    {application.parsedResume.analyzedAt && (
                      <p className="text-xs text-slate-400 font-mono tabular-nums">
                        Evaluated on {formatDate(application.parsedResume.analyzedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Skills breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {application.parsedResume.topSkillMatches &&
                  application.parsedResume.topSkillMatches.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Matching Skills
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {application.parsedResume.topSkillMatches.map(
                          (skill: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs font-normal bg-slate-100 text-slate-700 border-slate-200"
                            >
                              {skill}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {application.parsedResume.missingSkills &&
                  application.parsedResume.missingSkills.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Skills to Develop
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {application.parsedResume.missingSkills.map(
                          (skill: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs font-normal bg-red-50/60 text-red-700 border-red-200"
                            >
                              {skill}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* AI Comments */}
              {application.parsedResume.aiComments && (
                <div className="p-4 rounded-lg border border-slate-100 bg-white space-y-1.5">
                  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    AI Evaluation Summary
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {application.parsedResume.aiComments}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Interview Feedback Section */}
        {application.interviewState?.feedback && isInterviewCompleted ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Interview Assessment
                </CardTitle>
                <CardDescription>Detailed results from your AI virtual interview</CardDescription>
              </div>
              {application.interviewState.completedAt && (
                <span className="text-xs font-mono tabular-nums text-slate-500">
                  Completed {formatDate(application.interviewState.completedAt)}
                </span>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ratings Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {application.interviewState.feedback.technicalSkills !== undefined && (
                  <div className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50">
                    <span className="text-xs text-slate-500 block mb-1">Technical</span>
                    <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                      {application.interviewState.feedback.technicalSkills}
                      <span className="text-xs font-normal text-slate-500"> / 5</span>
                    </span>
                  </div>
                )}
                {application.interviewState.feedback.communicationSkills !== undefined && (
                  <div className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50">
                    <span className="text-xs text-slate-500 block mb-1">Communication</span>
                    <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                      {application.interviewState.feedback.communicationSkills}
                      <span className="text-xs font-normal text-slate-500"> / 5</span>
                    </span>
                  </div>
                )}
                {application.interviewState.feedback.problemSolving !== undefined && (
                  <div className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50">
                    <span className="text-xs text-slate-500 block mb-1">Problem Solving</span>
                    <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                      {application.interviewState.feedback.problemSolving}
                      <span className="text-xs font-normal text-slate-500"> / 5</span>
                    </span>
                  </div>
                )}
                {application.interviewState.feedback.cultureFit !== undefined && (
                  <div className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50">
                    <span className="text-xs text-slate-500 block mb-1">Culture Fit</span>
                    <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                      {application.interviewState.feedback.cultureFit}
                      <span className="text-xs font-normal text-slate-500"> / 5</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Overall Impression */}
              {application.interviewState.feedback.overallImpression && (
                <div className="p-4 rounded-lg border border-slate-100 bg-white space-y-1">
                  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Overall Impression
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {application.interviewState.feedback.overallImpression}
                  </p>
                </div>
              )}

              {/* Strengths & Improvement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {application.interviewState.feedback.strengths &&
                  application.interviewState.feedback.strengths.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center text-xs font-semibold text-slate-700 uppercase tracking-wider gap-1.5">
                        <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                        <span>Strengths</span>
                      </div>
                      <ul className="space-y-2">
                        {application.interviewState.feedback.strengths.map(
                          (item: string, index: number) => (
                            <li
                              key={index}
                              className="text-xs text-slate-700 flex items-start gap-2 bg-green-50/50 border border-green-100 p-2.5 rounded-md"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {application.interviewState.feedback.areasOfImprovement &&
                  application.interviewState.feedback.areasOfImprovement.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center text-xs font-semibold text-slate-700 uppercase tracking-wider gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                        <span>Areas for Improvement</span>
                      </div>
                      <ul className="space-y-2">
                        {application.interviewState.feedback.areasOfImprovement.map(
                          (item: string, index: number) => (
                            <li
                              key={index}
                              className="text-xs text-slate-700 flex items-start gap-2 bg-amber-50/50 border border-amber-100 p-2.5 rounded-md"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                              <span>{item}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        ) : (
          !isInterviewCompleted && (
            <Card className="border-dashed border-slate-200 bg-slate-50/30">
              <CardContent className="py-8 text-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 text-primary flex items-center justify-center mx-auto">
                  <Brain className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-900">Virtual Interview Not Completed</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Complete the virtual AI interview to evaluate your technical and communication
                    skills and move forward in the hiring process.
                  </p>
                </div>
                <div className="pt-2">
                  <Link href={`/dashboard/applications/${applicationId}/interview`}>
                    <Button size="sm" className="gap-2">
                      {hasInterviewState ? 'Resume Interview' : 'Start Virtual Interview'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    );
  } catch (error) {
    console.error('Error loading application:', error);
    notFound();
  }
}
