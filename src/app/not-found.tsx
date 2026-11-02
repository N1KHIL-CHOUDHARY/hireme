import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
        <EmptyState
          icon={<FileQuestion className="h-8 w-8 text-slate-400" />}
          title="Page Not Found"
          description="The page you are looking for doesn't exist, has been removed, or has moved to a new URL."
          action={
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline">Home</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          }
        />
      </div>
    </div>
  );
}

