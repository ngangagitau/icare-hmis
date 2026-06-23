import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { modules } from "@/config/modules";
import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { useModules } from "@/contexts/ModuleContext";

const initialSubmoduleAssignments: Record<string, string> = modules.reduce((acc, mod) => {
  mod.submodules.forEach((sub) => {
    acc[sub.title] = mod.key;
  });
  return acc;
}, {} as Record<string, string>);

const allSubmodules = modules.flatMap((mod) =>
  mod.submodules.map((sub) => ({ ...sub, originModule: mod.key }))
);

const AccessControl = () => {
  const { isModuleEnabled } = useModules();
  const [selectedModuleKey, setSelectedModuleKey] = useState(
    modules.find(mod => isModuleEnabled(mod.key))?.key ?? modules[0]?.key ?? ""
  );
  const [selectedMenuKey, setSelectedMenuKey] = useState(modules[0]?.submodules[0]?.url ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAvailableTitle, setSelectedAvailableTitle] = useState<string | null>(null);
  const [selectedAssignedTitle, setSelectedAssignedTitle] = useState<string | null>(null);

  // Load from localStorage or use initial
  const [submoduleAssignments, setSubmoduleAssignments] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('submoduleAssignments');
    return saved ? { ...initialSubmoduleAssignments, ...JSON.parse(saved) } : initialSubmoduleAssignments;
  });

  const handleAssignmentChange = (submoduleTitle: string, newModuleKey: string) => {
    setSubmoduleAssignments(prev => {
      const updated = { ...prev, [submoduleTitle]: newModuleKey };
      localStorage.setItem('submoduleAssignments', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAssignSubmodule = (submoduleTitle: string) => {
    handleAssignmentChange(submoduleTitle, selectedModuleKey);
  };

  const assignSelected = () => {
    if (!selectedAvailableTitle) return;
    handleAssignmentChange(selectedAvailableTitle, selectedModuleKey);
    setSelectedAvailableTitle(null);
  };

  const unassignSelected = () => {
    if (!selectedAssignedTitle) return;
    const original = initialSubmoduleAssignments[selectedAssignedTitle] ?? selectedModuleKey;
    handleAssignmentChange(selectedAssignedTitle, original);
    setSelectedAssignedTitle(null);
  };

  const handleUnassignSubmodule = (submoduleTitle: string) => {
    const original = initialSubmoduleAssignments[submoduleTitle] ?? selectedModuleKey;
    handleAssignmentChange(submoduleTitle, original);
  };

  const handleResetAssignments = () => {
    setSubmoduleAssignments(initialSubmoduleAssignments);
    localStorage.removeItem('submoduleAssignments');
    setSelectedAvailableTitle(null);
    setSelectedAssignedTitle(null);
  };

  const activeModule = modules.find((mod) => mod.key === selectedModuleKey) ?? modules[0];

  // Filter to only include enabled modules' submodules
  const enabledSubmodules = useMemo(
    () => allSubmodules.filter((sub) => isModuleEnabled(sub.originModule)),
    [isModuleEnabled]
  );

  const availableSubmodules = enabledSubmodules
    .filter((sub) => submoduleAssignments[sub.title] !== activeModule.key)
    .filter((sub) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        sub.title.toLowerCase().includes(query) ||
        (modules.find((mod) => mod.key === submoduleAssignments[sub.title])?.label ?? "").toLowerCase().includes(query)
      );
    })
    .filter((sub, index, list) => list.findIndex((item) => item.title === sub.title) === index);

  const assignedSubmodules = enabledSubmodules.filter(
    (sub) => submoduleAssignments[sub.title] === activeModule.key
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Access Control</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage privilege levels and assign submodules to users and roles.
        </p>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader className="bg-slate-100 border-b border-border">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr] items-end">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">Privilege</div>
              <Select value={selectedModuleKey} onValueChange={(value) => {
                setSelectedModuleKey(value);
                setSelectedMenuKey(modules.find((mod) => mod.key === value)?.submodules[0]?.url ?? "");
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select privilege" />
                </SelectTrigger>
                <SelectContent>
                  {modules.filter(mod => isModuleEnabled(mod.key)).map((mod) => (
                    <SelectItem key={mod.key} value={mod.key}>
                      {mod.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">Menu</div>
              <Select value={selectedMenuKey} onValueChange={(value) => setSelectedMenuKey(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select menu" />
                </SelectTrigger>
                <SelectContent>
                  {activeModule.submodules.map((sub) => (
                    <SelectItem key={sub.url} value={sub.url}>
                      {sub.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-3">
            <div className="px-3 py-2 rounded-t-lg bg-slate-900 text-white text-sm font-semibold">Privilege Detail</div>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-lg border border-border bg-white p-3">
                <div className="mb-3 text-sm font-medium">Available</div>
                <div className="space-y-2 max-h-[420px] overflow-y-auto border rounded-lg border-slate-200 p-2 bg-slate-50">
                  {availableSubmodules.map((submodule) => (
                    <button
                      key={submodule.title}
                      type="button"
                      onClick={() => setSelectedAvailableTitle(submodule.title)}
                      className={`w-full text-left rounded-md px-3 py-2 text-sm ${selectedAvailableTitle === submodule.title ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
                    >
                      {submodule.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  className="h-12 w-12 rounded-full border border-border p-0"
                  onClick={assignSelected}
                  disabled={!selectedAvailableTitle}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  className="h-12 w-12 rounded-full border border-border p-0"
                  onClick={unassignSelected}
                  disabled={!selectedAssignedTitle}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </div>

              <div className="rounded-lg border border-border bg-white p-3">
                <div className="mb-3 text-sm font-medium">Remaining</div>
                <div className="space-y-2 max-h-[420px] overflow-y-auto border rounded-lg border-slate-200 p-2 bg-slate-50">
                  {assignedSubmodules.map((submodule) => (
                    <button
                      key={submodule.title}
                      type="button"
                      onClick={() => setSelectedAssignedTitle(submodule.title)}
                      className={`w-full text-left rounded-md px-3 py-2 text-sm ${selectedAssignedTitle === submodule.title ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
                    >
                      {submodule.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <Button className="w-40">Generate Menu</Button>
              <Button variant="outline" className="w-40" onClick={handleResetAssignments}>
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessControl;
