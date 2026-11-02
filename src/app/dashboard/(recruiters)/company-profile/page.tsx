'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  Building2,
  Check,
  ExternalLink,
  Globe,
  MapPin,
  Plus,
  Save,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Textarea } from '@/components/ui/textarea';

interface CompanyProfileData {
  companyName: string;
  tagline: string;
  website: string;
  industry: string;
  companySize: string;
  location: string;
  about: string;
  benefits: string[];
}

interface RecruiterJob {
  companyName?: string;
  location?: string;
  isActive?: boolean;
}

const DEFAULT_BENEFITS = [
  'Comprehensive Health & Dental Insurance',
  'Remote & Flexible Working Options',
  'Annual Learning & Conference Stipend',
  'Generous Paid Time Off & Holidays',
  '401(k) Matching Program',
  'Home Office Equipment Budget',
];

const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '500+ employees',
];

const INDUSTRIES = [
  'Technology & Software',
  'Fintech & Financial Services',
  'Healthcare & Biotechnology',
  'E-commerce & Retail',
  'Artificial Intelligence & Data',
  'Education & EdTech',
  'Media & Entertainment',
  'Consulting & Professional Services',
];

export default function RecruiterCompanyProfilePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || 'default_recruiter';

  // Fetch recruiter's jobs to calculate stats and prefill if first time
  const { data: jobsData } = useQuery({
    queryKey: ['recruiter-jobs-company', userId],
    queryFn: async () => {
      const res = await fetch('/api/jobs');
      if (!res.ok) return { jobs: [] };
      return res.json();
    },
    enabled: !!session?.user?.id,
  });

  const jobsList = React.useMemo<RecruiterJob[]>(() => {
    return jobsData?.jobs || [];
  }, [jobsData?.jobs]);

  const activeJobs = React.useMemo(() => {
    return jobsList.filter((j: RecruiterJob) => j.isActive !== false);
  }, [jobsList]);

  const storageKey = `hirelytics_recruiter_company_${userId}`;

  const [profile, setProfile] = React.useState<CompanyProfileData>({
    companyName: '',
    tagline: 'Empowering top engineering and design talent to build the future',
    website: 'https://example.com',
    industry: 'Technology & Software',
    companySize: '51-200 employees',
    location: 'San Francisco, CA',
    about:
      'We are an innovative product team developing developer productivity tools and scalable enterprise solutions. We value technical excellence, ownership, transparent communication, and rapid iteration.',
    benefits: DEFAULT_BENEFITS,
  });

  const [newBenefitInput, setNewBenefitInput] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);

  // Load from local storage or prefill with recruiter's existing job data
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setProfile(JSON.parse(saved));
        setHasLoaded(true);
        return;
      }
    } catch {
      // Ignore storage error
    }

    // Prefill from first job if available
    if (jobsList.length > 0) {
      const firstJob = jobsList[0];
      setProfile((prev) => ({
        ...prev,
        companyName:
          firstJob.companyName || session?.user?.name
            ? `${session?.user?.name}'s Company`
            : 'HireLytics Inc.',
        location: firstJob.location || prev.location,
      }));
    } else if (session?.user?.name) {
      setProfile((prev) => ({
        ...prev,
        companyName: `${session.user.name}'s Organization`,
      }));
    }
    setHasLoaded(true);
  }, [jobsList, session?.user?.name, storageKey]);

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem(storageKey, JSON.stringify(profile));
      toast.success('Company profile updated successfully', {
        description: 'Changes will appear on newly created job listings and company branding.',
      });
    } catch {
      toast.error('Failed to save profile changes');
    } finally {
      setTimeout(() => setIsSaving(false), 300);
    }
  };

  const handleAddBenefit = () => {
    const trimmed = newBenefitInput.trim();
    if (!trimmed) return;
    if (profile.benefits.includes(trimmed)) {
      toast.info('Benefit already added');
      return;
    }
    setProfile((prev) => ({
      ...prev,
      benefits: [...prev.benefits, trimmed],
    }));
    setNewBenefitInput('');
  };

  const handleRemoveBenefit = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const companyInitials = profile.companyName
    ? profile.companyName
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'CO';

  if (!hasLoaded) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Company Profile"
          description="Manage your organization information, workplace branding, and default hiring perks"
        />
        <div className="flex items-center gap-2">
          <Link href="/dashboard/job-listing">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <Briefcase className="h-3.5 w-3.5" />
              Manage Jobs
            </Button>
          </Link>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="h-9 gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {isSaving ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            Save Profile
          </Button>
        </div>
      </div>

      {/* Recruiter Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Jobs Posted</p>
              <p className="text-2xl font-semibold text-slate-900 font-mono tabular-nums mt-0.5">
                {jobsList.length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Listings</p>
              <p className="text-2xl font-semibold text-slate-900 font-mono tabular-nums mt-0.5">
                {activeJobs.length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Hiring Team Lead</p>
              <p className="text-sm font-semibold text-slate-900 truncate max-w-[140px] mt-1">
                {session?.user?.name || 'Recruiter'}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Form Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-900">
                General Information
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Basic details and identity displayed to candidates on your job postings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-4 pb-2">
                <div className="h-14 w-14 rounded-lg bg-blue-600 text-white font-mono font-bold text-xl flex items-center justify-center shadow-sm">
                  {companyInitials}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {profile.companyName || 'Company Brand'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Avatar is automatically generated from your organization name
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Company Name</label>
                  <Input
                    value={profile.companyName}
                    onChange={(e) => setProfile((p) => ({ ...p, companyName: e.target.value }))}
                    placeholder="e.g. Acme Technologies"
                    className="h-9 text-xs border-slate-200 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Website URL</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      value={profile.website}
                      onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                      placeholder="https://company.com"
                      className="h-9 text-xs pl-8 border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Tagline / Headline</label>
                <Input
                  value={profile.tagline}
                  onChange={(e) => setProfile((p) => ({ ...p, tagline: e.target.value }))}
                  placeholder="e.g. Next generation workflow software for creative engineering teams"
                  className="h-9 text-xs border-slate-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Industry</label>
                  <select
                    value={profile.industry}
                    onChange={(e) => setProfile((p) => ({ ...p, industry: e.target.value }))}
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Company Size</label>
                  <select
                    value={profile.companySize}
                    onChange={(e) => setProfile((p) => ({ ...p, companySize: e.target.value }))}
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {COMPANY_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Headquarters</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      value={profile.location}
                      onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                      placeholder="e.g. Austin, TX or Remote"
                      className="h-9 text-xs pl-8 border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">About Company</label>
                <Textarea
                  rows={4}
                  value={profile.about}
                  onChange={(e) => setProfile((p) => ({ ...p, about: e.target.value }))}
                  placeholder="Describe your company mission, culture, and what makes working here exciting..."
                  className="text-xs border-slate-200 bg-white resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Benefits and Perks */}
          <Card className="border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-900">
                Company Benefits & Perks
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Highlight what you offer to attract top applicants across your job listings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newBenefitInput}
                  onChange={(e) => setNewBenefitInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBenefit();
                    }
                  }}
                  placeholder="e.g. 100% covered health insurance, Annual retreat..."
                  className="h-9 text-xs border-slate-200 bg-white"
                />
                <Button
                  onClick={handleAddBenefit}
                  size="sm"
                  variant="outline"
                  className="h-9 gap-1 text-xs shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {profile.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80"
                  >
                    <span>{benefit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(index)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Candidate Preview */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sticky top-6">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                  Candidate View Preview
                </CardTitle>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                  Live Preview
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="text-center pt-2 pb-1">
                <div className="h-16 w-16 rounded-xl bg-blue-600 text-white font-mono font-bold text-2xl mx-auto flex items-center justify-center shadow-sm mb-3">
                  {companyInitials}
                </div>
                <h3 className="font-semibold text-slate-900 text-base">
                  {profile.companyName || 'Your Company Name'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{profile.tagline}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Industry</span>
                  <span className="font-medium text-slate-900">{profile.industry}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Company Size</span>
                  <span className="font-medium text-slate-900">{profile.companySize}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Headquarters</span>
                  <span className="font-medium text-slate-900">{profile.location}</span>
                </div>
                {profile.website && (
                  <div className="flex items-center justify-between text-slate-600 pt-1">
                    <span className="text-slate-400">Website</span>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-1.5">About Us</p>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                  {profile.about}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">Active Openings</span>
                  <span className="text-xs font-mono font-medium text-blue-600">
                    {activeJobs.length} active
                  </span>
                </div>
                <Link href="/dashboard/job-listing?action=new">
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Post New Job Opening
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
