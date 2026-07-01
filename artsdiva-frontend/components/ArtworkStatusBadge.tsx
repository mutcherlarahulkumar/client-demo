import type { ArtworkStatus } from "@artsdiva/types/artwork.types";

const LABELS: Record<ArtworkStatus, string> = {
  IN_COLLECTION: "In collection",
  ON_LEASE: "On lease",
  SOLD: "Sold",
};

interface ArtworkStatusBadgeProps {
  status: ArtworkStatus;
}

export function ArtworkStatusBadge({ status }: ArtworkStatusBadgeProps) {
  return <span className="border px-1.5 py-0.5 text-xs">{LABELS[status]}</span>;
}
