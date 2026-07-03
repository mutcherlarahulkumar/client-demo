import React from "react";
import Typography from "@mui/material/Typography";
import FormLabel from "@mui/material/FormLabel";

interface FieldInfoProps {
  label: string;
  description?: string;
  required?: boolean;
  adminOnly?: boolean;
  isAdmin?: boolean;
}

export function FieldLabel({ label, required }: FieldInfoProps) {
  return (
    <FormLabel sx={{ display: "block", mb: 0.5, fontSize: "0.875rem", fontWeight: 500, color: "text.primary" }}>
      {label}
      {required && (
        <Typography component="span" sx={{ color: "error.main", ml: 0.25 }}>
          *
        </Typography>
      )}
    </FormLabel>
  );
}
