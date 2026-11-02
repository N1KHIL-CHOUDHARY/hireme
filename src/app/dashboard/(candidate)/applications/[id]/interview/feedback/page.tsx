import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getJobById } from '@/actions/jobs';
import { AutoGenerateFeedbackEnhanced } from '@/components/interview/auto-generate-feedback-enhanced';
import { FeedbackContent } from '@/components/interview/feedback-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { connectToDatabase } from '@/lib/database';
import { JobApplication } from '@/models/job-application';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Interview Feedback | Hirelytics',
  };
}

export default async function InterviewFeedbackPage(props: Props) {
  const params = await props.params;
  const applicationId = params.id;

  try {
    await connectToDatabase();
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      notFound();
    }

    const job = await getJobById(application.jobId);
    if (!job) {
      notFound();
    }

    // Check if interview is completed and has evaluation
    const interviewState = application.interviewState;
    if (!interviewState || interviewState.currentPhase !== 'completed') {
      return (
        <div className="py-12 max-w-xl mx-auto">
          <EmptyState
            title="Interview Not Completed"
            description="You need to complete the virtual interview before viewing feedback."
            action={{
              label: 'Go to Virtual Interview',
              href: `/dashboard/applications/${applicationId}/interview`,
            }}
          />
        </div>
      );
    }

    const feedback = interviewState.feedback || {};
    const hasEvaluation = !!feedback.technicalSkills;

    if (!hasEvaluation) {
      return (
        <div className="py-12 max-w-xl mx-auto">
          <Card className="border-slate-200 bg-white shadow-sm text-center p-8 space-y-4">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Evaluation In Progress
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Your interview responses are being analyzed by our AI system. This usually takes less
              than a minute.
            </p>
            <div className="pt-2 space-y-4">
              <AutoGenerateFeedbackEnhanced applicationId={applicationId} />
              <div>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    const serializedFeedback = {
      technicalSkills: feedback.technicalSkills || 0,
      communicationSkills: feedback.communicationSkills || 0,
      problemSolving: feedback.problemSolving || 0,
      cultureFit: feedback.cultureFit || 0,
      overallImpression: feedback.overallImpression || '',
      strengths: Array.isArray(feedback.strengths) ? [...feedback.strengths] : [],
      areasOfImprovement: Array.isArray(feedback.areasOfImprovement)
        ? [...feedback.areasOfImprovement]
        : [],
    };

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link
          href={`/dashboard/applications/${applicationId}`}
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to application details
        </Link>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="text-center py-6 border-b border-slate-100">
            <div className="flex justify-center mb-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 border border-green-200">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              {job.title} - Interview Assessment
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              AI performance assessment for {job.companyName}
            </p>
            {interviewState.feedbackGeneratedAt && (
              <p className="text-[11px] font-mono tabular-nums text-slate-400 mt-1">
                Generated: {new Date(interviewState.feedbackGeneratedAt).toLocaleString()}
              </p>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-end mb-4">
              <AutoGenerateFeedbackEnhanced applicationId={applicationId} />
            </div>

            <FeedbackContent
              initialFeedback={serializedFeedback}
              applicationId={applicationId.toString()}
              jobId={job._id ? job._id.toString() : job.id.toString()}
            />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error loading feedback page:', error);
    notFound();
  }
}
