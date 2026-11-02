import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getJobById } from '@/actions/jobs';
import { InterviewClient } from '@/components/interview/interview-client';
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
        title: 'Virtual Interview | Hirelytics',
        description: 'Virtual interview for your job application',
      };
    }

    const job = await getJobById(application.jobId);

    return {
      title: `Virtual Interview for ${job.title} | Hirelytics`,
      description: `Virtual interview for the ${job.title} position at ${job.companyName}`,
    };
  } catch {
    return {
      title: 'Virtual Interview | Hirelytics',
      description: 'Virtual interview for your job application',
    };
  }
}

export default async function InterviewPage(props: Props) {
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
            title="Interview Incomplete"
            description="Interview duration has not been configured for this job opening. Please contact the recruiter."
            action={{
              label: 'Back to Application',
              href: `/dashboard/applications/${applicationId}`,
            }}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Link
          href={`/dashboard/applications/${applicationId}`}
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to application
        </Link>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              {job.title} - Virtual AI Interview
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">Virtual interview for {job.companyName}</p>
          </CardHeader>
          <CardContent className="pt-6">
            <InterviewClient
              applicationId={applicationId}
              jobTitle={job.title}
              companyName={job.companyName}
              location={job.location}
              skills={job.skills}
              interviewDuration={job.interviewDuration}
            />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error loading interview page:', error);
    notFound();
  }
}
