import { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  subLabel,
  tone = "neutral",
  icon: Icon,
}: {
  label: string;
  value: string | number;
  subLabel?: string;
  tone?: "neutral" | "success" | "warning" | "danger";
  icon?: LucideIcon;
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-destructive"
          : "text-foreground";

  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm min-h-[132px]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground/70" /> : null}
      </div>
      <p className={`mt-3 text-3xl font-semibold ${toneClass}`}>{value}</p>
      {subLabel ? <p className="mt-1 text-xs text-muted-foreground">{subLabel}</p> : null}
    </div>
  );
}
