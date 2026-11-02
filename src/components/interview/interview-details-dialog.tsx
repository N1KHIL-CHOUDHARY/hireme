'use client';

import { AlertCircle, Building, Clock, MapPin, Users } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { AIInterviewerIcon } from './ai-interviewer-icon';

interface InterviewDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartInterview: () => void;
  jobTitle: string;
  companyName: string;
  location?: string;
  skills: string[];
  interviewDuration: number; // in minutes
}

export function InterviewDetailsDialog({
  open,
  onOpenChange,
  onStartInterview,
  jobTitle,
  companyName,
  location,
  skills,
  interviewDuration,
}: InterviewDetailsDialogProps) {
  const [isStarting, setIsStarting] = useState(false);

  const handleStartInterview = async () => {
    setIsStarting(true);
    try {
      await onStartInterview();
    } finally {
      setIsStarting(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-slate-200">
        <DialogHeader className="pb-2 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <AIInterviewerIcon size={44} />
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
                Interview Details
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Review the position information and instructions before entering the live session
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Job Information */}
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="py-3 px-4 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Building className="h-4 w-4 text-slate-500" />
                Position Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-base text-slate-900">{jobTitle}</h3>
                <p className="text-xs text-slate-600">{companyName}</p>
                {location && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{location}</span>
                  </div>
                )}
              </div>

              {skills && skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {skills.slice(0, 8).map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs font-normal bg-slate-100 text-slate-700 border-slate-200"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {skills.length > 8 && (
                      <Badge
                        variant="outline"
                        className="text-xs font-normal text-slate-500 border-slate-200"
                      >
                        +{skills.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Overview */}
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="py-3 px-4 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                Session Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <p className="text-xs text-slate-500">Max Duration</p>
                  <p className="text-sm font-semibold font-mono tabular-nums text-slate-900 mt-0.5">
                    {formatDuration(interviewDuration)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <p className="text-xs text-slate-500">Interviewer</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">Hirelytics AI</p>
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-3.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs text-blue-900">
                    <h4 className="font-semibold text-blue-950">Important Guidelines</h4>
                    <ul className="space-y-1 text-blue-800">
                      <li>
                        • The interview automatically ends after {formatDuration(interviewDuration)}
                        .
                      </li>
                      <li>• Please stay in the browser tab during the entire interview.</li>
                      <li>• You can speak via your microphone or type replies in the chat box.</li>
                      <li>
                        • When finished, your answers will be summarized and scored automatically.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="pt-2 border-t border-slate-100 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isStarting}>
            Cancel
          </Button>
          <Button onClick={handleStartInterview} disabled={isStarting} className="min-w-[130px]">
            {isStarting ? 'Starting...' : 'Start Interview'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
