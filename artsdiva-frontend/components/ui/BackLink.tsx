import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface BackLinkProps {
  href: string;
  label: string;
}

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          mb: 0.5,
          color: "text.secondary",
          cursor: "pointer",
          "&:hover": { color: "primary.main" },
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 16 }} />
        <Typography variant="body2">{label}</Typography>
      </Box>
    </Link>
  );
}
