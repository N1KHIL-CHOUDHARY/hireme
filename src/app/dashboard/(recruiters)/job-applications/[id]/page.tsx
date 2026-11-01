'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Maximize2,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { ChatMessage, QuestionGroup } from '@/components/job-applications/question-block';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

interface JobApplication {
  _id: string;
  jobId: string;
  userId: string;
  candidateName?: string;
  fileName: string;
  resumeUrl: string;
  signedResumeUrl?: string;
  s3Key?: string;
  s3Bucket?: string;
  preferredLanguage: string;
  status: ApplicationStatus;
  parsedResume?: {
    extractedText: string;
    about?: string;
    skills: string[];
    matchScore?: number;
    aiComments?: string;
    matchedAt?: string;
    experience?: {
      years: number;
      companies: string[];
    };
    education?: {
      degree: string;
      institution: string;
    }[];
    topSkillMatches?: string[];
    missingSkills?: string[];
  };
  interviewState?: {
    currentPhase: string;
    completedAt?: string;
    feedback?: {
      technicalSkills?: number;
      communicationSkills?: number;
      problemSolving?: number;
      cultureFit?: number;
      strengths?: string[];
      areasOfImprovement?: string[];
      overallImpression?: string;
    };
  };
  job: {
    title: string;
    companyName: string;
  };
  interviewChatHistory?: ChatMessage[];
  monitoringImages?: {
    s3Key: string;
    timestamp: string;
    signedUrl?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  technical: 'Technical',
  project: 'Project',
  behavioral: 'Behavioral',
  other: 'General',
};

function getScoreColors(score: number) {
  if (score >= 70) {
    return {
      text: 'text-[#16A34A]',
      bg: 'bg-[#F0FDF4]',
      border: 'border-[#BBF7D0]',
      stroke: '#16A34A',
    };
  }
  if (score >= 50) {
    return {
      text: 'text-[#D97706]',
      bg: 'bg-[#FFFBEB]',
      border: 'border-[#FDE68A]',
      stroke: '#D97706',
    };
  }
  return {
    text: 'text-[#DC2626]',
    bg: 'bg-[#FEF2F2]',
    border: 'border-[#FECACA]',
    stroke: '#DC2626',
  };
}

/** Animated score ring on mount (respecting motion) */
function ScoreRing({ score }: { score: number }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);
  const colors = getScoreColors(score);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setOffset(circumference * (1 - Math.min(100, Math.max(0, score)) / 100));
    });
    return () => cancelAnimationFrame(frame);
  }, [score, circumference]);

  return (
    <div className="relative size-20 shrink-0">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-mono text-xl font-bold tabular-nums leading-none', colors.text)}>
          {score}%
        </span>
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">
          Match
        </span>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-mono text-2xl font-bold tabular-nums text-slate-900">{value}</span>
        <span className="font-mono text-xs text-slate-400">/10</span>
      </div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value * 10))}%` }}
        />
      </div>
    </div>
  );
}

function ResumeDialog({
  open,
  onOpenChange,
  url,
  fileName,
  candidateName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url?: string;
  fileName?: string;
  candidateName?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      setLoaded(false);
      setError(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[88vh] max-w-5xl flex-col bg-white p-6">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="text-base font-semibold text-slate-900">
            Resume · {fileName || 'Document'}
          </DialogTitle>
        </DialogHeader>
        <div className="relative mt-2 flex-1 overflow-hidden rounded-md border border-border bg-slate-50">
          {!loaded && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Loading resume preview...</span>
              </div>
            </div>
          )}
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white p-6 text-center">
              <div className="space-y-3">
                <AlertCircle className="mx-auto size-8 text-amber-500" />
                <h4 className="text-sm font-semibold text-slate-900">
                  Browser preview unavailable
                </h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  This document cannot be previewed in the current browser frame. You can download
                  it directly.
                </p>
                <Button size="sm" onClick={() => window.open(url, '_blank')}>
                  <Download className="mr-1.5 size-3.5" />
                  Download Resume
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              src={url}
              className={cn(
                'size-full border-0 transition-opacity duration-300',
                loaded ? 'opacity-100' : 'opacity-0'
              )}
              title={`Resume of ${candidateName || 'candidate'}`}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function JobApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  const [activeTab, setActiveTab] = useState('resume');
  const queryClient = useQueryClient();

  // Dialog states
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);

  // Audio state
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const handlePlayAudio = (audioUrl: string) => {
    audioRef.current?.pause();

    if (currentlyPlaying === audioUrl) {
      setCurrentlyPlaying(null);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.onended = () => setCurrentlyPlaying(null);
    audio.onerror = () => {
      setCurrentlyPlaying(null);
      toast.error('Unable to play audio response');
    };
    audioRef.current = audio;
    setCurrentlyPlaying(audioUrl);
    audio.play().catch(() => setCurrentlyPlaying(null));
  };

  const { data: application, isLoading } = useQuery({
    queryKey: ['job-application', applicationId],
    queryFn: async () => {
      const response = await fetch(`/api/applications/${applicationId}`);
      if (!response.ok) throw new Error('Failed to fetch application details');
      const data = await response.json();
      return data.application as JobApplication;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      return response.json();
    },
    onSuccess: (_data, newStatus) => {
      toast.success(`Application marked as ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['job-application', applicationId] });
    },
    onError: (error) => {
      toast.error(
        `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    },
  });

  const updateStatus = (newStatus: ApplicationStatus) => statusMutation.mutate(newStatus);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm font-medium">Loading applicant dossier...</span>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-6 text-red-500" />}
        title="Application not found"
        description="The requested candidate profile or application record does not exist."
        action={
          <Button variant="outline" onClick={() => router.push('/dashboard/job-applications')}>
            <ArrowLeft className="mr-1.5 size-4" />
            Back to Applications
          </Button>
        }
      />
    );
  }

  const formattedCreatedDate = application.createdAt
    ? format(new Date(application.createdAt), 'PPP')
    : 'N/A';
  const hasInterviewData = application.interviewState !== undefined;
  const isInterviewComplete =
    hasInterviewData && application.interviewState?.completedAt !== undefined;
  const interviewFeedback = application.interviewState?.feedback;
  const matchScore = application.parsedResume?.matchScore;
  const resumeUrl = application.signedResumeUrl || application.resumeUrl;
  const isUpdating = statusMutation.isPending;

  // Group interview questions by category
  const questions = (application.interviewChatHistory ?? [])
    .filter((msg) => msg.sender === 'ai' && msg.questionCategory)
    .reduce(
      (acc, message) => {
        const category = message.questionCategory || 'other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(message);
        return acc;
      },
      {} as Record<string, ChatMessage[]>
    );

  const totalQuestions = Object.values(questions).reduce((sum, q) => sum + q.length, 0);

  const getAnswerForQuestion = (questionId?: string) => {
    if (!questionId || !application.interviewChatHistory) return null;

    const questionIndex = application.interviewChatHistory.findIndex(
      (msg) => msg.questionId === questionId
    );
    if (questionIndex === -1) return null;

    const nextUserMessage = application.interviewChatHistory
      .slice(questionIndex + 1)
      .find((msg) => msg.sender === 'user');

    return nextUserMessage?.text || null;
  };

  const feedbackMetrics = [
    { label: 'Technical Skills', value: interviewFeedback?.technicalSkills },
    { label: 'Communication', value: interviewFeedback?.communicationSkills },
    { label: 'Problem Solving', value: interviewFeedback?.problemSolving },
    { label: 'Culture Fit', value: interviewFeedback?.cultureFit },
  ].filter((m): m is { label: string; value: number } => m.value !== undefined);

  return (
    <div className="space-y-6">
      <ResumeDialog
        open={isResumeDialogOpen}
        onOpenChange={setIsResumeDialogOpen}
        url={resumeUrl}
        fileName={application.fileName}
        candidateName={application.candidateName}
      />

      {/* Navigation & Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/job-applications')}
          className="mb-2 -ml-2 h-8 text-xs text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="mr-1.5 size-3.5" />
          Back to Applications
        </Button>

        <PageHeader
          title={application.candidateName || 'Anonymous Candidate'}
          description={`Application for ${application.job?.title || 'Unknown Role'} at ${
            application.job?.companyName || 'Hirelytics'
          }`}
          badge={<StatusBadge status={application.status} />}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsResumeDialogOpen(true)}>
                <Eye className="mr-1.5 size-3.5" />
                View Resume
              </Button>
              {application.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => updateStatus('reviewed')}
                  >
                    Mark Reviewed
                  </Button>
                  <Button size="sm" disabled={isUpdating} onClick={() => updateStatus('accepted')}>
                    Accept
                  </Button>
                </>
              )}
            </div>
          }
        />
      </div>

      {/* Candidate Overview Card */}
      <Card className="bg-white border border-border shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Left Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 flex-1 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <FileText className="size-3.5 text-slate-400" />
                  Resume Document
                </span>
                <p
                  className="font-medium text-slate-900 truncate max-w-[200px]"
                  title={application.fileName}
                >
                  {application.fileName}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-slate-400" />
                  Submission Date
                </span>
                <p className="font-mono text-xs tabular-nums text-slate-900 font-medium">
                  {formattedCreatedDate}
                </p>
              </div>
            </div>

            {/* Right Score Highlight */}
            {matchScore !== undefined && (
              <div className="flex items-center gap-4 pl-0 md:pl-6 md:border-l md:border-border">
                <ScoreRing score={matchScore} />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                    Resume Match
                  </h4>
                  <p className="text-xs text-slate-500">Automated fit assessment</p>
                </div>
              </div>
            )}
          </div>

          {/* Skill Badges */}
          {!!application.parsedResume?.skills?.length && (
            <div className="mt-5 pt-4 border-t border-border/70 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500 mr-1">Extracted Skills:</span>
              {application.parsedResume.skills.map((skill, index) => (
                <Badge
                  key={`${skill}-${index}`}
                  variant="outline"
                  className="bg-slate-50 text-slate-600 border-slate-200 text-xs font-normal"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 border border-border">
          <TabsTrigger value="resume">Resume Analysis</TabsTrigger>
          <TabsTrigger value="interview" disabled={!hasInterviewData}>
            Interview Results
          </TabsTrigger>
          <TabsTrigger value="questions" disabled={!hasInterviewData}>
            Q&A ({totalQuestions})
          </TabsTrigger>
          <TabsTrigger value="monitoring" disabled={!application.monitoringImages?.length}>
            Monitoring ({application.monitoringImages?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Tab 1: Resume Analysis */}
        <TabsContent value="resume" className="space-y-6">
          <Card className="bg-white border border-border shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <CardHeader className="pb-3 border-b border-border/70">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                AI Resume Match Analysis
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Evaluation of candidate background against targeted position requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* AI Comments */}
              {application.parsedResume?.aiComments && (
                <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-1.5">
                    Summary Assessment
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-line">
                    {application.parsedResume.aiComments}
                  </p>
                </div>
              )}

              {/* Skills Match Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#16A34A]" />
                    Matching Skills Identified
                  </h4>
                  <div className="rounded-lg border border-border bg-slate-50/40 p-4 min-h-[90px] flex flex-wrap content-start gap-1.5">
                    {application.parsedResume?.topSkillMatches?.length ? (
                      application.parsedResume.topSkillMatches.map((skill, index) => (
                        <Badge
                          key={`${skill}-${index}`}
                          className="bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0] text-xs font-medium"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No specific match tags found.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <AlertCircle className="size-3.5 text-[#D97706]" />
                    Missing / Desired Skills
                  </h4>
                  <div className="rounded-lg border border-border bg-slate-50/40 p-4 min-h-[90px] flex flex-wrap content-start gap-1.5">
                    {application.parsedResume?.missingSkills?.length ? (
                      application.parsedResume.missingSkills.map((skill, index) => (
                        <Badge
                          key={`${skill}-${index}`}
                          className="bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] text-xs font-medium"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No skill gaps identified.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Experience & Education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Experience
                  </h4>
                  <div className="rounded-lg border border-border bg-white p-4 space-y-3 text-sm">
                    {application.parsedResume?.experience ? (
                      <>
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                          <span className="text-slate-500 text-xs">Total Duration</span>
                          <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                            {application.parsedResume.experience.years} Years
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 mb-1.5 block">Companies</span>
                          <ul className="space-y-1">
                            {application.parsedResume.experience.companies.map((company, index) => (
                              <li
                                key={`${company}-${index}`}
                                className="flex items-center gap-2 text-xs text-slate-700"
                              >
                                <span className="size-1.5 rounded-full bg-primary" />
                                {company}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400">No experience details parsed.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Education
                  </h4>
                  <div className="rounded-lg border border-border bg-white p-4 space-y-3 text-sm">
                    {application.parsedResume?.education?.length ? (
                      application.parsedResume.education.map((edu, index) => (
                        <div
                          key={index}
                          className="pb-2 border-b border-border last:border-0 last:pb-0"
                        >
                          <p className="font-semibold text-xs text-slate-900">{edu.degree}</p>
                          <p className="text-xs text-slate-500">{edu.institution}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No education history parsed.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* About Text */}
              {application.parsedResume?.about && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Candidate Profile Summary
                  </h4>
                  <div className="rounded-lg border border-border bg-slate-50/50 p-4 text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                    {application.parsedResume.about}
                  </div>
                </div>
              )}

              {/* Extracted Resume Text */}
              {application.parsedResume?.extractedText && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Extracted Resume Plain Text
                  </h4>
                  <ScrollArea className="h-48 rounded-lg border border-border bg-slate-50/30 p-3 font-mono text-xs text-slate-600 leading-relaxed">
                    {application.parsedResume.extractedText}
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Interview Results */}
        <TabsContent value="interview" className="space-y-6">
          {hasInterviewData ? (
            <Card className="bg-white border border-border shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <CardHeader className="pb-3 border-b border-border/70 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Interview Feedback & Competencies
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    AI interviewer scoring across 4 evaluation pillars
                  </CardDescription>
                </div>
                {isInterviewComplete ? (
                  <StatusBadge status="completed" />
                ) : (
                  <StatusBadge status="in_progress" />
                )}
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {isInterviewComplete ? (
                  <>
                    {/* Feedback Metrics */}
                    {feedbackMetrics.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {feedbackMetrics.map((metric) => (
                          <MetricCard
                            key={metric.label}
                            label={metric.label}
                            value={metric.value}
                          />
                        ))}
                      </div>
                    )}

                    {/* Overall Impression */}
                    {interviewFeedback?.overallImpression && (
                      <div className="rounded-lg border border-border bg-slate-50/60 p-4 space-y-1.5">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Overall Assessment Impression
                        </h4>
                        <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-line">
                          {interviewFeedback.overallImpression}
                        </p>
                      </div>
                    )}

                    {/* Strengths & Improvement */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {!!interviewFeedback?.strengths?.length && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#16A34A] flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5" />
                            Demonstrated Strengths
                          </h4>
                          <div className="rounded-lg border border-border bg-white p-4 space-y-2">
                            {interviewFeedback.strengths.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2 text-xs text-slate-700"
                              >
                                <span className="size-1.5 rounded-full bg-[#16A34A] mt-1 shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!!interviewFeedback?.areasOfImprovement?.length && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D97706] flex items-center gap-1.5">
                            <AlertCircle className="size-3.5" />
                            Areas for Development
                          </h4>
                          <div className="rounded-lg border border-border bg-white p-4 space-y-2">
                            {interviewFeedback.areasOfImprovement.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2 text-xs text-slate-700"
                              >
                                <span className="size-1.5 rounded-full bg-[#D97706] mt-1 shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <EmptyState
                    icon={<Clock className="size-6 text-primary" />}
                    title="Interview session in progress"
                    description={`Candidate has started the interview session. Current phase: ${
                      application.interviewState?.currentPhase?.replace(/_/g, ' ') ||
                      'Conducting Q&A'
                    }`}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={<Clock className="size-6 text-slate-400" />}
              title="Interview not yet initiated"
              description="The candidate has not initiated their automated AI interview."
            />
          )}
        </TabsContent>

        {/* Tab 3: Q&A Deduplicated Components */}
        <TabsContent value="questions" className="space-y-6">
          {totalQuestions > 0 ? (
            <div className="space-y-6">
              {Object.keys(CATEGORY_LABELS).map((categoryKey) => {
                const categoryQuestions = questions[categoryKey];
                if (!categoryQuestions || categoryQuestions.length === 0) return null;
                return (
                  <QuestionGroup
                    key={categoryKey}
                    label={CATEGORY_LABELS[categoryKey]}
                    questions={categoryQuestions}
                    getAnswer={getAnswerForQuestion}
                    playingUrl={currentlyPlaying}
                    onPlay={handlePlayAudio}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<MessageSquare className="size-6 text-slate-400" />}
              title="No interview responses recorded"
              description="Interview Q&A prompts and candidate voice responses will appear here after the session."
            />
          )}
        </TabsContent>

        {/* Tab 4: Monitoring Images */}
        <TabsContent value="monitoring" className="space-y-6">
          {application.monitoringImages?.length ? (
            <Card className="bg-white border border-border shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <CardHeader className="pb-3 border-b border-border/70">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Proctoring Snapshots
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Automated webcam verifications captured during the assessment session
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {application.monitoringImages.map((image, index) => (
                    <button
                      type="button"
                      key={`${image.s3Key}-${index}`}
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setIsImageDialogOpen(true);
                      }}
                      className="group relative overflow-hidden rounded-lg border border-border bg-slate-50 text-left transition-[border-color,background-color] duration-150 hover:border-slate-400"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                        <Image
                          src={
                            image.signedUrl ||
                            `/api/applications/${application._id}/monitoring-image/${encodeURIComponent(image.s3Key)}`
                          }
                          alt={`Proctoring verification ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-white border-t border-border">
                        <span className="font-mono text-[11px] tabular-nums text-slate-600">
                          {image.timestamp
                            ? format(new Date(image.timestamp), 'p')
                            : `#${index + 1}`}
                        </span>
                        <Maximize2 className="size-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Dialog Preview */}
                <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                  <DialogContent className="max-w-3xl bg-white p-6">
                    <DialogHeader>
                      <DialogTitle className="text-sm font-semibold">
                        Verification Snapshot {selectedImageIndex + 1} of{' '}
                        {application.monitoringImages.length}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border bg-black mt-2">
                      <Image
                        src={
                          application.monitoringImages[selectedImageIndex]?.signedUrl ||
                          `/api/applications/${application._id}/monitoring-image/${encodeURIComponent(
                            application.monitoringImages[selectedImageIndex]?.s3Key || ''
                          )}`
                        }
                        alt="Enlarged snapshot"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={<Eye className="size-6 text-slate-400" />}
              title="No proctoring captures"
              description="No webcam verification images were required or collected for this application."
            />
          )}
        </TabsContent>

        {/* Tab 5: Actions */}
        <TabsContent value="actions" className="space-y-6">
          <Card className="bg-white border border-border shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <CardHeader className="pb-3 border-b border-border/70">
              <CardTitle className="text-base font-semibold text-slate-900">
                Application Workflow Actions
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Update evaluation decision and export documents
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Status Management */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Update Hiring Decision
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={application.status === 'pending' || isUpdating}
                    onClick={() => updateStatus('pending')}
                  >
                    Mark as Pending
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={application.status === 'reviewed' || isUpdating}
                    onClick={() => updateStatus('reviewed')}
                  >
                    Mark as Reviewed
                  </Button>
                  <Button
                    size="sm"
                    disabled={application.status === 'accepted' || isUpdating}
                    onClick={() => updateStatus('accepted')}
                  >
                    Accept Candidate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={application.status === 'rejected' || isUpdating}
                    onClick={() => updateStatus('rejected')}
                  >
                    Reject Candidate
                  </Button>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Downloads & Shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-900">Original Resume Document</h4>
                  <p className="text-xs text-slate-500">
                    Download the file provided during application submission.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-1.5 size-3.5" />
                      Download Resume File
                    </a>
                  </Button>
                </div>

                <div className="rounded-lg border border-border p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-900">Interview Transcript</h4>
                  <p className="text-xs text-slate-500">
                    Examine questions, timings, and candidate voice replies.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={totalQuestions === 0}
                    onClick={() => setActiveTab('questions')}
                  >
                    <MessageSquare className="mr-1.5 size-3.5" />
                    Review Q&A Tab
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
