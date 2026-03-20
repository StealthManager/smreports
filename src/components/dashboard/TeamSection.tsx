import { userRoles } from "@/data/dashboard-data";
import { Shield, Eye, Megaphone, UserCheck } from "lucide-react";

const roleConfig: Record<string, { icon: React.ElementType; color: string; bg: string; description: string }> = {
  Admin: { icon: Shield, color: "text-primary", bg: "bg-primary/10", description: "Full access to all features and settings" },
  Closer: { icon: UserCheck, color: "text-info", bg: "bg-info/10", description: "View leads, manage pipeline, log calls" },
  "Media Buyer": { icon: Megaphone, color: "text-warning", bg: "bg-warning/10", description: "Manage ads, creatives, and UTM tracking" },
  Viewer: { icon: Eye, color: "text-muted-foreground", bg: "bg-muted", description: "Read-only access to dashboards and reports" },
};

export function TeamSection() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team & Roles</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage team members and their access levels</p>
      </div>

      {/* Role Legend */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
        {Object.entries(roleConfig).map(([role, config], i) => {
          const Icon = config.icon;
          return (
            <div key={role} className="card-dashboard p-4" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <span className="font-semibold text-sm">{role}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{config.description}</p>
            </div>
          );
        })}
      </div>

      {/* Team Members */}
      <div className="card-dashboard overflow-hidden animate-slide-up" style={{ animationDelay: "200ms" }}>
        <div className="p-6 pb-0"><h3 className="section-header">Team Members</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Member", "Role", "Access Level"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {userRoles.map((user) => {
                const config = roleConfig[user.role] || roleConfig.Viewer;
                const Icon = config.icon;
                return (
                  <tr key={user.name} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                          {user.avatar}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`status-badge ${config.bg} ${config.color}`}>
                        <Icon className="w-3 h-3" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground text-sm">{config.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
