"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DrillDownPanel } from "@/components/shared/DrillDownPanel";
import { CardStatusBadge, VacancyBadge } from "@/components/CommandCentre";
import { getBuGapGroups, getPipelineStageRows, getPositionActionSignal, getPositionsByTier, getStudioGroups } from "@/lib/dashboard";
import { useCopData } from "@/hooks/useCopData";
import { useContractors } from "@/hooks/useContractors";
import { useDrillDown } from "@/components/shared/DrillDownContext";
import type { Position } from "@/types/cop";

const STAGE_LABELS: Record<string, string> = {
  tg: "Talent Gate",
  trial: "Trial",
  contract: "Contract",
  onboard: "Onboarding",
  backlog: "Backlog",
};

export function DrillDownHost() {
  const { state, closeDrillDown, openDrillDown } = useDrillDown();
  const { data: copData } = useCopData();
  const { data: contractorData } = useContractors();

  if (!state.isOpen || !state.type || !state.id || !copData || !contractorData) {
    return null;
  }

  const positions = copData.positions;
  const contractors = contractorData.contractors;

  if (state.type === "position") {
    const position = positions.find((item) => item.id === state.id);
    if (!position) return null;

    const maxStage = Math.max(position.pipeline.total, 1);
    const stageRows = [
      ["Talent Gate", position.pipeline.tg, "bg-blue-500"],
      ["Trial", position.pipeline.trial, "bg-sky-400"],
      ["Contract", position.pipeline.contract, "bg-indigo-700"],
      ["Onboarding", position.pipeline.onboard, "bg-emerald-500"],
      ["Backlog", position.pipeline.backlog, "bg-slate-400"],
    ] as const;

    return (
      <DrillDownPanel
        isOpen
        onClose={closeDrillDown}
        title={position.name}
        subtitle={position.buTower}
        badges={
          <>
            <Badge variant="outline">{position.studio}</Badge>
            <VacancyBadge status={position.vacancyStatus} />
            <CardStatusBadge status={position.cardStatus} />
          </>
        }
      >
        <div className="space-y-6">
          <section className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-muted/20 p-4 text-sm">
            <Stat label="Plan FYE" value={position.planFYE} />
            <Stat label="Actual YTD" value={position.actualYTD} />
            <Stat label="Gap" value={position.planFYE - position.actualYTD} />
            <Stat label="Plan YTD" value={position.planYTD} />
            <Stat label="Prior Actual" value={position.actualPrior} />
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Pipeline Breakdown</h3>
            {stageRows.map(([label, value, tone]) => (
              <div key={label} className="grid grid-cols-[96px_1fr_40px] items-center gap-3 text-sm">
                <span className="text-muted-foreground">{label}</span>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${tone}`} style={{ width: `${(value / maxStage) * 100}%` }} />
                </div>
                <span className="text-right font-medium">{value}</span>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{position.pipeline.total}</span>
            </div>
          </section>

          <details className="rounded-2xl border border-border bg-card p-4">
            <summary className="cursor-pointer text-sm font-semibold">Role Profile</summary>
            <div className="mt-4 space-y-3 text-sm">
              <InfoRow label="Persona" value={position.persona} />
              <InfoRow label="Behavioural values" value={position.behaviouralValues} />
              <InfoRow label="Technical skills" value={position.technicalSkills} />
              <InfoRow label="Min experience" value={position.minExperience} />
              <InfoRow label="Hiring strategy" value={position.hiringStrategy} />
            </div>
          </details>

          <section className="rounded-2xl border border-border bg-primary/5 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Action Signal</p>
            <p className="mt-2 text-sm font-medium">{getPositionActionSignal(position)}</p>
          </section>
        </div>
      </DrillDownPanel>
    );
  }

  if (state.type === "stage") {
    const stageKey = state.id as keyof Position["pipeline"];
    const rows = getPipelineStageRows(positions, stageKey);
    return (
      <DrillDownPanel
        isOpen
        onClose={closeDrillDown}
        title={`${STAGE_LABELS[stageKey] || stageKey} (${rows.reduce((sum, row) => sum + row.count, 0)} candidates)`}
      >
        <div className="space-y-3">
          {rows.map((row) => (
            <button
              key={row.id}
              onClick={() => openDrillDown("position", row.id)}
              className="flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3 text-left hover:bg-muted/30"
            >
              <div>
                <p className="text-sm font-medium">{row.name}</p>
                <p className="text-xs text-muted-foreground">{row.studio}</p>
              </div>
              <span className="text-sm font-semibold text-primary">{row.count}</span>
            </button>
          ))}
        </div>
      </DrillDownPanel>
    );
  }

  if (state.type === "studio") {
    const group = getStudioGroups(positions).find((item) => item.studio === state.id);
    if (!group) return null;
    const tiers = getPositionsByTier(group.positions).filter((item) => item.positions.length > 0);

    return (
      <DrillDownPanel
        isOpen
        onClose={closeDrillDown}
        title={group.studio}
        subtitle={`${group.actual}/${group.plan} heads`}
      >
        <div className="space-y-5">
          {tiers.map((tier) => (
            <section key={tier.tier}>
              <h3 className="mb-3 text-sm font-semibold">{tier.label}</h3>
              <div className="space-y-2">
                {tier.positions.map((position) => (
                  <button
                    key={position.id}
                    onClick={() => openDrillDown("position", position.id)}
                    className="flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3 text-left hover:bg-muted/30"
                  >
                    <div>
                      <p className="text-sm font-medium">{position.name}</p>
                      <p className="text-xs text-muted-foreground">{position.buTower}</p>
                    </div>
                    <VacancyBadge status={position.vacancyStatus} />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </DrillDownPanel>
    );
  }

  if (state.type === "bu") {
    const group = getBuGapGroups(positions).find((item) => item.buTower === state.id);
    if (!group) return null;

    return (
      <DrillDownPanel
        isOpen
        onClose={closeDrillDown}
        title={group.buTower}
        subtitle={`Plan: ${group.plan}  Actual: ${group.actual}  Gap: ${group.gap}`}
      >
        <div className="grid gap-3">
          {group.positions.map((position) => (
            <button
              key={position.id}
              onClick={() => openDrillDown("position", position.id)}
              className="rounded-2xl border border-border p-4 text-left hover:bg-muted/20"
            >
              <p className="text-sm font-medium">{position.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">{position.studio}</Badge>
                <VacancyBadge status={position.vacancyStatus} />
              </div>
            </button>
          ))}
        </div>
      </DrillDownPanel>
    );
  }

  if (state.type === "contractor") {
    const contractor = contractors.find((item) => item.id === state.id);
    if (!contractor) return null;

    return (
      <DrillDownPanel
        isOpen
        onClose={closeDrillDown}
        title={contractor.name}
        subtitle={`Initiative: ${contractor.initiative}`}
        badges={
          <>
            <Badge variant="destructive">{contractor.priority}</Badge>
            <Badge variant="outline">{contractor.status}</Badge>
          </>
        }
      >
        <div className="space-y-6 text-sm">
          <section className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2">
            <InfoRow label="Location" value={contractor.location} />
            <InfoRow label="Duration" value={contractor.duration} />
            <InfoRow label="Target start" value={contractor.targetStart} />
            <InfoRow label="SFIA Level" value={contractor.sfiaLevel} />
            <InfoRow label="Min experience" value={`${contractor.minYears} years`} />
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Competencies</h3>
            <InfoRow label="Behavioural" value={contractor.behaviouralCompetencies} />
            <InfoRow label="Technical" value={contractor.technicalCompetencies} />
            <InfoRow label="Services" value={contractor.serviceCompetencies} />
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Ownership</h3>
            <InfoRow label="Requisition" value={contractor.ownerRequisition} />
            <InfoRow label="Sourcing" value={contractor.ownerSourcing} />
            <InfoRow label="Onboarding" value={contractor.ownerOnboarding} />
          </section>
        </div>
      </DrillDownPanel>
    );
  }

  return null;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 leading-6 text-foreground">{value || "-"}</p>
    </div>
  );
}
