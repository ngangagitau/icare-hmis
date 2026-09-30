import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, Clock, Users, CheckCircle } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';
import { getFlowAnalytics, getCongestionMetrics, DEPARTMENT_LABELS } from '@/lib/patientFlowService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function PatientFlowAnalyticsPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['flow-analytics', period],
    queryFn: () => getFlowAnalytics(period),
    staleTime: 60_000,
  });

  const { data: congestion = [] } = useQuery({
    queryKey: ['congestion-metrics'],
    queryFn: getCongestionMetrics,
    refetchInterval: 60_000,
  });

  const byDeptData = analytics?.byDepartment
    ? Object.entries(analytics.byDepartment).map(([dept, d]) => ({
        name: DEPARTMENT_LABELS[dept] || dept,
        Patients: d.total,
        AvgWait: Math.round(d.avgWait),
      }))
    : [];

  const byPriorityData = analytics?.byPriority
    ? Object.entries(analytics.byPriority).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flow Analytics</h1>
          <p className="text-sm text-gray-500">Patient flow statistics and performance metrics</p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as 'today' | 'week' | 'month')}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-blue-500" /></div>
      ) : analytics ? (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Users size={18} className="text-blue-600" /><p className="text-xs text-gray-500">Total Patients</p></div><p className="text-2xl font-bold">{analytics.totalPatients}</p></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Clock size={18} className="text-orange-500" /><p className="text-xs text-gray-500">Avg Wait</p></div><p className="text-2xl font-bold">{Math.round(analytics.avgWaitMinutes)}m</p></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><CheckCircle size={18} className="text-green-500" /><p className="text-xs text-gray-500">Served</p></div><p className="text-2xl font-bold">{analytics.servedCount ?? '—'}</p></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><TrendingUp size={18} className="text-purple-500" /><p className="text-xs text-gray-500">Peak Hour</p></div><p className="text-2xl font-bold">{analytics.peakHour !== undefined ? `${analytics.peakHour}:00` : '—'}</p></CardContent></Card>
          </div>

          {/* By Department */}
          {byDeptData.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Volume & Avg Wait by Department</CardTitle></CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byDeptData}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="Patients" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="AvgWait" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority distribution */}
            {byPriorityData.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Priority Distribution</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={byPriorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}>
                          {byPriorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Congestion */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Department Congestion Status</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {congestion.map((c) => (
                  <div key={c.department} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{DEPARTMENT_LABELS[c.department] || c.department}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">{c.activeCount}/{c.congestionLimit} patients</span>
                      <span className={`text-xs font-semibold ${c.isCongested ? 'text-red-600' : 'text-green-600'}`}>{c.isCongested ? 'CONGESTED' : 'OK'}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-400 py-16">No analytics data available</p>
      )}
    </div>
  );
}
