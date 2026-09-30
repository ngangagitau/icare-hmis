import React from 'react';
import { RiskAssessment, getRiskColor } from '@/lib/clinicalIntelligenceService';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface Props {
  history: RiskAssessment[];
}

export const RiskHistory: React.FC<Props> = ({ history }) => {
  if (!history || history.length === 0) {
    return <p className="text-gray-500 text-sm py-4 text-center">No previous assessments recorded.</p>;
  }

  const chartData = [...history]
    .reverse()
    .map((h) => {
      const dateVal = h.assessedAt || (h as any).assessed_at || (h as any).created_at;
      return {
        date: dateVal ? format(new Date(dateVal), 'MMM dd HH:mm') : '',
        score: h.score,
        level: h.riskLevel,
      };
    });

  const getLineColor = (score: number) => {
    if (score >= 70) return '#dc2626';
    if (score >= 50) return '#ea580c';
    if (score >= 30) return '#ca8a04';
    return '#16a34a';
  };

  return (
    <div className="space-y-4">
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(value: number) => [`${value}/100`, 'Risk Score']}
            />
            <ReferenceLine y={70} stroke="#dc2626" strokeDasharray="4 2" label={{ value: 'HIGH', position: 'right', fontSize: 10 }} />
            <ReferenceLine y={50} stroke="#ea580c" strokeDasharray="4 2" label={{ value: 'MOD', position: 'right', fontSize: 10 }} />
            <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 max-h-52 overflow-y-auto">
        {history.map((h, i) => {
          const dateVal = h.assessedAt || (h as any).assessed_at || (h as any).created_at;
          return (
            <div key={h.id ?? i} className="flex items-center justify-between text-sm border-b pb-2">
              <span className="text-gray-500 text-xs">
                {dateVal ? format(new Date(dateVal), 'MMM dd, yyyy HH:mm') : 'Unknown date'}
              </span>
              <div className="flex items-center gap-3">
                <span className={`font-bold ${getRiskColor(h.riskLevel)}`}>{Math.round(h.score)}/100</span>
                <span className={`text-xs font-semibold ${getRiskColor(h.riskLevel)}`}>{h.riskLevel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
