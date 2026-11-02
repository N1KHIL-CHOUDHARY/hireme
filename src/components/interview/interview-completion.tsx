'use client';

import { CircleCheck, Clock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface InterviewCompletionProps {
  applicationId: string;
  jobTitle: string;
  companyName: string;
  redirectUrl?: string;
  isInterrupted?: boolean;
  interruptionReason?: 'timer_expired' | 'technical_issue' | 'user_action';
}

export function InterviewCompletion({
  applicationId,
  jobTitle,
  companyName,
  isInterrupted = false,
  interruptionReason,
}: InterviewCompletionProps) {
  const [closingTimer, setClosingTimer] = useState(12);
  const [isChatClosed, setIsChatClosed] = useState(false);
  const router = useRouter();

  // Auto-close chat effect
  useEffect(() => {
    let isMounted = true;

    if (closingTimer > 0) {
      const timer = setTimeout(() => {
        if (isMounted) {
          setClosingTimer(closingTimer - 1);
        }
      }, 1000);

      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    } else {
      setIsChatClosed(true);
    }
  }, [closingTimer]);

  // Force show feedback button after a maximum wait time
  useEffect(() => {
    const maxWaitTimer = setTimeout(() => {
      setIsChatClosed(true);
    }, 15000);

    return () => clearTimeout(maxWaitTimer);
  }, []);

  const handleViewFeedback = () => {
    router.push(`/dashboard/applications/${applicationId}/interview/feedback`);
  };

  const getCompletionMessage = () => {
    if (isInterrupted) {
      switch (interruptionReason) {
        case 'timer_expired':
          return {
            title: 'Interview Time Expired',
            message: 'Your interview session has ended due to the allotted time limit.',
          };
        case 'technical_issue':
          return {
            title: 'Interview Interrupted',
            message: 'Your interview was interrupted due to a technical connection issue.',
          };
        case 'user_action':
          return {
            title: 'Interview Ended',
            message: 'Your interview session has been ended.',
          };
        default:
          return {
            title: 'Interview Interrupted',
            message: 'Your interview session was interrupted.',
          };
      }
    }
    return {
      title: 'Interview Completed',
      message: 'Thank you for completing your virtual interview.',
    };
  };

  const completionInfo = getCompletionMessage();

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 border border-green-200">
        <CircleCheck className="h-10 w-10 text-green-600" />
      </div>

      <Card className="w-full border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
            {completionInfo.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            {completionInfo.message} {!isInterrupted && 'for the'}{' '}
            <Badge
              variant="secondary"
              className="font-medium bg-slate-100 text-slate-700 border-slate-200"
            >
              {jobTitle}
            </Badge>{' '}
            position at{' '}
            <Badge
              variant="secondary"
              className="font-medium bg-slate-100 text-slate-700 border-slate-200"
            >
              {companyName}
            </Badge>
          </p>

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4 text-left text-xs space-y-2">
            <h3 className="font-semibold text-slate-900">Next Steps:</h3>
            <ul className="space-y-1.5 text-slate-600">
              <li>• Your answers and audio responses have been recorded</li>
              <li>• An AI-generated performance scorecard is being prepared</li>
              <li>• The hiring team can review your results immediately</li>
            </ul>
          </div>

          {!isChatClosed && (
            <div className="flex items-center justify-center text-xs font-mono tabular-nums text-slate-500 gap-2 pt-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Closing in {closingTimer}s...</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center pt-2">
          {isChatClosed ? (
            <Button onClick={handleViewFeedback} className="w-full h-10 text-sm">
              View Interview Feedback & Analysis
            </Button>
          ) : (
            <div className="flex items-center justify-center text-xs text-slate-500 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Compiling interview scorecard...</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
