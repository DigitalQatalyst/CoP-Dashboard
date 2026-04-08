import { AlertTriangle, Info, Siren } from "lucide-react";
import type { DashboardAlert } from "@/lib/dashboard";

export function AlertBanner({ alert }: { alert: DashboardAlert }) {
  const icon =
    alert.severity === "critical" ? (
      <Siren className="h-4 w-4" />
    ) : alert.severity === "warning" ? (
      <AlertTriangle className="h-4 w-4" />
    ) : (
      <Info className="h-4 w-4" />
    );

  const style =
    alert.severity === "critical"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : alert.severity === "warning"
        ? "border-warning/30 bg-warning/10 text-warning"
        : "border-primary/20 bg-primary/10 text-primary";

  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${style}`}>
      <div className="mt-0.5">{icon}</div>
      <p className="text-sm font-medium leading-5">{alert.message}</p>
    </div>
  );
}
