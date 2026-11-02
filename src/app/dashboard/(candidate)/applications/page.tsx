import { Metadata } from 'next';

import { ApplicationsClient } from '@/components/applications/applications-client';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'My Applications | Candidate Dashboard | Hirelytics',
  description: 'Track and manage all your job applications in one place',
};

export default function CandidateApplicationsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="My Applications"
        description="Track the status and progress of all your job submissions"
      />

      <ApplicationsClient />
    </div>
  );
}
