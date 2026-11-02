'use client';

import { Bookmark, Building2, Calendar, Clock, Eye, MapPin } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { getCountryLabel } from '@/data/countries';
import { getSkillLabel } from '@/data/technical-skills';
import { useSavedJobs } from '@/hooks/use-saved-jobs';
import { IJob } from '@/models/job';

import { JobApplyButton } from './job-apply-button';
import { JobApplyRedirectButton } from './job-apply-redirect-button';
import { JobShareButtons } from './job-share-buttons';

interface JobWithId extends Omit<IJob, '_id'> {
  id: string;
  category?: string;
  jobType?: string;
  workMode?: string;
  experience?: string;
}

interface JobCardProps {
  job: JobWithId | IJob;
  onRemoveSaved?: () => void;
}

export function inferJobAttributes(job: {
  title: string;
  description?: string;
  requirements?: string;
  location?: string;
  jobType?: string;
  workMode?: string;
  experience?: string;
}) {
  if (job.jobType && job.workMode && job.experience) {
    return {
      workMode: job.workMode,
      jobType: job.jobType,
      experience: job.experience,
    };
  }

  const text = `${job.title} ${job.description || ''} ${job.requirements || ''} ${
    job.location || ''
  }`.toLowerCase();

  // Work Mode
  let workMode = job.workMode || 'On-site';
  if (!job.workMode) {
    if (text.includes('remote') || text.includes('anywhere') || text.includes('work from home')) {
      workMode = 'Remote';
    } else if (text.includes('hybrid')) {
      workMode = 'Hybrid';
    }
  }

  // Job Type
  let jobType = job.jobType || 'Full-time';
  if (!job.jobType) {
    if (text.includes('intern') || text.includes('internship')) {
      jobType = 'Internship';
    } else if (
      text.includes('contract') ||
      text.includes('freelance') ||
      text.includes('contractor')
    ) {
      jobType = 'Contract';
    } else if (text.includes('part-time') || text.includes('part time')) {
      jobType = 'Part-time';
    }
  }

  // Experience
  let experience = job.experience || 'Mid-level';
  if (!job.experience) {
    if (
      text.includes('lead') ||
      text.includes('director') ||
      text.includes('head of') ||
      text.includes('architect') ||
      text.includes('8+ years') ||
      text.includes('10+ years')
    ) {
      experience = 'Lead';
    } else if (
      text.includes('senior') ||
      text.includes('sr.') ||
      text.includes('5+ years') ||
      text.includes('6+ years') ||
      text.includes('7+ years')
    ) {
      experience = 'Senior';
    } else if (
      text.includes('junior') ||
      text.includes('jr.') ||
      text.includes('entry') ||
      text.includes('graduate') ||
      text.includes('0-2 years') ||
      text.includes('1-2 years')
    ) {
      experience = 'Entry-level';
    }
  }

  return { workMode, jobType, experience };
}

function formatPostedTime(dateStringOrDate?: Date | string) {
  if (!dateStringOrDate) return 'Recent';
  const date = new Date(dateStringOrDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function JobCard({ job }: JobCardProps) {
  const { isSaved, toggleSave } = useSavedJobs();

  const formattedExpiry = new Date(job.expiryDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const isExpired = new Date(job.expiryDate) < new Date();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  const { workMode, jobType, experience } = inferJobAttributes(job);
  const postedTime = formatPostedTime(job.createdAt);
  const identifier = job.urlId || (job as any).id || (job as any)._id; // eslint-disable-line @typescript-eslint/no-explicit-any
  const saved = isSaved(identifier);

  const getCompanyInitial = (name: string) => {
    return name?.trim() ? name.trim().charAt(0).toUpperCase() : 'C';
  };

  return (
    <Card className="group h-full flex flex-col justify-between border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all duration-150 rounded-lg">
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Company Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-sm">
              {getCompanyInitial(job.companyName)}
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href={isDashboard ? `/dashboard/jobs/${job.urlId}` : `/jobs/${job.urlId}`}
                className="hover:underline"
              >
                <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-1">
                  {job.title}
                </h3>
              </Link>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-600 font-medium truncate">
                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{job.companyName}</span>
                <span className="text-slate-300">•</span>
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{getCountryLabel(job.location)}</span>
              </div>
            </div>
          </div>

          {/* Bookmark & Share Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSave({
                  id: (job as any).id || (job as any)._id || job.urlId, // eslint-disable-line @typescript-eslint/no-explicit-any
                  urlId: job.urlId,
                  title: job.title,
                  companyName: job.companyName,
                  location: job.location,
                  salary: job.salary,
                  skills: job.skills,
                  expiryDate: job.expiryDate,
                  createdAt: job.createdAt,
                });
              }}
              title={saved ? 'Remove from saved' : 'Save job'}
              aria-label={saved ? 'Remove from saved' : 'Save job'}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <Bookmark
                className={`h-4 w-4 ${saved ? 'fill-primary text-primary' : 'text-slate-400'}`}
              />
            </button>
            <JobShareButtons jobId={job.urlId} jobTitle={job.title} companyName={job.companyName} />
          </div>
        </div>

        {/* Attribute Pills: Type, Experience, Work Mode, Salary */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2.5">
          <Badge
            variant="outline"
            className="text-[11px] font-medium text-slate-700 bg-slate-50 border-slate-200 px-2 py-0.5"
          >
            {jobType}
          </Badge>
          <Badge
            variant="outline"
            className="text-[11px] font-medium text-slate-700 bg-slate-50 border-slate-200 px-2 py-0.5"
          >
            {experience}
          </Badge>
          <Badge
            variant="outline"
            className={`text-[11px] font-medium px-2 py-0.5 ${
              workMode === 'Remote'
                ? 'bg-blue-50 text-primary border-blue-200/60'
                : 'text-slate-700 bg-slate-50 border-slate-200'
            }`}
          >
            {workMode}
          </Badge>
          {job.salary && (
            <Badge
              variant="outline"
              className="text-[11px] font-mono tabular-nums font-medium text-slate-800 bg-slate-50 border-slate-200 px-2 py-0.5"
            >
              {job.salary}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 pb-3 flex-1 flex flex-col justify-between space-y-3">
        {/* Short description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {job.description?.replace(/[#*`_]/g, '') || 'No description provided.'}
        </p>

        {/* Skills Chips */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
              >
                {getSkillLabel(skill)}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="inline-flex items-center rounded border border-slate-200 px-1.5 py-0.5 text-[11px] font-mono tabular-nums text-slate-500">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2 font-mono tabular-nums text-slate-500 text-[11px]">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            {postedTime}
          </span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-400" />
            Exp: {formattedExpiry}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isDashboard ? (
            <>
              <Link href={`/dashboard/jobs/${job.urlId}`}>
                <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1">
                  <Eye className="h-3 w-3" /> Details
                </Button>
              </Link>
              <JobApplyButton
                jobId={job.urlId}
                job={job as IJob}
                disabled={isExpired || !job.isActive}
                isExpired={isExpired}
                variant="small"
              />
            </>
          ) : (
            <>
              <Link href={`/jobs/${job.urlId}`}>
                <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1">
                  <Eye className="h-3 w-3" /> Details
                </Button>
              </Link>
              <JobApplyRedirectButton
                jobId={job.urlId}
                isExpired={isExpired}
                isActive={job.isActive}
                variant="small"
              />
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
