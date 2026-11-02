import { FileQuestion } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';

export default function JobDetailNotFound() {
  return (
    <div className="py-12 flex justify-center">
      <EmptyState
        icon={<FileQuestion className="h-10 w-10 text-slate-400" />}
        title="Job Listing Not Found"
        description="The job listing you're looking for doesn't exist, has been removed, or has expired."
        action={{
          label: 'Browse available jobs',
          href: '/dashboard/jobs',
        }}
        className="max-w-md w-full"
      />
    </div>
  );
}
