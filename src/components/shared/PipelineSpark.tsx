import { GitBranch } from "lucide-react";
import type { PipelineStages } from "@/types/cop";

export function PipelineSpark({ pipeline }: { pipeline: PipelineStages }) {
  const segments = [
    { key: "tg", value: pipeline.tg, className: "bg-sky-500" },
    { key: "trial", value: pipeline.trial, className: "bg-blue-400" },
    { key: "contract", value: pipeline.contract, className: "bg-indigo-500" },
    { key: "onboard", value: pipeline.onboard, className: "bg-teal-500" },
  ];

  if (pipeline.total === 0) {
    // F7: icon badge instead of repeated inline text
    return (
      <div className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-600 w-fit">
        <GitBranch className="h-3 w-3 shrink-0" />
        No pipeline
      </div>
    );
  }

  return (
    <div className="flex h-2 overflow-hidden rounded-full bg-muted">
      {segments.map((segment) =>
        segment.value > 0 ? (
          <div
            key={segment.key}
            className={segment.className}
            style={{ width: `${(segment.value / pipeline.total) * 100}%` }}
          />
        ) : null
      )}
    </div>
  );
}
