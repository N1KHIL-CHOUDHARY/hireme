import { ArrowLeft, Building2, Calendar, MapPin } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { getJobByUrlId } from '@/actions/jobs';
import { ClientShareButton } from '@/components/jobs/client-share-button';
import { JobApplyRedirectButton } from '@/components/jobs/job-apply-redirect-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
      title: `${job.title} at ${job.companyName} | Hirelytics`,
      description: job.description?.slice(0, 160),
    };
  } catch {
    return {
      title: 'Job Not Found | Hirelytics',
      description: "The job listing you're looking for doesn't exist or has been removed.",
    };
  }
}

export default async function JobDetailsPage(props: Props) {
  const params = await props.params;
  const id = params.id;

  let job;
  try {
    job = await getJobByUrlId(id);
  } catch {
    notFound();
  }

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

  const isExpired = new Date(job.expiryDate) < new Date();

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

      <main className="container mx-auto px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Link
            href="/jobs"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to jobs
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-slate-200 bg-white rounded-lg p-6 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                    {job.title}
                  </h1>
                  <div className="mt-1.5 flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span>{job.companyName}</span>
                    <span className="text-slate-300">•</span>
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{getCountryLabel(job.location)}</span>
                  </div>
                </div>
                <div>
                  {isExpired ? (
                    <StatusBadge status="expired" />
                  ) : job.isActive ? (
                    <StatusBadge status="active" />
                  ) : (
                    <StatusBadge status="inactive" />
                  )}
                </div>
              </div>
            </div>

            <Card className="border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="prose max-w-none text-sm text-slate-700 leading-relaxed prose-headings:text-slate-900 prose-headings:font-semibold prose-a:text-primary hover:prose-a:underline">
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
                          className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono text-slate-800"
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
              <Card className="border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="prose max-w-none text-sm text-slate-700 leading-relaxed prose-headings:text-slate-900 prose-headings:font-semibold prose-a:text-primary">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {job.requirements}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}

            {job.benefits && (
              <Card className="border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Benefits & Perks
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="prose max-w-none text-sm text-slate-700 leading-relaxed prose-headings:text-slate-900 prose-headings:font-semibold prose-a:text-primary">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {job.benefits}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-20 border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Job Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-2.5 text-sm">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 text-xs block">Location</span>
                    <span className="font-medium text-slate-900">
                      {getCountryLabel(job.location)}
                    </span>
                  </div>
                </div>

                {job.salary && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="h-4 w-4 flex items-center justify-center text-xs font-mono font-semibold text-slate-400 shrink-0">
                      $
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">Salary</span>
                      <span className="font-mono tabular-nums font-medium text-slate-900">
                        {job.salary}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2.5 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 text-xs block">Timeline</span>
                    <div className="text-xs text-slate-600 font-mono tabular-nums">
                      Posted: <span className="font-medium text-slate-900">{postedDate}</span>
                    </div>
                    <div className="text-xs text-slate-600 font-mono tabular-nums">
                      Expires: <span className="font-medium text-slate-900">{expiryDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 text-xs font-medium block mb-2">
                    Required Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((skill: string) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-slate-100 text-slate-700 border-slate-200/60 font-medium text-xs rounded-md"
                      >
                        {getSkillLabel(skill)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <JobApplyRedirectButton
                    jobId={params.id}
                    isExpired={isExpired}
                    isActive={job.isActive}
                  />
                  <ClientShareButton
                    jobId={params.id}
                    jobTitle={job.title}
                    companyName={job.companyName}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
