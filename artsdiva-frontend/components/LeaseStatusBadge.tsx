import type { LeaseStatus } from "@artsdiva/types/lease.types";

const LABELS: Record<LeaseStatus, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

interface LeaseStatusBadgeProps {
  status: LeaseStatus;
}

export function LeaseStatusBadge({ status }: LeaseStatusBadgeProps) {
  return <span className="border px-1.5 py-0.5 text-xs">{LABELS[status]}</span>;
}
