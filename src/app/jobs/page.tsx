import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { JobsList } from '@/components/jobs/jobs-list';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Explore Careers | Hirelytics',
  description: 'Find your next opportunity with our curated AI-evaluated job listings.',
};

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/hirelytics-logo.svg"
              alt="Hirelytics"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="text-base font-semibold tracking-tight text-slate-900">
              Hirelytics
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Create account</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Explore Opportunities
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Browse open positions evaluated with real-time AI skill benchmarking.
          </p>
        </div>
        <JobsList />
      </main>
    </div>
  );
}
