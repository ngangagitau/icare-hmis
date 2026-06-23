import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { useModules } from "@/contexts/ModuleContext";
import apiClient from "@/lib/api";
import { Save, RotateCcw } from "lucide-react";

export default function SystemSettings() {
  const { enabledModules, enableAllModules, disableAllModules } = useModules();
  const [autoLogout, setAutoLogout] = useState(true);
  const [enforcePayment, setEnforcePayment] = useState(true);
  const [enableSMS, setEnableSMS] = useState(false);
  const [lockFinancial, setLockFinancial] = useState(true);
  const [inactivityTimeout, setInactivityTimeout] = useState("30");
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await apiClient.post("/settings/system", {
        autoLogout,
        inactivityTimeout: parseInt(inactivityTimeout),
        enforcePayment,
        enableSMS,
        lockFinancial,
      });
      toast.success("Settings saved successfully!");
    } catch (err: any) {
      toast.error("Failed to save settings", { description: err?.message });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setAutoLogout(true);
    setEnforcePayment(true);
    setEnableSMS(false);
    setLockFinancial(true);
    setInactivityTimeout("30");
    toast.info("Settings reset to defaults");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground text-sm">Global system configuration and preferences</p>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Hospital Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Hospital Name</Label>
              <Input defaultValue="MediCore General Hospital" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Registration Number</Label>
              <Input defaultValue="KMPDB-2024-001" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Phone</Label>
              <Input defaultValue="+254 20 123 4567" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email</Label>
              <Input defaultValue="info@medicore.co.ke" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Security & Session Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-slate-50 transition-colors">
            <div>
              <Label className="text-sm font-medium">Auto-logout after inactivity</Label>
              <p className="text-xs text-muted-foreground mt-1">Automatically log out inactive users</p>
            </div>
            <Switch checked={autoLogout} onCheckedChange={setAutoLogout} />
          </div>

          {autoLogout && (
            <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-border">
              <Label className="text-sm font-medium">Inactivity Timeout (minutes)</Label>
              <Select value={inactivityTimeout} onValueChange={setInactivityTimeout}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-slate-50 transition-colors">
            <div>
              <Label className="text-sm font-medium">Financial period lock</Label>
              <p className="text-xs text-muted-foreground mt-1">Prevent edits to closed financial periods</p>
            </div>
            <Switch checked={lockFinancial} onCheckedChange={setLockFinancial} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Service & Billing Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-slate-50 transition-colors">
            <div>
              <Label className="text-sm font-medium">Enforce payment before service</Label>
              <p className="text-xs text-muted-foreground mt-1">Require payment verification for cash patients</p>
            </div>
            <Switch checked={enforcePayment} onCheckedChange={setEnforcePayment} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-slate-50 transition-colors">
            <div>
              <Label className="text-sm font-medium">Enable SMS notifications</Label>
              <p className="text-xs text-muted-foreground mt-1">Send appointment and result notifications via SMS</p>
            </div>
            <Switch checked={enableSMS} onCheckedChange={setEnableSMS} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Module Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={enableAllModules}
              className="flex-1"
            >
              Enable All Modules
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={disableAllModules}
              className="flex-1"
            >
              Disable All Modules
            </Button>
          </div>
          <div className="text-xs text-muted-foreground p-2 bg-slate-50 rounded border border-border">
            Currently {enabledModules.size} module{enabledModules.size !== 1 ? "s" : ""} enabled. 
            Manage individual modules in <strong>Super Admin → Module Control</strong>.
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={saving}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button 
          onClick={handleSaveSettings}
          disabled={saving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
