import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Zap, Shield, AlertTriangle, Activity, Power } from "lucide-react";
import { useState } from "react";

const SuperAdmin = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Super Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            God Mode activated. System-wide control and emergency capabilities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Zap className="h-3 w-3 mr-1" />
            GOD MODE
          </Badge>
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            <Shield className="h-3 w-3 mr-1" />
            MAX AUTHORITY
          </Badge>
        </div>
      </div>

      <Alert className="border-yellow-500/20 bg-yellow-500/5">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-700">
          <strong>Warning:</strong> You have unlimited system access. All actions are logged and audited.
          Use extreme caution with emergency controls.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-card border-border hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold">God Mode Status</h3>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">System Health</h3>
                <p className="text-sm text-muted-foreground">All systems operational</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Power className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold">Emergency Controls</h3>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" variant="outline">
              <Zap className="h-4 w-4" />
              Enable Maintenance Mode
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Shield className="h-4 w-4" />
              Lock All User Sessions
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Activity className="h-4 w-4" />
              System Health Check
            </Button>
            <Button className="w-full justify-start gap-2" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              Emergency Shutdown
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Database</span>
              <Badge className="bg-green-500/10 text-green-600">Online</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">API Services</span>
              <Badge className="bg-green-500/10 text-green-600">Operational</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Backup Systems</span>
              <Badge className="bg-yellow-500/10 text-yellow-600">Running</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Security Systems</span>
              <Badge className="bg-green-500/10 text-green-600">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdmin;