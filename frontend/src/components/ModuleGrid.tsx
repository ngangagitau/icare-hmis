import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { modules } from "@/config/modules";
import { useModules } from "@/contexts/ModuleContext";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface ModuleGridProps {
  onClose: () => void;
}

export function ModuleGrid({ onClose }: ModuleGridProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { isModuleEnabled } = useModules();

  const filteredModules = useMemo(() => {
    // Filter out disabled modules first
    const enabledModulesOnly = modules.filter(mod => isModuleEnabled(mod.key));
    
    if (!searchQuery.trim()) return enabledModulesOnly;
    
    const query = searchQuery.toLowerCase();
    return enabledModulesOnly.filter(
      (mod) =>
        mod.label.toLowerCase().includes(query) ||
        mod.key.toLowerCase().includes(query) ||
        mod.submodules.some(
          (sub) =>
            sub.title.toLowerCase().includes(query) ||
            sub.url.toLowerCase().includes(query)
        )
    );
  }, [searchQuery, isModuleEnabled]);

  return (
    <div className="space-y-4 p-3 sm:p-4">
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

      {filteredModules.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No modules found matching "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
          {filteredModules.map((mod) => (
        <button
          key={mod.key}
          onClick={() => {
            navigate(mod.basePath);
            onClose();
          }}
          className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border shadow-sm hover:shadow-xl hover:border-primary/50 hover:scale-105 active:scale-95 transition-all duration-200 group relative overflow-hidden"
        >
          {/* Gradient background - static */}
          <div 
            className="absolute inset-0 -z-0"
            style={{ 
              background: `linear-gradient(135deg, hsl(${mod.color} / 0.12) 0%, hsl(${mod.color} / 0.04) 50%, hsl(${mod.color} / 0.08) 100%)`
            }}
          />
          {/* Primary accent gradient overlay - static */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent -z-0" />
          
          <div
            className="h-10 w-10 rounded-md flex items-center justify-center transition-all duration-200 group-hover:scale-110 relative z-10"
            style={{ backgroundColor: `hsl(${mod.color} / 0.15)` }}
          >
            <mod.icon
              className="h-5 w-5 transition-all duration-200 group-hover:brightness-125"
              style={{ color: `hsl(${mod.color})` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-foreground/75 text-center leading-tight group-hover:text-foreground transition-colors duration-200 relative z-10">
            {mod.label}
          </span>
        </button>
      ))}
        </div>
      )}
    </div>
  );
}
