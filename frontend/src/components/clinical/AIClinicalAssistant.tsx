import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, Loader2, Send, AlertCircle } from 'lucide-react';
import { getAIAssistance, AIAssistanceResult } from '@/lib/clinicalIntelligenceService';
import { toast } from '@/hooks/use-toast';

interface Props {
  patientId: string;
}

type ActionType = 'summary' | 'explain_risk' | 'review_history' | 'abnormal_results' | 'handover' | 'query';

const ACTIONS: { type: ActionType; label: string; icon: string }[] = [
  { type: 'summary', label: 'Clinical Summary', icon: '📋' },
  { type: 'explain_risk', label: 'Explain Risk', icon: '⚠️' },
  { type: 'review_history', label: 'History Review', icon: '📂' },
  { type: 'abnormal_results', label: 'Abnormal Results', icon: '🔬' },
  { type: 'handover', label: 'Handover Note', icon: '📝' },
  { type: 'query', label: 'Custom Query', icon: '💬' },
];

export const AIClinicalAssistant: React.FC<Props> = ({ patientId }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAssistanceResult | null>(null);
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ActionType>('summary');

  const handleRequest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await getAIAssistance(patientId, selectedType, selectedType === 'query' ? query : undefined);
      setResult(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Request failed';
      toast({ title: 'AI Assistant Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-blue-700">
        <Bot size={20} />
        <span className="font-semibold text-sm">iCare Clinical AI Assistant</span>
        <Badge variant="outline" className="text-xs">Decision Support</Badge>
      </div>

      {/* Action selector */}
      <div className="grid grid-cols-3 gap-2">
        {ACTIONS.map((a) => (
          <Button
            key={a.type}
            variant={selectedType === a.type ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
            onClick={() => setSelectedType(a.type)}
          >
            <span className="mr-1">{a.icon}</span> {a.label}
          </Button>
        ))}
      </div>

      {selectedType === 'query' && (
        <Textarea
          placeholder="Type your clinical question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
        />
      )}

      <Button onClick={handleRequest} disabled={loading || (selectedType === 'query' && !query.trim())} className="w-full">
        {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Send size={16} className="mr-2" />}
        {loading ? 'Processing...' : 'Get AI Assistance'}
      </Button>

      {result && (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{result.text}</p>
          </div>
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md p-3">
            <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">{result.disclaimer}</p>
          </div>
          <p className="text-xs text-gray-400">Model: {result.model}</p>
        </div>
      )}
    </div>
  );
};
