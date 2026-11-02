import { FileQuestion } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';

export default function JobNotFound() {
  return (
    <div className="py-12 flex justify-center">
      <EmptyState
        icon={<FileQuestion className="h-10 w-10 text-slate-400" />}
        title="Jobs Not Found"
        description="The job listings you're looking for cannot be found or have been removed."
        action={{
          label: 'Browse all jobs',
          href: '/dashboard/jobs',
        }}
        className="max-w-md w-full"
      />
    </div>
  );
}
