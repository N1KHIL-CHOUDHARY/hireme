import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getJobById } from '@/actions/jobs';
import { InterviewCompletion } from '@/components/interview/interview-completion';
import { InterviewSession } from '@/components/interview/interview-session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { connectToDatabase } from '@/lib/database';
import { JobApplication } from '@/models/job-application';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const applicationId = params.id;

  try {
    await connectToDatabase();
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      return {
        title: 'Interview Session | Hirelytics',
        description: 'AI-powered interview session',
      };
    }

    const job = await getJobById(application.jobId);

    return {
      title: `Interview Session for ${job.title} | Hirelytics`,
      description: `Live AI-powered interview session for the ${job.title} position at ${job.companyName}`,
    };
  } catch {
    return {
      title: 'Interview Session | Hirelytics',
      description: 'AI-powered interview session',
    };
  }
}

export default async function InterviewSessionPage(props: Props) {
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

    // Check if interview duration is missing
    if (!job.interviewDuration) {
      return (
        <div className="py-12 max-w-xl mx-auto">
          <EmptyState
            title="Configuration Incomplete"
            description="Interview duration has not been configured. Please contact the recruiter."
            action={{
              label: 'Return to Dashboard',
              href: '/dashboard',
            }}
          />
        </div>
      );
    }

    // Check if interview is already completed
    const interviewState = application.interviewState;
    if (interviewState?.currentPhase === 'completed') {
      return (
        <div className="py-8 max-w-2xl mx-auto">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="py-4 border-b border-slate-100">
              <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
                {job.title} - Interview Complete
              </CardTitle>
              <p className="text-xs text-slate-500">Your interview is already completed</p>
            </CardHeader>
            <CardContent className="p-4">
              <InterviewCompletion
                applicationId={applicationId}
                jobTitle={job.title}
                companyName={job.companyName}
                redirectUrl={`/dashboard/applications/${applicationId}/feedback`}
              />
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                {job.title} - Virtual Interview
              </CardTitle>
              <p className="text-xs text-slate-500">Live AI session for {job.companyName}</p>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <InterviewSession
              applicationId={applicationId}
              jobTitle={job.title}
              companyName={job.companyName}
              interviewDuration={job.interviewDuration}
            />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error loading interview session page:', error);
    notFound();
  }
}
