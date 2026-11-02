'use client';

import { Briefcase, Loader2 } from 'lucide-react';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { IJob } from '@/models/job';

import { inferJobAttributes, JobCard } from './job-card';
import { JobFilter, JobFilterValues } from './job-filter';

interface JobWithId extends Omit<IJob, '_id'> {
  id: string;
}

export function JobsList() {
  const [jobs, setJobs] = React.useState<JobWithId[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(false);
  const [page, setPage] = React.useState(1);

  const [filters, setFilters] = React.useState<JobFilterValues>({
    search: '',
    jobType: 'all',
    experience: 'all',
    workMode: 'all',
    location: 'all',
    salary: 'any',
    category: 'all',
    skills: [],
    postingDate: 'any',
    sortBy: 'newest',
  });

  const { ref, inView } = useInView();

  const buildQueryString = React.useCallback(
    (pageNum: number) => {
      const params = new URLSearchParams();
      params.append('page', pageNum.toString());
      params.append('limit', '24');

      if (filters.search) params.append('search', filters.search);
      if (filters.skills.length > 0) params.append('skills', filters.skills.join(','));
      if (filters.location && filters.location !== 'all')
        params.append('location', filters.location);

      return params.toString();
    },
    [filters.search, filters.skills, filters.location]
  );

  // Initial load and filter changes
  React.useEffect(() => {
    let isCancelled = false;
    const loadJobs = async () => {
      setLoading(true);
      try {
        const queryString = buildQueryString(1);
        const response = await fetch(`/api/jobs/list?${queryString}`);

        if (!response.ok) {
          throw new Error(`Error fetching jobs: ${response.status}`);
        }

        const result = await response.json();
        if (!isCancelled) {
          setJobs(result.jobs || []);
          setHasMore(Boolean(result.hasMore));
          setPage(1);
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadJobs();
    return () => {
      isCancelled = true;
    };
  }, [buildQueryString]);

  // Load more when scrolled to bottom
  React.useEffect(() => {
    const loadMoreJobs = async () => {
      if (inView && hasMore && !loading) {
        const nextPage = page + 1;
        setLoading(true);

        try {
          const queryString = buildQueryString(nextPage);
          const response = await fetch(`/api/jobs/list?${queryString}`);

          if (!response.ok) {
            throw new Error(`Error fetching more jobs: ${response.status}`);
          }

          const result = await response.json();
          setJobs((prevJobs) => [...prevJobs, ...(result.jobs || [])]);
          setHasMore(Boolean(result.hasMore));
          setPage(nextPage);
        } catch (error) {
          console.error('Failed to load more jobs:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadMoreJobs();
  }, [inView, hasMore, loading, page, buildQueryString]);

  // Client-side refined filtering & sorting
  const filteredAndSortedJobs = React.useMemo(() => {
    return jobs
      .filter((job) => {
        const attrs = inferJobAttributes(job);

        // Filter: Job Type
        if (filters.jobType !== 'all' && attrs.jobType !== filters.jobType) {
          return false;
        }

        // Filter: Experience
        if (filters.experience !== 'all' && attrs.experience !== filters.experience) {
          return false;
        }

        // Filter: Work Mode
        if (filters.workMode !== 'all' && attrs.workMode !== filters.workMode) {
          return false;
        }

        // Filter: Category
        if (filters.category !== 'all') {
          const cat = filters.category.toLowerCase();
          const text =
            `${job.title} ${job.description} ${(job.skills || []).join(' ')}`.toLowerCase();
          if (!text.includes(cat)) {
            return false;
          }
        }

        // Filter: Salary threshold
        if (filters.salary !== 'any') {
          const minRequired = parseInt(filters.salary, 10);
          if (job.salary) {
            const matches = job.salary.replace(/[^0-9]/g, '');
            const parsed = parseInt(matches, 10);
            if (!isNaN(parsed) && parsed < minRequired) {
              return false;
            }
          }
        }

        // Filter: Posting Date
        if (filters.postingDate !== 'any') {
          const now = Date.now();
          const jobTime = new Date(job.createdAt).getTime();
          const diffHours = (now - jobTime) / (1000 * 60 * 60);

          if (filters.postingDate === '24h' && diffHours > 24) return false;
          if (filters.postingDate === 'week' && diffHours > 24 * 7) return false;
          if (filters.postingDate === 'month' && diffHours > 24 * 30) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (filters.sortBy === 'salary') {
          const parseSalary = (s?: string) => {
            if (!s) return 0;
            const num = parseInt(s.replace(/[^0-9]/g, ''), 10);
            return isNaN(num) ? 0 : num;
          };
          return parseSalary(b.salary) - parseSalary(a.salary);
        }
        if (filters.sortBy === 'relevance' && filters.search) {
          const searchLower = filters.search.toLowerCase();
          const aTitle = a.title.toLowerCase().includes(searchLower) ? 2 : 0;
          const bTitle = b.title.toLowerCase().includes(searchLower) ? 2 : 0;
          return bTitle - aTitle;
        }
        return 0;
      });
  }, [jobs, filters]);

  return (
    <div className="space-y-6">
      {/* Comprehensive Filter Card */}
      <Card className="p-4 sm:p-5 bg-white border-slate-200 shadow-[0_1px_2px_rgb(15_23_42/0.04)] rounded-lg">
        <JobFilter
          filters={filters}
          onChange={setFilters}
          totalResults={filteredAndSortedJobs.length}
        />
      </Card>

      {/* Loading Skeleton during initial query */}
      {loading && jobs.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-4 border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-12 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedJobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-8 w-8 text-slate-400" />}
          title="No open positions found"
          description="Try relaxing your filters, searching for alternative keywords, or check back soon for newly posted opportunities."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({
                  search: '',
                  jobType: 'all',
                  experience: 'all',
                  workMode: 'all',
                  location: 'all',
                  salary: 'any',
                  category: 'all',
                  skills: [],
                  postingDate: 'any',
                  sortBy: 'newest',
                })
              }
            >
              Clear all filters
            </Button>
          }
        />
      ) : (
        <>
          {/* Responsive Job Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedJobs.map((job) => (
              <JobCard key={job.id || (job as any)._id} job={job} /> // eslint-disable-line @typescript-eslint/no-explicit-any
            ))}
          </div>

          {/* Infinite Scroll Trigger / Loader */}
          <div className="flex justify-center pt-4 pb-8" ref={ref}>
            {loading && jobs.length > 0 && (
              <Button disabled variant="outline" size="sm" className="w-full max-w-sm">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                Loading more opportunities...
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
