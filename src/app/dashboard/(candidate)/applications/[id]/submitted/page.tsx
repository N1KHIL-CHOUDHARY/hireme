import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { connectToDatabase } from '@/lib/database';
import { JobApplication } from '@/models/job-application';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationSubmittedPage(props: Props) {
  const params = await props.params;
  const applicationId = params.id;

  try {
    await connectToDatabase();
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      notFound();
    }

    return (
      <div className="container mx-auto py-12 max-w-lg">
        <Card className="border-slate-200 bg-white shadow-sm p-8 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-blue-50 text-primary flex items-center justify-center mb-6">
            <CheckCircle2 className="h-9 w-9 text-primary" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Application Submitted!
          </h1>

          <p className="text-sm text-slate-600 mt-2 max-w-sm leading-relaxed">
            Your job application has been successfully submitted. You can now proceed to the virtual
            AI interview to complete your candidacy assessment.
          </p>

          <CardContent className="mt-8 space-y-3 w-full p-0">
            <Link
              href={`/dashboard/applications/${applicationId}/interview`}
              className="w-full block"
            >
              <Button className="w-full gap-2 h-10 text-sm">
                Start Virtual Interview <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/dashboard/jobs" className="w-full block">
              <Button variant="outline" className="w-full h-10 text-sm">
                Browse More Jobs
              </Button>
            </Link>

            <Link href="/dashboard" className="w-full block">
              <Button variant="ghost" className="w-full h-10 text-sm text-slate-600">
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error loading application:', error);
    notFound();
  }
}
