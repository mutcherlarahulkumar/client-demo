import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";
import type { Dimensions } from "@artsdiva/types/common.types";

interface DimensionsInputProps {
  value: Partial<Dimensions>;
  onChange: (val: Partial<Dimensions>) => void;
  errors?: { width?: string; height?: string; unit?: string };
  disabled?: boolean;
}

export function DimensionsInput({ value, onChange, errors, disabled }: DimensionsInputProps) {
  const update = (patch: Partial<Dimensions>) => onChange({ ...value, ...patch });

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
        <TextField
          size="small"
          label="Width"
          type="number"
          value={value.width ?? ""}
          onChange={(e) => update({ width: Number(e.target.value) || undefined })}
          error={!!errors?.width}
          helperText={errors?.width}
          disabled={disabled}
          slotProps={{ htmlInput: { min: 0.1, max: 10000, step: 0.1 } }}
          sx={{ flex: 1 }}
        />
        <Box sx={{ pt: 1.2, color: "text.disabled", flexShrink: 0 }}>
          <Typography>×</Typography>
        </Box>
        <TextField
          size="small"
          label="Height"
          type="number"
          value={value.height ?? ""}
          onChange={(e) => update({ height: Number(e.target.value) || undefined })}
          error={!!errors?.height}
          helperText={errors?.height}
          disabled={disabled}
          slotProps={{ htmlInput: { min: 0.1, max: 10000, step: 0.1 } }}
          sx={{ flex: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 72 }}>
          <Select
            value={value.unit ?? "cm"}
            onChange={(e) => update({ unit: e.target.value as Dimensions["unit"] })}
            disabled={disabled}
            error={!!errors?.unit}
          >
            <MenuItem value="cm">cm</MenuItem>
            <MenuItem value="in">in</MenuItem>
            <MenuItem value="mm">mm</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {value.width && value.height && (
        <Typography variant="caption" sx={{ color: "text.disabled", mt: 0.5, display: "block" }}>
          {value.width} × {value.height} {value.unit ?? "cm"}
        </Typography>
      )}
    </Box>
  );
}

