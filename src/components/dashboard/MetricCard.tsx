import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: "positive" | "negative";
}

export function MetricCard({ icon: Icon, label, value, accent }: MetricCardProps) {
  return (
    <div className="card-dashboard p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      <p className={`metric-value ${accent === "positive" ? "text-metric-positive" : accent === "negative" ? "text-metric-negative" : "text-foreground"}`}>
        {value}
      </p>
      <p className="metric-label">{label}</p>
    </div>
  );
}
