import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RiskBreakdownCategory, getSeverityColor } from '@/lib/clinicalIntelligenceService';

interface Props {
  breakdown: RiskBreakdownCategory[];
}

const CATEGORY_ICONS: Record<string, string> = {
  Vitals: '💓',
  Age: '🧑',
  Comorbidities: '🏥',
  Labs: '🔬',
};

export const RiskBreakdown: React.FC<Props> = ({ breakdown }) => {
  if (!breakdown || breakdown.length === 0) {
    return <p className="text-gray-500 text-sm">No breakdown available.</p>;
  }

  return (
    <div className="space-y-4">
      {breakdown.map((cat) => (
        <div key={cat.category} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{CATEGORY_ICONS[cat.category] || '📊'}</span>
              <span className="font-semibold text-sm">{cat.category}</span>
            </div>
            <span className="text-sm text-gray-600">{cat.score}/{cat.maxScore} pts</span>
          </div>
          <Progress value={(cat.score / cat.maxScore) * 100} className="h-2" />
          {cat.factors.length > 0 && (
            <div className="pl-6 space-y-1">
              {cat.factors.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 ${getSeverityColor(f.severity)}`}
                  >
                    +{f.points}
                  </Badge>
                  <div>
                    <span className="font-medium">{f.factor}</span>
                    {f.detail && <span className="text-gray-400 ml-1">— {f.detail}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
