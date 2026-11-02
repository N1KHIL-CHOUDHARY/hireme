'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle,
  Code,
  GraduationCap,
  Loader2,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { IJobApplication } from '@/models/job-application';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      when: 'beforeChildren',
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

interface ResumeAnalysisProps {
  applicationId: string;
}

export function ResumeAnalysis({ applicationId }: ResumeAnalysisProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [application, setApplication] = useState<IJobApplication | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function analyzeResume() {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/applications/${applicationId}/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            runMatching: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to analyze resume');
        }

        const result = await response.json();

        setApplication(result.application);
        setIsLoading(false);
      } catch (err) {
        console.error('Error during resume analysis:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setIsLoading(false);
        toast.error('Analysis failed', {
          description: 'There was a problem analyzing your resume.',
        });
      }
    }

    analyzeResume();
  }, [applicationId]);

  const handleContinue = () => {
    fetch(`/api/applications/${applicationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'reviewed' }),
    })
      .then(() => {
        router.push(`/dashboard/applications/${applicationId}/interview`);
      })
      .catch((err) => {
        console.error('Failed to update application status:', err);
        router.push(`/dashboard/applications/${applicationId}/interview`);
      });
  };

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Card className="p-8 border-red-200 bg-red-50/40 text-center max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-red-900 mb-2">Resume Analysis Failed</h2>
          <p className="text-sm text-red-700 mb-6">{error}</p>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </Card>
      </motion.div>
    );
  }

  const score = application?.parsedResume?.matchScore ?? 0;

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="text-center py-6 px-6 border-b border-slate-100">
          <motion.h1
            className="text-2xl font-bold tracking-tight text-slate-900"
            variants={itemVariants}
          >
            Resume Screening Analysis
          </motion.h1>
          <p className="text-xs text-slate-500 mt-1">
            AI-powered breakdown of your background against the position requirements
          </p>
        </CardHeader>

        <CardContent className="p-6">
          {isLoading ? (
            <motion.div
              className="flex flex-col items-center justify-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-base font-semibold text-slate-900">Processing your resume...</p>
              <p className="text-xs text-slate-500 mt-1">
                Extracting technical skills, experiences, and match scoring
              </p>
            </motion.div>
          ) : (
            <motion.div className="space-y-6" variants={containerVariants}>
              <motion.div
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200/60 text-green-800"
                variants={itemVariants}
              >
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium">Resume Analysis Complete</span>
              </motion.div>

              {/* Match Score Card */}
              <motion.div variants={itemVariants}>
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-6">
                  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-4">
                    Position Match Score
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div
                      className={`text-5xl font-bold font-mono tabular-nums ${
                        score >= 70
                          ? 'text-green-600'
                          : score >= 50
                            ? 'text-amber-600'
                            : 'text-red-600'
                      }`}
                    >
                      {score}%
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${score}%`,
                            backgroundColor:
                              score >= 70 ? '#16A34A' : score >= 50 ? '#D97706' : '#DC2626',
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 font-mono tabular-nums">
                        Last analyzed:{' '}
                        {application?.parsedResume?.analyzedAt
                          ? new Date(application.parsedResume.analyzedAt).toLocaleDateString()
                          : 'Recent'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* About Candidate */}
              <motion.div variants={itemVariants}>
                <div className="rounded-lg border border-slate-200 bg-white p-5 flex items-start gap-4">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">Summary</h3>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {application?.parsedResume?.about ?? 'No summary information extracted'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Skills */}
              <motion.div variants={itemVariants}>
                <div className="rounded-lg border border-slate-200 bg-white p-5 flex items-start gap-4">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                    <Code className="h-5 w-5" />
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">Extracted Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {(application?.parsedResume?.skills ?? []).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs font-normal bg-slate-100 text-slate-700 border-slate-200"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {(!application?.parsedResume?.skills ||
                        application.parsedResume.skills.length === 0) && (
                        <p className="text-xs text-slate-500">No specific skills identified</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Experience */}
              <motion.div variants={itemVariants}>
                <div className="rounded-lg border border-slate-200 bg-white p-5 flex items-start gap-4">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">Experience</h3>
                    {(application?.parsedResume?.experience?.years ?? 0) > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center text-slate-900">
                          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                            {application?.parsedResume?.experience?.years}
                          </span>
                          <span className="ml-2 text-xs text-slate-500">
                            years of professional experience
                          </span>
                        </div>
                        {(application?.parsedResume?.experience?.companies?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {(application?.parsedResume?.experience?.companies ?? []).map(
                              (company, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs font-normal text-slate-600 border-slate-200"
                                >
                                  {company}
                                </Badge>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No experience details found</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Education */}
              <motion.div variants={itemVariants}>
                <div className="rounded-lg border border-slate-200 bg-white p-5 flex items-start gap-4">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">Education</h3>
                    {(application?.parsedResume?.education?.length ?? 0) > 0 ? (
                      <div className="space-y-2.5">
                        {(application?.parsedResume?.education ?? []).map((edu, index) => (
                          <div key={index} className="border-l-2 border-primary/40 pl-3 py-0.5">
                            <p className="text-xs font-semibold text-slate-900">{edu.degree}</p>
                            <p className="text-xs text-slate-500">{edu.institution}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No education information found</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* AI Analysis & Skill Matches */}
              <motion.div variants={itemVariants}>
                <div className="rounded-lg border border-slate-200 bg-white p-5 flex items-start gap-4">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div className="space-y-4 flex-1 min-w-0">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                        AI Fit Assessment
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {application?.parsedResume?.aiComments ?? 'No AI comments available'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                      {(application?.parsedResume?.topSkillMatches?.length ?? 0) > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                            Matching Skills
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {(application?.parsedResume?.topSkillMatches ?? []).map(
                              (skill, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs font-normal bg-green-50 text-green-700 border-green-200"
                                >
                                  {skill}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {(application?.parsedResume?.missingSkills?.length ?? 0) > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                            Missing Skills
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {(application?.parsedResume?.missingSkills ?? []).map(
                              (skill, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs font-normal bg-red-50/60 text-red-700 border-red-200"
                                >
                                  {skill}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.div className="pt-4" variants={itemVariants}>
                <Button
                  onClick={handleContinue}
                  className="w-full gap-2 h-11 text-sm font-medium"
                  size="lg"
                >
                  Continue to Virtual Interview
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
