import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { Activity } from "lucide-react";
import { getModuleByPath } from "@/config/modules";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const activeModule = getModuleByPath(location.pathname);

  return (
    <Sidebar collapsible="icon" className="bg-card border-r border-border">
      <SidebarHeader className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg hmis-gradient flex items-center justify-center shrink-0">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-heading text-base font-bold text-foreground">ICare</h1>
              <p className="text-[11px] text-foreground/50">Care. Connect. Cure.</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-3 bg-card">
        {activeModule ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-foreground/40 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-2">
              {!collapsed && (
                <>
                  <activeModule.icon className="h-3.5 w-3.5" />
                  {activeModule.label}
                </>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {activeModule.submodules.map((sub) => (
                  <SidebarMenuItem key={sub.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={sub.url}
                        end
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground/70 hover:bg-accent/50 hover:text-foreground transition-all duration-200 shadow-sm hover:shadow-md group"
                        activeClassName="bg-accent text-primary font-semibold shadow-md"
                      >
                        <sub.icon className="h-[18px] w-[18px] shrink-0 transition-colors duration-200 group-hover:brightness-125" />
                        {!collapsed && <span className="text-sm">{sub.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <div className="px-3 py-8 text-center text-foreground/40 text-xs">
            Select a module from the grid
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
