import type { Position, UrgencyTier } from "@/types/cop";

export function computeUrgencyTier(position: Omit<Position, "urgencyTier">): UrgencyTier {
  const isVacant =
    position.vacancyStatus === "Vacant (All)" || position.vacancyStatus === "Vacant (Some)";
  const noPipeline = position.pipeline.total === 0;
  const highGap = position.headcountGap <= -4;

  if (isVacant && noPipeline) return "critical";
  if (position.vacancyStatus === "Vacant (All)") return "critical";
  if (isVacant && (position.pipeline.tg > 0 || highGap)) return "attention";
  if (position.vacancyStatus === "Filled" && highGap) return "attention";

  return "healthy";
}
