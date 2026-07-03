import React from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface FieldInfoProps {
  label: string;
  description: string;
  required?: boolean;
  adminOnly?: boolean;
  isAdmin?: boolean;
}

export function FieldLabel({ label, description, required, adminOnly, isAdmin }: FieldInfoProps) {
  const badge = required ? (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        ml: 0.75,
        px: 0.75,
        py: 0.1,
        borderRadius: 0.75,
        backgroundColor: "#FEF2F2",
        border: "1px solid #FECACA",
        fontSize: "0.65rem",
        fontWeight: 700,
        color: "#DC2626",
        letterSpacing: "0.04em",
        lineHeight: 1.6,
        verticalAlign: "middle",
      }}
    >
      REQ
    </Box>
  ) : (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        ml: 0.75,
        px: 0.75,
        py: 0.1,
        borderRadius: 0.75,
        backgroundColor: "#F8FAFC",
        border: "1px solid #E2E8F0",
        fontSize: "0.65rem",
        fontWeight: 600,
        color: "#94A3B8",
        letterSpacing: "0.04em",
        lineHeight: 1.6,
        verticalAlign: "middle",
      }}
    >
      OPT
    </Box>
  );

  if (adminOnly && !isAdmin) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0, mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>
          {label}
        </Typography>
        {badge}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mb: 0.5 }}>
      <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
        {label}
      </Typography>
      {badge}
      <Tooltip
        title={
          <Box sx={{ maxWidth: 240, p: 0.5 }}>
            <Typography variant="caption" sx={{ display: "block", fontWeight: 700, mb: 0.5, color: "#fff" }}>
              {label} {required ? "(required)" : "(optional)"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#CBD5E1" }}>{description}</Typography>
          </Box>
        }
        placement="top"
        arrow
      >
        <IconButton size="small" sx={{ p: 0.2, color: "#CBD5E1", ml: 0.25, "&:hover": { color: "#4F46E5", backgroundColor: "transparent" } }}>
          <Typography sx={{ fontSize: 11, lineHeight: 1 }}>ℹ</Typography>
        </IconButton>
      </Tooltip>
    </Box>
  );
}
