import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { modules } from "@/config/modules";
import { Settings, Eye, EyeOff, Search, X, Power, PowerOff, RotateCcw, Lock, ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useModules } from "@/contexts/ModuleContext";

const initialSubmoduleAssignments: Record<string, string> = modules.reduce((acc, mod) => {
  mod.submodules.forEach((sub) => {
    acc[sub.title] = mod.key;
  });
  return acc;
}, {} as Record<string, string>);

const ModuleControl = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMenuKey, setSelectedMenuKey] = useState(modules[0]?.submodules[0]?.url ?? "");
  const { enabledModules, toggleModule, enableAllModules, disableAllModules } = useModules();
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedModuleKey, setSelectedModuleKey] = useState(modules[0]?.key ?? "");
  const [selectedModule, setSelectedModule] = useState<any>(modules[0] || null);
  const [enabledSubmodules, setEnabledSubmodules] = useState<Record<string, Set<string>>>(() => {
    const initial: Record<string, Set<string>> = {};
    modules.forEach(mod => {
      initial[mod.key] = new Set(mod.submodules.map(sub => sub.url));
    });
    return initial;
  });

  const [submoduleAssignments, setSubmoduleAssignments] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('submoduleAssignments');
    return saved ? { ...initialSubmoduleAssignments, ...JSON.parse(saved) } : initialSubmoduleAssignments;
  });

  const allSubmodules = useMemo(
    () => modules.flatMap((mod) =>
      mod.submodules.map((sub) => ({ ...sub, originModule: mod.key }))
    ),
    []
  );

  const handleAssignmentChange = (submoduleTitle: string, newModuleKey: string) => {
    setSubmoduleAssignments((prev) => {
      const updated = { ...prev, [submoduleTitle]: newModuleKey };
      localStorage.setItem('submoduleAssignments', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAssignSubmodule = (submoduleTitle: string) => {
    handleAssignmentChange(submoduleTitle, selectedModuleKey);
  };

  const handleUnassignSubmodule = (submoduleTitle: string) => {
    const original = initialSubmoduleAssignments[submoduleTitle] ?? selectedModuleKey;
    handleAssignmentChange(submoduleTitle, original);
  };

  const handleResetAssignments = () => {
    setSubmoduleAssignments(initialSubmoduleAssignments);
    localStorage.removeItem('submoduleAssignments');
  };

  const activeModule = modules.find((mod) => mod.key === selectedModuleKey) ?? modules[0];

  // Filter to only include enabled modules' submodules
  const enabledSubmodulesForAssignment = useMemo(
    () => allSubmodules.filter((sub) => enabledModules.has(sub.originModule)),
    [enabledModules, allSubmodules]
  );

  const availableSubmodules = enabledSubmodulesForAssignment.filter(
    (sub) => submoduleAssignments[sub.title] !== activeModule.key
  );

  const assignedSubmodules = enabledSubmodulesForAssignment.filter(
    (sub) => submoduleAssignments[sub.title] === activeModule.key
  );

  const filteredModules = useMemo(() => {
    let result = modules;
    
    // Filter by enabled modules
    result = result.filter(mod => enabledModules.has(mod.key));
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (mod) =>
          mod.label.toLowerCase().includes(query) ||
          mod.key.toLowerCase().includes(query) ||
          mod.submodules.some(
            (sub) =>
              sub.title.toLowerCase().includes(query) ||
              sub.url.toLowerCase().includes(query)
          )
      );
    }
    
    return result;
  }, [searchQuery, enabledModules]);



  const handleViewModule = (module: any) => {
    navigate(module.basePath);
  };

  const handleConfigureModule = (module: any) => {
    setSelectedModule(module);
    setConfigDialogOpen(true);
  };

  const toggleSubmodule = (moduleKey: string, submoduleUrl: string) => {
    setEnabledSubmodules(prev => {
      const newState = { ...prev };
      if (!newState[moduleKey]) {
        newState[moduleKey] = new Set();
      }
      const submoduleSet = new Set(newState[moduleKey]);
      if (submoduleSet.has(submoduleUrl)) {
        submoduleSet.delete(submoduleUrl);
      } else {
        submoduleSet.add(submoduleUrl);
      }
      newState[moduleKey] = submoduleSet;
      return newState;
    });
  };

  const enableAllSubmodules = (moduleKey: string) => {
    const module = modules.find(m => m.key === moduleKey);
    if (module) {
      setEnabledSubmodules(prev => ({
        ...prev,
        [moduleKey]: new Set(module.submodules.map(sub => sub.url))
      }));
    }
  };

  const disableAllSubmodules = (moduleKey: string) => {
    setEnabledSubmodules(prev => ({
      ...prev,
      [moduleKey]: new Set()
    }));
  };

  const resetToDefaults = () => {
    enableAllModules();
  };

  const emergencyLockdown = () => {
    // This would trigger emergency protocols in a real system
    disableAllModules();
    toggleModule('super-admin'); // Only keep super-admin enabled
    alert('Emergency lockdown initiated! Only Super Admin module remains active.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Module Control</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enable, disable, or configure system modules globally.
          </p>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="text-green-600">● {enabledModules.size} Enabled</span>
            <span className="text-red-600">● {modules.length - enabledModules.size} Disabled</span>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Global Settings
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search modules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9 h-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Module & Submodule Management
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select a module, then move submodules between the available and assigned lists.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Module and Menu Selectors */}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">Privilege</label>
              <Select value={selectedModuleKey} onValueChange={(value) => setSelectedModuleKey(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.filter(mod => enabledModules.has(mod.key)).map((mod) => (
                    <SelectItem key={mod.key} value={mod.key}>
                      {mod.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">Menu</label>
              <Select value={selectedMenuKey} onValueChange={(value) => setSelectedMenuKey(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select menu" />
                </SelectTrigger>
                <SelectContent>
                  {activeModule.submodules.filter(sub => enabledModules.has(activeModule.key)).map((sub) => (
                    <SelectItem key={sub.url} value={sub.url}>
                      {sub.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Privilege Detail Section */}
          <div className="space-y-3 mt-6">
            <div className="px-3 py-2 rounded-t-lg bg-blue-600 text-white text-sm font-semibold">Privilege Detail</div>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] border border-t-0 border-border rounded-b-lg p-4 bg-white">
              {/* Available Column */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Available</p>
                <div className="border rounded-lg border-border bg-slate-50 p-3 min-h-[400px] max-h-[400px] overflow-y-auto space-y-2">
                  {availableSubmodules.length > 0 ? (
                    availableSubmodules.map((submodule) => (
                      <button
                        key={submodule.title}
                        onClick={() => handleAssignSubmodule(submodule.title)}
                        className="w-full text-left p-2 rounded-md hover:bg-slate-200 transition-colors text-sm"
                      >
                        {submodule.title}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No available submodules</p>
                  )}
                </div>
              </div>

              {/* Arrow Controls */}
              <div className="flex flex-col items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-full border border-border p-0"
                  onClick={() => {
                    if (availableSubmodules.length > 0) {
                      handleAssignSubmodule(availableSubmodules[0].title);
                    }
                  }}
                  disabled={availableSubmodules.length === 0}
                  title="Add to assigned"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-full border border-border p-0"
                  onClick={() => {
                    if (assignedSubmodules.length > 0) {
                      handleUnassignSubmodule(assignedSubmodules[0].title);
                    }
                  }}
                  disabled={assignedSubmodules.length === 0}
                  title="Remove from assigned"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </div>

              {/* Remaining Column */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Remaining</p>
                <div className="border rounded-lg border-border bg-slate-50 p-3 min-h-[400px] max-h-[400px] overflow-y-auto space-y-2">
                  {assignedSubmodules.length > 0 ? (
                    assignedSubmodules.map((submodule) => (
                      <button
                        key={submodule.title}
                        onClick={() => handleUnassignSubmodule(submodule.title)}
                        className="w-full text-left p-2 rounded-md hover:bg-slate-200 transition-colors text-sm"
                      >
                        {submodule.title}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No assigned submodules</p>
                  )}
                </div>
              </div>
            </div>

            {/* Generate Menu Button */}
            <div className="flex justify-center">
              <Button className="w-48">Generate Menu</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredModules.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No modules found matching "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((mod) => (
          <Card
            key={mod.key}
            className={`shadow-card border-border transition-all duration-200 ${
              !enabledModules.has(mod.key) ? 'opacity-60 grayscale' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: `hsl(${mod.color} / 0.15)` }}
                  >
                    <mod.icon
                      className="h-4 w-4"
                      style={{ color: `hsl(${mod.color})` }}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{mod.label}</CardTitle>
                    <p className="text-xs text-muted-foreground">{mod.key}</p>
                  </div>
                </div>
                <Switch
                  checked={enabledModules.has(mod.key)}
                  onCheckedChange={() => toggleModule(mod.key)}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Status</span>
                  <Badge className={enabledModules.has(mod.key) ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}>
                    {enabledModules.has(mod.key) ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Access Level</span>
                  <span className="text-muted-foreground">All Users</span>
                </div>
                <div className="flex gap-1 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => handleViewModule(mod)}
                    disabled={!enabledModules.has(mod.key)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => handleConfigureModule(mod)}
                    disabled={!enabledModules.has(mod.key)}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Config
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={enableAllModules} className="gap-2">
              <Power className="h-3 w-3" />
              Enable All
            </Button>
            <Button variant="outline" size="sm" onClick={disableAllModules} className="gap-2">
              <PowerOff className="h-3 w-3" />
              Disable All
            </Button>
            <Button variant="outline" size="sm" onClick={resetToDefaults} className="gap-2">
              <RotateCcw className="h-3 w-3" />
              Reset to Defaults
            </Button>
            <Button variant="destructive" size="sm" onClick={emergencyLockdown} className="gap-2">
              <Lock className="h-3 w-3" />
              Emergency Lockdown
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Bulk actions affect all modules simultaneously. Use with extreme caution.
          </p>
        </CardContent>
      </Card>

      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configure {selectedModule?.label} Submodules
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => enableAllSubmodules(selectedModule?.key)}
                className="gap-2"
              >
                <Power className="h-3 w-3" />
                Enable All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => disableAllSubmodules(selectedModule?.key)}
                className="gap-2"
              >
                <PowerOff className="h-3 w-3" />
                Disable All
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedModule?.submodules.map((submodule: any) => (
                <div
                  key={submodule.url}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <submodule.icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{submodule.title}</p>
                      <p className="text-xs text-muted-foreground">{submodule.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        enabledSubmodules[selectedModule.key]?.has(submodule.url)
                          ? "bg-green-500/10 text-green-600"
                          : "bg-red-500/10 text-red-600"
                      }
                    >
                      {enabledSubmodules[selectedModule.key]?.has(submodule.url) ? "Enabled" : "Disabled"}
                    </Badge>
                    <Switch
                      checked={enabledSubmodules[selectedModule.key]?.has(submodule.url) || false}
                      onCheckedChange={() => toggleSubmodule(selectedModule.key, submodule.url)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => setConfigDialogOpen(false)}>
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModuleControl;