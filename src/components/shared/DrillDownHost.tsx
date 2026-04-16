"use client";

import { useEffect, useState } from "react";
import { Check, ChevronRight, ClipboardCopy, Mail, RotateCcw } from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DrillDownPanel } from "@/components/shared/DrillDownPanel";
import { CardStatusBadge, VacancyBadge } from "@/components/CommandCentre";
import { getBuGapGroups, getPipelineStageRows, getPositionActionSignal, getPositionsByTier, getStudioGroups } from "@/lib/dashboard";
import { useCopData } from "@/hooks/useCopData";
import { useContractors } from "@/hooks/useContractors";
import { useDrillDown } from "@/components/shared/DrillDownContext";
import type { Contractor, Position } from "@/types/cop";

const ACK_STORAGE_KEY = "position-navigator:acknowledged-signals";

/**
 * Parses "MM.YY" format (e.g. "10.23") into a readable label and an overdue flag.
 * Returns null if the format is unrecognised.
 */
function parseTargetStart(raw: string): { label: string; isOverdue: boolean } | null {
  const match = raw.trim().match(/^(\d{1,2})\.(\d{2})$/);
  if (!match) return null;
  const month = parseInt(match[1], 10);
  const year = 2000 + parseInt(match[2], 10);
  if (month < 1 || month > 12) return null;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const label = `${months[month - 1]} ${year}`;
  const targetDate = new Date(year, month - 1, 1);
  const isOverdue = targetDate < new Date();
  return { label, isOverdue };
}

const STAGE_LABELS: Record<string, string> = {
  tg: "Talent Gate",
  trial: "Trial",
  contract: "Contract",
  onboard: "Onboarding",
  backlog: "Backlog",
};

export function DrillDownHost() {
  const { state, previousState, closeDrillDown, openDrillDown, goBack } = useDrillDown();
  const { data: copData } = useCopData();
  const { data: contractorData } = useContractors();

  if (!state.isOpen || !state.type || !state.id || !copData || !contractorData) {
    return null;
  }

  const positions = copData.positions;
  const contractors = contractorData.contractors;

  if (state.type === "position") {
    const idx = positions.findIndex((item) => item.id === state.id);
    const position = positions[idx];
    if (!position) return null;

    const prevPos = idx > 0 ? positions[idx - 1] : undefined;
    const nextPos = idx < positions.length - 1 ? positions[idx + 1] : undefined;

    // E7: was this position opened from a stage panel?
    const fromStage = previousState?.type === "stage" ? previousState.id : null;

    return (
      <PositionDrillDown
        position={position}
        onClose={closeDrillDown}
        onPrev={prevPos ? () => openDrillDown("position", prevPos.id) : undefined}
        onNext={nextPos ? () => openDrillDown("position", nextPos.id) : undefined}
        prevLabel={prevPos?.name}
        nextLabel={nextPos?.name}
        onBack={fromStage ? goBack : undefined}
        backLabel={fromStage ? `Back to ${STAGE_LABELS[fromStage] ?? fromStage}` : undefined}
      />
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
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">{row.count}</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
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
                    <div className="flex items-center gap-2">
                      <VacancyBadge status={position.vacancyStatus} />
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </div>
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
              className="flex items-center justify-between rounded-2xl border border-border p-4 text-left hover:bg-muted/20"
            >
              <div>
                <p className="text-sm font-medium">{position.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">{position.studio}</Badge>
                  <VacancyBadge status={position.vacancyStatus} />
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </DrillDownPanel>
    );
  }

  if (state.type === "contractor") {
    const idx = contractors.findIndex((item) => item.id === state.id);
    const contractor = contractors[idx];
    if (!contractor) return null;

    const prevC = idx > 0 ? contractors[idx - 1] : undefined;
    const nextC = idx < contractors.length - 1 ? contractors[idx + 1] : undefined;

    return (
      <ContractorDrillDown
        contractor={contractor}
        onClose={closeDrillDown}
        onPrev={prevC ? () => openDrillDown("contractor", prevC.id) : undefined}
        onNext={nextC ? () => openDrillDown("contractor", nextC.id) : undefined}
        prevLabel={prevC?.name}
        nextLabel={nextC?.name}
      />
    );
  }

  return null;
}

interface PositionDrillDownProps {
  position: Position;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  onBack?: () => void;
  backLabel?: string;
}

function PositionDrillDown({ position, onClose, onPrev, onNext, prevLabel, nextLabel, onBack, backLabel }: PositionDrillDownProps) {
  const signal = getPositionActionSignal(position);
  const ackKey = `${ACK_STORAGE_KEY}:${position.id}`;

  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    try {
      setAcknowledged(localStorage.getItem(ackKey) === "true");
    } catch {
      setAcknowledged(false);
    }
  }, [ackKey]);

  function handleCopy() {
    const text = `[${position.name}] ${signal}`;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleAcknowledge() {
    try { localStorage.setItem(ackKey, "true"); } catch { /* noop */ }
    setAcknowledged(true);
  }

  function handleUnacknowledge() {
    try { localStorage.removeItem(ackKey); } catch { /* noop */ }
    setAcknowledged(false);
  }

  const maxStage = Math.max(position.pipeline.total, 1);
  const stageRows = [
    ["Talent Gate", position.pipeline.tg, "bg-blue-500"],
    ["Trial", position.pipeline.trial, "bg-sky-400"],
    ["Contract", position.pipeline.contract, "bg-indigo-700"],
    ["Onboarding", position.pipeline.onboard, "bg-emerald-500"],
    ["Backlog", position.pipeline.backlog, "bg-slate-400"],
  ] as const;

  const mailtoHref = `mailto:?subject=Action Required: ${encodeURIComponent(position.name)}&body=${encodeURIComponent(
    `Position: ${position.name}\nStudio: ${position.studio}\nBU / Tower: ${position.buTower}\n\nAction Signal:\n${signal}\n\nPlan FYE: ${position.planFYE} | Actual YTD: ${position.actualYTD} | Gap: ${position.planFYE - position.actualYTD}`
  )}`;

  return (
    <DrillDownPanel
      isOpen
      onClose={onClose}
      title={position.name}
      subtitle={position.buTower}
      badges={
        <>
          <Badge variant="outline">{position.studio}</Badge>
          <VacancyBadge status={position.vacancyStatus} />
          <CardStatusBadge status={position.cardStatus} />
        </>
      }
      onPrev={onPrev}
      onNext={onNext}
      prevLabel={prevLabel}
      nextLabel={nextLabel}
      onBack={onBack}
      backLabel={backLabel}
    >
      <div className="space-y-6">
        <section className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-muted/20 p-4 text-sm">
          <StatWithTooltip label="Plan FYE" value={position.planFYE} tooltip="Full-year headcount target for this position (end of FY2026)." />
          <Stat label="Actual YTD" value={position.actualYTD} />
          <Stat label="Gap" value={position.planFYE - position.actualYTD} />
          <StatWithTooltip label="Plan YTD" value={position.planYTD} tooltip="The headcount target expected to be achieved by this point in the year, based on a straight-line phasing of Plan FYE." />
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

        <section
          className={`rounded-2xl border p-4 ${
            acknowledged ? "border-emerald-200 bg-emerald-50" : "border-border bg-primary/5"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-xs uppercase tracking-[0.16em] ${acknowledged ? "text-emerald-600" : "text-muted-foreground"}`}>
              Action Signal
            </p>
            {acknowledged && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <Check className="h-3 w-3" />
                Acknowledged
              </span>
            )}
          </div>
          <p className={`mt-2 text-sm font-medium ${acknowledged ? "text-emerald-800" : ""}`}>{signal}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted/30"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={mailtoHref}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted/30"
            >
              <Mail className="h-3.5 w-3.5" />
              Email signal
            </a>
            {acknowledged ? (
              <button
                onClick={handleUnacknowledge}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted/30"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Undo
              </button>
            ) : (
              <button
                onClick={handleAcknowledge}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
              >
                <Check className="h-3.5 w-3.5" />
                Mark actioned
              </button>
            )}
          </div>
        </section>
      </div>
    </DrillDownPanel>
  );
}

interface ContractorDrillDownProps {
  contractor: Contractor;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
}

function ContractorDrillDown({ contractor, onClose, onPrev, onNext, prevLabel, nextLabel }: ContractorDrillDownProps) {
  return (
    <DrillDownPanel
      isOpen
      onClose={onClose}
      title={contractor.name}
      subtitle={`Initiative: ${contractor.initiative}`}
      badges={
        <>
          <Badge variant="destructive">{contractor.priority}</Badge>
          <Badge variant="outline">{contractor.status}</Badge>
        </>
      }
      onPrev={onPrev}
      onNext={onNext}
      prevLabel={prevLabel}
      nextLabel={nextLabel}
    >
      <div className="space-y-6 text-sm">
        <section className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2">
          <InfoRow label="Location" value={contractor.location} />
          <InfoRow label="Duration" value={contractor.duration} />
          <TargetStartRow raw={contractor.targetStart} />
          <InfoRow label="SFIA Level" value={contractor.sfiaLevel} />
          <InfoRow label="Min experience" value={`${contractor.minYears} years`} />
          {contractor.taskBacklog && <InfoRow label="Task Backlog" value={contractor.taskBacklog} />}
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

function TargetStartRow({ raw }: { raw: string }) {
  const parsed = raw ? parseTargetStart(raw) : null;
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Target Start</p>
      {parsed ? (
        <div className="mt-1 flex items-center gap-2">
          <p className="leading-6 text-foreground">{parsed.label}</p>
          {parsed.isOverdue && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
              Overdue
            </span>
          )}
        </div>
      ) : (
        <p className="mt-1 leading-6 text-foreground">{raw || "-"}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function StatWithTooltip({ label, value, tooltip }: { label: string; value: string | number; tooltip: string }) {
  return (
    <div>
      <UITooltip>
        <TooltipTrigger asChild>
          <p className="cursor-help text-[11px] uppercase tracking-[0.16em] text-muted-foreground underline decoration-dotted underline-offset-2">
            {label}
          </p>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] text-xs">{tooltip}</TooltipContent>
      </UITooltip>
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
