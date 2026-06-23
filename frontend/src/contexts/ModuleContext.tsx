import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { modules } from '@/config/modules';

interface ModuleContextType {
  enabledModules: Set<string>;
  toggleModule: (moduleKey: string) => void;
  isModuleEnabled: (moduleKey: string) => boolean;
  enableAllModules: () => void;
  disableAllModules: () => void;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

const STORAGE_KEY = 'enabledModules';

export function ModuleProvider({ children }: { children: ReactNode }) {
  const [enabledModules, setEnabledModules] = useState<Set<string>>(() => {
    // Initialize from localStorage if available, otherwise enable all modules
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedSet = new Set(JSON.parse(stored));
        // Ensure any new modules in config are also enabled
        const allModuleKeys = new Set(modules.map(mod => mod.key));
        return new Set([...storedSet, ...allModuleKeys]);
      }
    } catch (error) {
      console.error('Failed to load enabled modules from storage:', error);
    }
    return new Set(modules.map(mod => mod.key));
  });

  // Persist to localStorage whenever enabledModules changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(enabledModules)));
    } catch (error) {
      console.error('Failed to save enabled modules to storage:', error);
    }
  }, [enabledModules]);

  const toggleModule = (moduleKey: string) => {
    setEnabledModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleKey)) {
        newSet.delete(moduleKey);
      } else {
        newSet.add(moduleKey);
      }
      return newSet;
    });
  };

  const isModuleEnabled = (moduleKey: string) => {
    return enabledModules.has(moduleKey);
  };

  const enableAllModules = () => {
    setEnabledModules(new Set(modules.map(mod => mod.key)));
  };

  const disableAllModules = () => {
    setEnabledModules(new Set());
  };

  return (
    <ModuleContext.Provider
      value={{
        enabledModules,
        toggleModule,
        isModuleEnabled,
        enableAllModules,
        disableAllModules,
      }}
    >
      {children}
    </ModuleContext.Provider>
  );
}

export function useModules() {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModules must be used within a ModuleProvider');
  }
  return context;
}
