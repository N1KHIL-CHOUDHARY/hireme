'use client';

import { Lightbulb, RefreshCw, Star, StarHalf, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface FeedbackData {
  technicalSkills?: number;
  communicationSkills?: number;
  problemSolving?: number;
  cultureFit?: number;
  overallImpression?: string;
  strengths?: string[];
  areasOfImprovement?: string[];
}

interface FeedbackContentProps {
  initialFeedback: FeedbackData;
  applicationId: string;
  jobId: string;
}

export function FeedbackContent({ initialFeedback, applicationId }: FeedbackContentProps) {
  const [feedback, setFeedback] = useState<FeedbackData>(initialFeedback);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const refreshFeedback = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(
        `/api/ai/interview/autoevaluate?applicationId=${applicationId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        console.error('Failed to refresh feedback');
        return;
      }

      const data = await response.json();

      if (data.feedback) {
        setFeedback(data.feedback);
        router.refresh();
      }
    } catch (error) {
      console.error('Error refreshing feedback:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderStars = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-amber-500 text-amber-500" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-amber-500 text-amber-500" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-slate-200" />);
    }

    return stars;
  };

  return (
    <div className="space-y-6">
      {/* Overall Impression */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-5 space-y-2">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Overall Assessment</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshFeedback}
            disabled={isRefreshing}
            className="text-xs h-7 gap-1"
          >
            <RefreshCw className="h-3 w-3 text-slate-500" />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          {feedback.overallImpression || 'No overall impression provided'}
        </p>
      </div>

      {/* Ratings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Technical Skills */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
            Technical Competence
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center">{renderStars(feedback.technicalSkills)}</div>
            <span className="font-mono text-sm font-bold tabular-nums text-slate-900">
              {feedback.technicalSkills || 0}
              <span className="text-xs font-normal text-slate-400"> / 5</span>
            </span>
          </div>
        </div>

        {/* Communication Skills */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
            Communication
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center">{renderStars(feedback.communicationSkills)}</div>
            <span className="font-mono text-sm font-bold tabular-nums text-slate-900">
              {feedback.communicationSkills || 0}
              <span className="text-xs font-normal text-slate-400"> / 5</span>
            </span>
          </div>
        </div>

        {/* Problem Solving */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
            Problem Solving
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center">{renderStars(feedback.problemSolving)}</div>
            <span className="font-mono text-sm font-bold tabular-nums text-slate-900">
              {feedback.problemSolving || 0}
              <span className="text-xs font-normal text-slate-400"> / 5</span>
            </span>
          </div>
        </div>

        {/* Culture Fit */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
            Culture Alignment
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center">{renderStars(feedback.cultureFit)}</div>
            <span className="font-mono text-sm font-bold tabular-nums text-slate-900">
              {feedback.cultureFit || 0}
              <span className="text-xs font-normal text-slate-400"> / 5</span>
            </span>
          </div>
        </div>
      </div>

      {/* Strengths & Improvement Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Strengths */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <ThumbsUp className="h-4 w-4 text-green-600" />
            <span>Demonstrated Strengths</span>
          </h2>
          <ul className="space-y-2">
            {feedback.strengths?.map((strength: string, index: number) => (
              <li
                key={index}
                className="flex items-start gap-2.5 p-3 rounded-lg border border-green-200/80 bg-green-50/40 text-xs text-slate-700"
              >
                <div className="h-5 w-5 flex-shrink-0 flex items-center justify-center rounded-full bg-green-100 text-green-700 font-mono text-[11px] font-semibold">
                  {index + 1}
                </div>
                <span className="leading-relaxed mt-0.5">{strength}</span>
              </li>
            )) || <li className="text-xs text-slate-500">No strengths identified</li>}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            <span>Growth Opportunities</span>
          </h2>
          <ul className="space-y-2">
            {feedback.areasOfImprovement?.map((area: string, index: number) => (
              <li
                key={index}
                className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-200/80 bg-amber-50/40 text-xs text-slate-700"
              >
                <div className="h-5 w-5 flex-shrink-0 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 font-mono text-[11px] font-semibold">
                  {index + 1}
                </div>
                <span className="leading-relaxed mt-0.5">{area}</span>
              </li>
            )) || <li className="text-xs text-slate-500">No improvement areas identified</li>}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
        <Link href={`/dashboard/applications/${applicationId}`} className="flex-1">
          <Button variant="default" className="w-full h-10 text-xs font-medium">
            View Application Details
          </Button>
        </Link>
        <Link href="/dashboard/applications" className="flex-1">
          <Button variant="outline" className="w-full h-10 text-xs font-medium">
            All Applications
          </Button>
        </Link>
      </div>
    </div>
  );
}
