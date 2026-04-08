import type { PipelineStages } from "@/types/cop";

export function PipelineSpark({ pipeline }: { pipeline: PipelineStages }) {
  const segments = [
    { key: "tg", value: pipeline.tg, className: "bg-sky-500" },
    { key: "trial", value: pipeline.trial, className: "bg-blue-400" },
    { key: "contract", value: pipeline.contract, className: "bg-indigo-500" },
    { key: "onboard", value: pipeline.onboard, className: "bg-teal-500" },
  ];

  if (pipeline.total === 0) {
    return <p className="text-xs font-medium text-destructive">No pipeline</p>;
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
