import { Briefcase } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default function JobNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
        <EmptyState
          icon={<Briefcase className="h-8 w-8 text-slate-400" />}
          title="Job listing not found"
          description="The job opportunity you are looking for does not exist, has expired, or was removed."
          action={
            <Link href="/jobs">
              <Button>Browse Open Jobs</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
