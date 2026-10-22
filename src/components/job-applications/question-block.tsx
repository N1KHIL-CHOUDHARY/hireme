'use client';

import { CheckCircle2, MessageSquare, Play, Square, Volume2 } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  text: string;
  sender: 'ai' | 'user' | 'system';
  timestamp: string;
  questionId?: string;
  questionCategory?: string;
  feedback?: string;
  audioUrl?: string;
  signedAudioUrl?: string;
}

interface QuestionBlockProps {
  index: number;
  question: ChatMessage;
  answer?: string | null;
  isPlaying?: boolean;
  onPlayAudio?: (url: string) => void;
  categoryLabel?: string;
}

export function QuestionBlock({
  index,
  question,
  answer,
  isPlaying = false,
  onPlayAudio,
  categoryLabel,
}: QuestionBlockProps) {
  return (
    <Card className="overflow-hidden border border-border bg-white p-0 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color] duration-150 hover:border-slate-300">
      {/* Question Header & Prompt */}
      <div className="flex items-start gap-3.5 bg-slate-50/75 p-4 border-b border-border/70">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary font-mono text-xs font-semibold text-white">
          {index + 1}
        </span>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            {categoryLabel && (
              <Badge variant="outline" className="text-[10px] font-normal text-slate-500 bg-white">
                {categoryLabel}
              </Badge>
            )}
            {question.signedAudioUrl && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <Volume2 className="size-3" />
                Audio Question
              </span>
            )}
          </div>
          <p className="text-sm font-medium leading-relaxed text-slate-900">{question.text}</p>
        </div>

        {/* Audio Player Button */}
        {question.signedAudioUrl && onPlayAudio && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPlayAudio(question.signedAudioUrl!)}
            className={cn(
              'h-8 px-2.5 text-xs shrink-0 gap-1.5 transition-colors',
              isPlaying
                ? 'bg-primary text-white hover:bg-primary/90 border-primary'
                : 'text-slate-700 hover:text-primary hover:bg-blue-50'
            )}
          >
            {isPlaying ? (
              <>
                <Square className="size-3.5 fill-current" />
                Stop
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current" />
                Listen
              </>
            )}
          </Button>
        )}
      </div>

      {/* Answer & Candidate Response */}
      <div className="p-4 bg-white space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <MessageSquare className="size-3.5" />
          <span>Candidate Response</span>
        </div>
        {answer ? (
          <div className="rounded-md border border-slate-100 bg-slate-50/50 p-3.5 text-sm leading-relaxed text-slate-800 whitespace-pre-line">
            {answer}
          </div>
        ) : (
          <p className="text-xs italic text-slate-400">No response recorded for this prompt.</p>
        )}

        {/* Optional AI Feedback on this specific question */}
        {question.feedback && (
          <div className="mt-3 flex items-start gap-2 rounded-md bg-blue-50/60 p-3 text-xs text-slate-700 border border-blue-100/80">
            <CheckCircle2 className="size-4 shrink-0 text-primary mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">AI Evaluation: </span>
              {question.feedback}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

interface QuestionGroupProps {
  label: string;
  questions: ChatMessage[];
  getAnswer: (id?: string) => string | null;
  playingUrl: string | null;
  onPlay: (url: string) => void;
}

export function QuestionGroup({
  label,
  questions,
  getAnswer,
  playingUrl,
  onPlay,
}: QuestionGroupProps) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label} Questions
        </h4>
        <span className="font-mono text-xs text-slate-400">({questions.length})</span>
      </div>
      <div className="space-y-3">
        {questions.map((question, index) => {
          const answer = getAnswer(question.questionId);
          return (
            <QuestionBlock
              key={question.questionId ?? index}
              index={index}
              question={question}
              answer={answer}
              categoryLabel={label}
              isPlaying={Boolean(question.signedAudioUrl && playingUrl === question.signedAudioUrl)}
              onPlayAudio={onPlay}
            />
          );
        })}
      </div>
    </div>
  );
}
