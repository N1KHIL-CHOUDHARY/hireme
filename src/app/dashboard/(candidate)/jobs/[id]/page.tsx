import { ArrowLeft, Briefcase, Calendar, MapPin } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { getJobByUrlId } from '@/actions/jobs';
import { JobApplyButton } from '@/components/jobs/job-apply-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { getCountryLabel } from '@/data/countries';
import { getSkillLabel } from '@/data/technical-skills';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;

  try {
    const job = await getJobByUrlId(id);
    return {
      title: `${job.title} at ${job.companyName} | Candidate Dashboard | Hirelytics`,
      description: job.description?.slice(0, 160),
    };
  } catch {
    return {
      title: 'Job Not Found | Candidate Dashboard | Hirelytics',
      description: "The job listing you're looking for doesn't exist or has been removed.",
    };
  }
}

export default async function CandidateJobDetailsPage(props: Props) {
  const params = await props.params;
  const id = params.id;

  let job;
  try {
    job = await getJobByUrlId(id);
  } catch {
    notFound();
  }

  // Format dates
  const expiryDate = new Date(job.expiryDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const postedDate = new Date(job.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Check if job is expired
  const isExpired = new Date(job.expiryDate) < new Date();

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/jobs"
        className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to job listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {job.title}
              </h1>
              {isExpired ? (
                <StatusBadge status="expired" />
              ) : job.isActive ? (
                <StatusBadge status="active" />
              ) : (
                <StatusBadge status="closed" />
              )}
            </div>
            <div className="flex items-center text-base text-slate-600">
              <Briefcase className="h-4 w-4 mr-1.5 text-slate-400" />
              <span className="font-medium text-slate-700">{job.companyName}</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none text-sm text-slate-700 leading-relaxed prose-headings:text-slate-900 prose-a:text-primary hover:prose-a:underline">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    a: (props) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      />
                    ),
                    code: (props) => (
                      <code
                        {...props}
                        className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono"
                      />
                    ),
                  }}
                >
                  {job.description}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {job.requirements && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none text-sm text-slate-700 leading-relaxed prose-headings:text-slate-900 prose-a:text-primary">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {job.requirements}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {job.benefits && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none text-sm text-slate-700 leading-relaxed prose-headings:text-slate-900 prose-a:text-primary">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {job.benefits}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar (1 col) */}
        <div>
          <Card className="sticky top-6">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-semibold text-slate-900">Job Overview</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center text-sm text-slate-600">
                <MapPin className="h-4 w-4 mr-2.5 text-slate-400 flex-shrink-0" />
                <span>{getCountryLabel(job.location)}</span>
              </div>

              {job.salary && (
                <div className="flex items-center text-sm">
                  <span className="text-slate-500 mr-2">Salary:</span>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    {job.salary}
                  </span>
                </div>
              )}

              <div className="flex items-start text-sm text-slate-600 pt-1">
                <Calendar className="h-4 w-4 mr-2.5 mt-0.5 text-slate-400 flex-shrink-0" />
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-slate-500">Posted:</span>{' '}
                    <span className="font-mono tabular-nums text-slate-700">{postedDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Expires:</span>{' '}
                    <span className="font-mono tabular-nums text-slate-700">{expiryDate}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-medium text-slate-700 mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((skill: string) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-xs font-normal bg-slate-100 text-slate-700 border-slate-200"
                    >
                      {getSkillLabel(skill)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <JobApplyButton
                  jobId={id}
                  disabled={isExpired || !job.isActive}
                  isExpired={isExpired}
                  job={job}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
