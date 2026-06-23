import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TicketSummary {
  module: string;
  totalTickets: number;
  openTickets: number;
  criticalTickets: number;
  inProgressTickets: number;
}

export default function TicketWidget({ module }: { module?: string }) {
  const [summary, setSummary] = useState<TicketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTicketSummary();
  }, [module]);

  const fetchTicketSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = module
        ? `http://localhost:5000/api/tickets?module=${module}&limit=1000`
        : 'http://localhost:5000/api/tickets?limit=1000';
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const tickets = data.data || [];
        
        setSummary({
          module: module || 'All',
          totalTickets: tickets.length,
          openTickets: tickets.filter((t: any) => t.status === 'Open').length,
          criticalTickets: tickets.filter((t: any) => t.priority === 'Critical').length,
          inProgressTickets: tickets.filter((t: any) => t.status === 'In Progress').length,
        });
      }
    } catch (error) {
      console.error('Error fetching ticket summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {module ? `${module} Tickets` : 'All Tickets'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {summary.totalTickets}
            </div>
            <div className="text-xs text-orange-600 font-medium">Total</div>
          </div>
          {summary.openTickets > 0 && (
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {summary.openTickets}
              </div>
              <div className="text-xs text-yellow-600 font-medium">Open</div>
            </div>
          )}
          {summary.criticalTickets > 0 && (
            <div>
              <div className="text-2xl font-bold text-red-600">
                {summary.criticalTickets}
              </div>
              <div className="text-xs text-red-600 font-medium">Critical</div>
            </div>
          )}
          {summary.inProgressTickets > 0 && (
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {summary.inProgressTickets}
              </div>
              <div className="text-xs text-blue-600 font-medium">In Progress</div>
            </div>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs"
          onClick={() => {
            if (module) {
              navigate(`/ticketing?module=${module}`);
            } else {
              navigate('/ticketing');
            }
          }}
        >
          View Tickets
        </Button>
      </CardContent>
    </Card>
  );
}