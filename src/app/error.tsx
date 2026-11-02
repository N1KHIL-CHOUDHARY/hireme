'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-xl font-semibold tracking-tight text-slate-900">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          An unexpected error occurred while rendering this page. You can attempt to reload the view
          or return home.
        </p>

        {error.digest && (
          <div className="mb-6 rounded-md bg-slate-100 p-2 text-left font-mono text-xs text-slate-600 tabular-nums">
            <span className="font-semibold text-slate-700">Error ID:</span> {error.digest}
          </div>
        )}

        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Go Home
          </Button>
          <Button onClick={() => reset()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
