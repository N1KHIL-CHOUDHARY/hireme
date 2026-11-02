'use client';

import { Bookmark, Compass, Search } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { useSavedJobs } from '@/hooks/use-saved-jobs';
import { IJob } from '@/models/job';

export default function SavedJobsPage() {
  const { savedJobs, isLoaded } = useSavedJobs();
  const [search, setSearch] = React.useState('');

  const filteredJobs = React.useMemo(() => {
    if (!search.trim()) return savedJobs;
    const q = search.toLowerCase();
    return savedJobs.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.companyName.toLowerCase().includes(q) ||
        (job.skills || []).some((s) => s.toLowerCase().includes(q))
    );
  }, [savedJobs, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Jobs"
        description="Review and apply to opportunities you have bookmarked for later"
        actions={
          <Link href="/dashboard/jobs">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Compass className="h-4 w-4" />
              <span>Explore More Jobs</span>
            </Button>
          </Link>
        }
      />

      {!isLoaded ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-48 border-slate-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-8 w-8 text-slate-400" />}
          title="No saved jobs yet"
          description="When you discover interesting opportunities on the Explore Jobs page, click the bookmark icon to save them here for quick access."
          action={
            <Link href="/dashboard/jobs">
              <Button size="sm" className="gap-1.5">
                <Compass className="h-4 w-4" />
                <span>Explore Jobs</span>
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Top Search bar within saved jobs */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search saved jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-white border-slate-200"
              />
            </div>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} saved
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <EmptyState
              title="No matches found"
              description={`No saved jobs matched "${search}". Try searching for another keyword.`}
              action={
                <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredJobs.map((job) => (
                <JobCard key={job.urlId || job.id} job={job as unknown as IJob} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
