import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { RiskAssessment, getRiskColor, getRiskBgColor, formatRiskScore } from '@/lib/clinicalIntelligenceService';

interface Props {
  assessment: RiskAssessment;
  compact?: boolean;
}

const RISK_GAUGE_COLORS: Record<string, string> = {
  LOW: '#16a34a',
  MODERATE: '#ca8a04',
  HIGH: '#ea580c',
  CRITICAL: '#dc2626',
};

export const RiskScoreCard: React.FC<Props> = ({ assessment, compact }) => {
  const { score, riskLevel, trend, scoreDelta, rapidDeterioration } = assessment;
  const color = RISK_GAUGE_COLORS[riskLevel] || '#6b7280';
  const bgClass = getRiskBgColor(riskLevel);
  const textClass = getRiskColor(riskLevel);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const TrendIcon = trend === 'Increasing' ? TrendingUp : trend === 'Decreasing' ? TrendingDown : Minus;
  const trendColor = trend === 'Increasing' ? 'text-red-500' : trend === 'Decreasing' ? 'text-green-500' : 'text-gray-400';

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${bgClass}`}>
        <span className={`text-2xl font-bold ${textClass}`}>{Math.round(score)}</span>
        <div>
          <Badge variant={riskLevel === 'LOW' ? 'outline' : riskLevel === 'MODERATE' ? 'secondary' : 'destructive'}>
            {riskLevel}
          </Badge>
          {trend && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${trendColor}`}>
              <TrendIcon size={12} /> {trend} {scoreDelta !== undefined && scoreDelta !== 0 && `(${scoreDelta > 0 ? '+' : ''}${scoreDelta})`}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={`border-2 ${bgClass}`}>
      <CardContent className="p-6 flex flex-col items-center gap-3">
        {rapidDeterioration && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full w-full justify-center">
            <AlertTriangle size={14} /> Rapid Deterioration Detected
          </div>
        )}
        <svg width={140} height={140} viewBox="0 0 140 140">
          <circle cx={70} cy={70} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={14} />
          <circle
            cx={70} cy={70} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={14}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
          <text x={70} y={66} textAnchor="middle" fontSize={28} fontWeight="bold" fill={color}>
            {Math.round(score)}
          </text>
          <text x={70} y={85} textAnchor="middle" fontSize={11} fill="#6b7280">out of 100</text>
        </svg>
        <div className="text-center">
          <Badge
            className="text-sm px-4 py-1"
            variant={['HIGH', 'CRITICAL'].includes(riskLevel) ? 'destructive' : riskLevel === 'MODERATE' ? 'secondary' : 'outline'}
          >
            {riskLevel} RISK
          </Badge>
          {trend && (
            <div className={`flex items-center justify-center gap-1 text-sm mt-2 font-medium ${trendColor}`}>
              <TrendIcon size={16} />
              {trend}
              {scoreDelta !== undefined && scoreDelta !== 0 && (
                <span className="text-xs">({scoreDelta > 0 ? '+' : ''}{scoreDelta} pts)</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
