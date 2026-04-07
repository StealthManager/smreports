import { BarChart3, Users, Megaphone, FileCheck, Link2, UserCog, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { useState } from "react";

type Section = "overview" | "leads" | "ads" | "materials" | "integrations" | "team" | "settings";

interface DashboardSidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "leads", label: "Lead Quality", icon: Users },
  { id: "ads", label: "Ad Performance", icon: Megaphone },
  { id: "materials", label: "Material Approval", icon: FileCheck },
  { id: "integrations", label: "Integrations", icon: Link2 },
  { id: "team", label: "Team & Roles", icon: UserCog },
  { id: "settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({ activeSection, onSectionChange }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`sticky top-0 h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm shrink-0">
          S
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-sidebar-accent-foreground truncate">Stealth Agency</p>
            <p className="text-[11px] text-sidebar-muted truncate">Ad Management</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-2 mb-4 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
      </button>
    </aside>
  );
}
