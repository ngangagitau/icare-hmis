import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Power, Shield, AlertTriangle, Lock, Unlock, Database, Server } from "lucide-react";

const SystemOverride = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-purple-600">System Override</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Advanced system controls and manual overrides for critical situations.
          </p>
        </div>
        <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
          <Power className="h-3 w-3 mr-1" />
          OVERRIDE MODE
        </Badge>
      </div>

      <Alert className="border-purple-500/20 bg-purple-500/5">
        <AlertTriangle className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-700">
          <strong>Advanced Override:</strong> These controls bypass normal system safeguards.
          Use only when standard procedures are insufficient.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Overrides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Disable Authentication</p>
                <p className="text-xs text-muted-foreground">Bypass login requirements</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ignore Access Controls</p>
                <p className="text-xs text-muted-foreground">Grant universal access</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Bypass Audit Logging</p>
                <p className="text-xs text-muted-foreground">Disable activity tracking</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Overrides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Read-Only Mode</p>
                <p className="text-xs text-muted-foreground">Prevent data modifications</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Skip Data Validation</p>
                <p className="text-xs text-muted-foreground">Allow invalid data entry</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Direct Database Access</p>
                <p className="text-xs text-muted-foreground">Raw SQL query execution</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Configuration Override
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                defaultValue="30"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-connections">Max Connections</Label>
              <Input
                id="max-connections"
                type="number"
                defaultValue="1000"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cache-size">Cache Size (MB)</Label>
              <Input
                id="cache-size"
                type="number"
                defaultValue="512"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency (hours)</Label>
              <Input
                id="backup-frequency"
                type="number"
                defaultValue="24"
                className="w-full"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1">
              Apply Configuration
            </Button>
            <Button variant="outline" className="flex-1">
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Critical Override Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="override-reason">Override Justification</Label>
            <Textarea
              id="override-reason"
              placeholder="Provide detailed reason for system override..."
              className="min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admin-code">Administrator Code</Label>
              <Input
                id="admin-code"
                type="password"
                placeholder="Enter admin authorization code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmation">Confirmation</Label>
              <Input
                id="confirmation"
                placeholder="Type 'CONFIRM OVERRIDE' to proceed"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="destructive" className="flex-1">
              <Lock className="h-4 w-4 mr-2" />
              Execute System Override
            </Button>
            <Button variant="outline" className="flex-1">
              <Unlock className="h-4 w-4 mr-2" />
              Cancel Override
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemOverride;