import React from "react";
import Typography from "@mui/material/Typography";
import FormLabel from "@mui/material/FormLabel";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface FieldInfoProps {
  label: string;
  /** Shown in a tooltip behind an info icon — use for fields whose purpose
   *  isn't obvious from the label alone. Include an example. */
  info?: string;
  required?: boolean;
}

export function FieldLabel({ label, info, required }: FieldInfoProps) {
  return (
    <FormLabel
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        mb: 0.5,
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "text.primary",
      }}
    >
      {label}
      {required && (
        <Typography component="span" sx={{ color: "error.main" }}>
          *
        </Typography>
      )}
      {info && (
        <Tooltip title={info} arrow placement="top">
          <InfoOutlinedIcon
            sx={{ fontSize: 15, color: "text.disabled", cursor: "help" }}
          />
        </Tooltip>
      )}
    </FormLabel>
  );
}
