import React from "react";
import Chip from "@mui/material/Chip";
import type { ArtworkStatus } from "@artsdiva/types/artwork.types";
import type { MouStatus } from "@artsdiva/types/artist.types";
import type { LeaseStatus } from "@artsdiva/types/lease.types";

const ARTWORK_STATUS_CONFIG: Record<ArtworkStatus, { label: string; color: string; bg: string }> = {
  IN_COLLECTION: { label: "In Collection", color: "#16A34A", bg: "#DCFCE7" },
  ON_LEASE: { label: "On Lease", color: "#1D4ED8", bg: "#DBEAFE" },
  SOLD: { label: "Sold", color: "#B45309", bg: "#FEF3C7" },
};

const MOU_STATUS_CONFIG: Record<MouStatus, { label: string; color: string; bg: string }> = {
  SIGNED: { label: "Signed", color: "#16A34A", bg: "#DCFCE7" },
  PENDING: { label: "Pending", color: "#CA8A04", bg: "#FEF9C3" },
  NOT_REQUIRED: { label: "N/A", color: "#64748B", bg: "#F1F5F9" },
};

const LEASE_STATUS_CONFIG: Record<LeaseStatus, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: "Active", color: "#1D4ED8", bg: "#DBEAFE" },
  COMPLETED: { label: "Completed", color: "#16A34A", bg: "#DCFCE7" },
  CANCELLED: { label: "Cancelled", color: "#DC2626", bg: "#FEE2E2" },
};

interface ArtworkStatusBadgeProps { type: "artwork"; status: ArtworkStatus }
interface MouStatusBadgeProps { type: "mou"; status: MouStatus }
interface LeaseStatusBadgeProps { type: "lease"; status: LeaseStatus }

type StatusBadgeProps = ArtworkStatusBadgeProps | MouStatusBadgeProps | LeaseStatusBadgeProps;

export function StatusBadge(props: StatusBadgeProps) {
  let config: { label: string; color: string; bg: string };

  if (props.type === "artwork") {
    config = ARTWORK_STATUS_CONFIG[props.status];
  } else if (props.type === "mou") {
    config = MOU_STATUS_CONFIG[props.status];
  } else {
    config = LEASE_STATUS_CONFIG[props.status];
  }

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
        fontSize: "0.7rem",
        height: 22,
        border: `1px solid ${config.color}22`,
        "& .MuiChip-label": { px: 1.25 },
      }}
    />
  );
}
