import { materials, type MaterialItem } from "@/data/dashboard-data";
import { useState } from "react";
import { Image, FileText, Video, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const typeIcon = { image: Image, text: FileText, video: Video };
const statusConfig = {
  pending: { label: "Pending", bg: "bg-warning/10 text-warning", icon: Clock },
  approved: { label: "Approved", bg: "bg-primary/10 text-primary", icon: Check },
  rejected: { label: "Rejected", bg: "bg-destructive/10 text-destructive", icon: X },
};

export function MaterialApprovalSection() {
  const [items, setItems] = useState<MaterialItem[]>(materials);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const filtered = filter === "all" ? items : items.filter((m) => m.status === filter);

  const handleApprove = (id: string) => {
    setItems((prev) => prev.map((m) => m.id === id ? { ...m, status: "approved" as const, reviewedBy: "You" } : m));
  };
  const handleReject = (id: string) => {
    setItems((prev) => prev.map((m) => m.id === id ? { ...m, status: "rejected" as const, reviewedBy: "You" } : m));
  };

  const pendingCount = items.filter((m) => m.status === "pending").length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Material Approval</h1>
          <p className="text-muted-foreground text-sm mt-1">Review and approve ad creatives, copy, and videos — {pendingCount} pending</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Image className="w-4 h-4" />
          Upload Material
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, i) => {
          const TypeIcon = typeIcon[item.type];
          const status = statusConfig[item.status];
          const StatusIcon = status.icon;
          return (
            <div
              key={item.id}
              className="card-dashboard p-5 flex flex-col gap-3 animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <TypeIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm leading-tight">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.channel}</p>
                  </div>
                </div>
                <span className={`status-badge ${status.bg}`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>

              <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2 border-t border-border/50">
                <span>By {item.submittedBy} · {item.submittedAt}</span>
                {item.reviewedBy && <span>Reviewed by {item.reviewedBy}</span>}
              </div>

              {item.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-1.5" onClick={() => handleApprove(item.id)}>
                    <Check className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => handleReject(item.id)}>
                    <X className="w-3.5 h-3.5" /> Reject
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
