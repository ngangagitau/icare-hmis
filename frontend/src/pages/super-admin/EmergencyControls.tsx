import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Lock,
  Unlock,
  Power,
  PowerOff,
  Shield,
  Users,
  Database,
  Wifi
} from "lucide-react";

const EmergencyControls = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-red-600">Emergency Controls</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Critical system controls for emergency situations only.
          </p>
        </div>
        <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
          <AlertTriangle className="h-3 w-3 mr-1" />
          EMERGENCY ACCESS
        </Badge>
      </div>

      <Alert className="border-red-500/20 bg-red-500/5">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          <strong>CRITICAL WARNING:</strong> These controls can cause system-wide disruption.
          All actions are permanently logged and require immediate justification.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-card border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Lock className="h-5 w-5" />
              Access Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button className="w-full justify-start gap-2" variant="destructive">
                <Lock className="h-4 w-4" />
                Lock All User Accounts
              </Button>
              <Button className="w-full justify-start gap-2" variant="destructive">
                <Users className="h-4 w-4" />
                Force Logout All Users
              </Button>
              <Button className="w-full justify-start gap-2" variant="destructive">
                <Shield className="h-4 w-4" />
                Enable Security Lockdown
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Power className="h-5 w-5" />
              System Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Power className="h-4 w-4" />
                Enter Maintenance Mode
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline">
                <Database className="h-4 w-4" />
                Emergency Database Backup
              </Button>
              <Button className="w-full justify-start gap-2" variant="destructive">
                <PowerOff className="h-4 w-4" />
                Emergency System Shutdown
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Emergency Action Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-500/5 border border-gray-500/20">
              <AlertTriangle className="h-4 w-4 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Maintenance Mode Activated</p>
                <p className="text-xs text-muted-foreground">By Super Admin - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <Lock className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Security Lockdown Initiated</p>
                <p className="text-xs text-muted-foreground">By Super Admin - 1 week ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-600">Emergency Override</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Emergency Action</Label>
              <Textarea
                id="reason"
                placeholder="Provide detailed justification for this emergency action..."
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmation">Confirmation Code</Label>
              <Input
                id="confirmation"
                placeholder="Enter confirmation code"
                type="password"
              />
              <p className="text-xs text-muted-foreground">
                Contact system administrator for confirmation code
              </p>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="destructive" className="flex-1">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Execute Emergency Protocol
            </Button>
            <Button variant="outline" className="flex-1">
              <Unlock className="h-4 w-4 mr-2" />
              Cancel & Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyControls;