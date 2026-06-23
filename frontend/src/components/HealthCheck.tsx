import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface HealthStatus {
  status: string;
  timestamp: string;
  message?: string;
  version?: string;
  environment?: string;
}

export function HealthCheck() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<HealthStatus>('/health');
      setStatus(response);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to backend');
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Backend Connection Status</CardTitle>
          <CardDescription>iCare HMIS API Health Check</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {status && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Backend is connected successfully
              </AlertDescription>
            </Alert>
          )}

          {status && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className="text-green-600">{status.status}</span>
              </div>
              {status.version && (
                <div className="flex justify-between">
                  <span className="font-medium">Version:</span>
                  <span>{status.version}</span>
                </div>
              )}
              {status.environment && (
                <div className="flex justify-between">
                  <span className="font-medium">Environment:</span>
                  <span>{status.environment}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Timestamp:</span>
                <span>{new Date(status.timestamp).toLocaleString()}</span>
              </div>
            </div>
          )}

          <Button
            onClick={checkHealth}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Checking...' : 'Refresh Status'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
