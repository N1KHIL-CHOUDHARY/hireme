'use client';

import { CheckCircle2, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

import { AIInterviewerIcon } from './ai-interviewer-icon';
import { DeviceCheck } from './device-check';
import { InterviewDetailsDialog } from './interview-details-dialog';

interface InterviewClientProps {
  applicationId: string;
  jobTitle: string;
  companyName: string;
  location?: string;
  skills?: string[];
  interviewDuration: number; // in minutes
}

export function InterviewClient({
  applicationId,
  jobTitle,
  companyName,
  location,
  skills = [],
  interviewDuration,
}: InterviewClientProps) {
  const [cameraChecked, setCameraChecked] = useState(false);
  const [micChecked, setMicChecked] = useState(false);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string | null>(null);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const router = useRouter();

  const handleDeviceCheckComplete = (camera: boolean, microphone: boolean) => {
    setCameraChecked(camera);
    setMicChecked(microphone);
  };

  // Save device preferences to localStorage when they change
  useEffect(() => {
    if (selectedVideoDevice) {
      localStorage.setItem('preferredVideoDevice', selectedVideoDevice);
    }
    if (selectedAudioDevice) {
      localStorage.setItem('preferredAudioDevice', selectedAudioDevice);
    }
  }, [selectedVideoDevice, selectedAudioDevice]);

  // Load device preferences from localStorage on component mount
  useEffect(() => {
    const savedVideoDevice = localStorage.getItem('preferredVideoDevice');
    const savedAudioDevice = localStorage.getItem('preferredAudioDevice');

    if (savedVideoDevice) setSelectedVideoDevice(savedVideoDevice);
    if (savedAudioDevice) setSelectedAudioDevice(savedAudioDevice);
  }, []);

  const handleShowDetails = () => {
    setShowDetailsDialog(true);
  };

  const handleStartInterview = () => {
    localStorage.setItem('currentInterviewId', applicationId);
    router.push(`/dashboard/applications/${applicationId}/interview/session`);
  };

  const bothDevicesChecked = cameraChecked && micChecked;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-6 text-center">
        <div className="mx-auto mb-4 flex flex-col items-center">
          <AIInterviewerIcon size={80} />
          <h2 className="text-xl font-bold text-slate-900 mt-4">Ready to begin your interview?</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mt-2 leading-relaxed">
            Our AI interviewer will guide you through a series of questions to assess your skills
            and experience for this position. Please ensure your camera and microphone are working.
          </p>
        </div>

        <div className="pt-2 flex flex-col items-center">
          <DeviceCheck
            onComplete={handleDeviceCheckComplete}
            initialVideoDeviceId={selectedVideoDevice}
            initialAudioDeviceId={selectedAudioDevice}
            onDeviceChange={(videoId: string | null, audioId: string | null) => {
              setSelectedVideoDevice(videoId);
              setSelectedAudioDevice(audioId);
            }}
          />

          <Button
            size="lg"
            className="w-full max-w-md mt-6 h-11 text-sm font-medium"
            disabled={!bothDevicesChecked}
            onClick={handleShowDetails}
          >
            {bothDevicesChecked ? 'Proceed to Interview' : 'Verify Camera & Mic to Continue'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200/80 bg-white p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Info className="h-4 w-4 text-primary" />
          <span>Interview Tips & Guidelines</span>
        </div>
        <ul className="space-y-2 text-xs text-slate-600">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>Find a quiet room with good lighting and minimal background noise.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>Speak clearly and maintain eye contact with the camera while answering.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>You can speak using your microphone or type in your answers in the chat.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              The session will take approximately{' '}
              <span className="font-mono tabular-nums">{interviewDuration}</span> minutes.
            </span>
          </li>
        </ul>
      </div>

      <InterviewDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        onStartInterview={handleStartInterview}
        jobTitle={jobTitle}
        companyName={companyName}
        location={location}
        skills={skills}
        interviewDuration={interviewDuration}
      />
    </div>
  );
}
