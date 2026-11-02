'use client';

import {
  Briefcase,
  FileText,
  GraduationCap,
  Save,
  Upload,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Textarea } from '@/components/ui/textarea';
import { countries } from '@/data/countries';

const DEFAULT_SKILLS = ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Tailwind CSS'];

export default function CandidateProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [name, setName] = React.useState(user?.name || '');
  const [email] = React.useState(user?.email || '');
  const [headline, setHeadline] = React.useState('Full Stack Software Engineer');
  const [location, setLocation] = React.useState('US');
  const [bio, setBio] = React.useState(
    'Passionate engineer focused on crafting accessible, performant web applications.'
  );
  const [skills, setSkills] = React.useState<string[]>(DEFAULT_SKILLS);
  const [skillInput, setSkillInput] = React.useState('');
  const [resumeName, setResumeName] = React.useState('resume-2026.pdf');
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (user?.name) setName(user.name);
    // Load local draft if saved
    try {
      const stored = localStorage.getItem('hirelytics_candidate_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setName(parsed.name);
        if (parsed.headline) setHeadline(parsed.headline);
        if (parsed.location) setLocation(parsed.location);
        if (parsed.bio) setBio(parsed.bio);
        if (parsed.skills) setSkills(parsed.skills);
        if (parsed.resumeName) setResumeName(parsed.resumeName);
      }
    } catch {
      // ignore
    }
  }, [user]);

  const handleSave = () => {
    setIsSaving(true);
    try {
      const payload = {
        name,
        headline,
        location,
        bio,
        skills,
        resumeName,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('hirelytics_candidate_profile', JSON.stringify(payload));
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeName(file.name);
      toast.success(`Uploaded ${file.name}`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Candidate Profile"
        description="Manage your resume, credentials, and technical skills used for AI job matching"
        actions={
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-1.5">
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Personal Information */}
        <Card className="border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] rounded-lg">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-primary" />
              <span>Personal Information</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Basic details displayed on submitted applications
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-slate-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-sm bg-white border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-slate-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="h-9 text-sm bg-slate-50 border-slate-200 font-mono text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="headline" className="text-xs font-medium text-slate-700">
                  Professional Headline
                </Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="h-9 text-sm bg-white border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-medium text-slate-700">
                  Location / Country
                </Label>
                <select
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {countries.slice(0, 40).map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-xs font-medium text-slate-700">
                Short Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="text-sm bg-white border-slate-200 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Resume Management */}
        <Card className="border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] rounded-lg">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Resume & Documents</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Default resume file parsed for AI matching and interview generation
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 border border-blue-100 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 font-mono">{resumeName}</p>
                  <p className="text-xs text-slate-500">
                    PDF document • Active for 1-click applications
                  </p>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="resume-upload"
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Replace Resume</span>
                </Label>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Skills */}
        <Card className="border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] rounded-lg">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <span>Verified Technical Skills</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Add skills to receive higher match ranking on Explore Jobs
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 border border-blue-200/60 px-2.5 py-1 text-xs text-primary font-medium"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Input
                placeholder="Add a new skill (e.g. Docker, GraphQL)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(skillInput);
                  }
                }}
                className="h-9 text-xs max-w-sm bg-white border-slate-200"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddSkill(skillInput)}
                className="h-9 text-xs"
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Experience & Education */}
        <Card className="border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] rounded-lg">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>Experience & Education Highlights</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Summary automatically extracted from your parsed resume
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs text-slate-600">
            <div className="border-l-2 border-primary pl-3.5 space-y-1">
              <p className="font-semibold text-sm text-slate-900">
                Senior Full Stack Engineer • TechCorp
              </p>
              <p className="text-slate-500 font-mono tabular-nums">2022 - Present • Remote</p>
              <p>Designed and scaled microservices and Next.js frontend interfaces.</p>
            </div>
            <div className="border-l-2 border-slate-200 pl-3.5 space-y-1">
              <p className="font-semibold text-sm text-slate-900">
                B.S. in Computer Science • University of Technology
              </p>
              <p className="text-slate-500 font-mono tabular-nums">2018 - 2022</p>
              <p>Specialization in Distributed Systems & Web Technologies.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
