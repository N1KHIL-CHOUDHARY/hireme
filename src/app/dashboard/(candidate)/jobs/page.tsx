import { Metadata } from 'next';

import { JobsList } from '@/components/jobs/jobs-list';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Explore Jobs | Hirelytics',
  description: 'Discover and apply to curated career opportunities matching your skillset',
};

export default function CandidateJobsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Explore Jobs"
        description="Discover open roles, filter by work mode and skills, and apply with instant AI match benchmarking"
      />

      <JobsList />
    </div>
  );
}
