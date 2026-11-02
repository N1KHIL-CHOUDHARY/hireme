import { Check, RefreshCw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MatchScoreBadge } from '@/components/ui/status-badge';

interface MatchResultProps {
  score?: number;
  comments?: string;
  matchedAt?: string;
  topSkillMatches?: string[];
  missingSkills?: string[];
  onRefreshRequest?: () => void;
}

export default function ResumeMatchResult({
  score,
  comments,
  matchedAt,
  topSkillMatches,
  missingSkills,
  onRefreshRequest,
}: MatchResultProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold text-slate-900">
            Resume Match Analysis
          </CardTitle>
          {matchedAt && (
            <p className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
              Updated: {new Date(matchedAt).toLocaleString()}
            </p>
          )}
        </div>
        {onRefreshRequest && (
          <Button
            onClick={onRefreshRequest}
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            Refresh Analysis
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-6">
        {score !== undefined ? (
          <div className="space-y-6">
            {/* Score Callout */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-lg border border-slate-100 bg-slate-50/50">
              <div className="flex flex-col items-center justify-center flex-shrink-0">
                <span
                  className={`text-4xl font-bold font-mono tabular-nums ${
                    score >= 70 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'
                  }`}
                >
                  {score}%
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  {score >= 70 ? 'Strong Match' : score >= 50 ? 'Partial Match' : 'Low Match'}
                </span>
              </div>
              <div className="flex-1 w-full space-y-2">
                <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      score >= 70 ? 'bg-green-600' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Match threshold</span>
                  <MatchScoreBadge score={score} />
                </div>
              </div>
            </div>

            {/* Skills breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topSkillMatches && topSkillMatches.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Top Matching Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {topSkillMatches.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs font-normal bg-green-50 text-green-700 border-green-200"
                      >
                        <Check className="h-3 w-3 mr-1 text-green-600" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {missingSkills && missingSkills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Skills to Develop
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {missingSkills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs font-normal bg-red-50/60 text-red-700 border-red-200"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Analysis Below */}
            {comments && (
              <div className="pt-4 border-t border-slate-100 space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  AI Screening Summary
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {comments}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-slate-500">No match analysis available yet.</p>
            {onRefreshRequest && (
              <Button onClick={onRefreshRequest} size="sm">
                Generate Match Analysis
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
