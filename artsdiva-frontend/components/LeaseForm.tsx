import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import Alert from "@mui/material/Alert";
import { ClientAutocomplete } from "@artsdiva/components/fields/ClientAutocomplete";
import { FieldLabel } from "@artsdiva/components/fields/FieldInfo";
import type { FieldErrors } from "@artsdiva/api/http";

export interface LeaseFormValues {
  clientId: string;
  startDate: string;
  terms: string;
}

interface LeaseFormProps {
  values: LeaseFormValues;
  artworkId: string;
  isSubmitting: boolean;
  error: string | null;
  fieldErrors: FieldErrors | null;
  onChange: <K extends keyof LeaseFormValues>(field: K, value: LeaseFormValues[K]) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

export function LeaseForm({
  values,
  artworkId,
  isSubmitting,
  error,
  fieldErrors,
  onChange,
  onSubmit,
  onCancel,
}: LeaseFormProps) {
  return (
    <Box
      component="form"
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      {error && <Alert severity="error">{error}</Alert>}

      <Box>
        <FormLabel required sx={{ display: "block", mb: 0.5, fontSize: "0.875rem" }}>Client</FormLabel>
        <ClientAutocomplete
          value={values.clientId}
          onChange={(id) => onChange("clientId", id)}
          error={fieldErrors?.clientId?.[0]}
          disabled={isSubmitting}
          redirectOnCreate={`/artworks/${artworkId}`}
        />
      </Box>

      <Box>
        <TextField
          label="Start Date"
          type="date"
          size="small"
          required
          fullWidth
          value={values.startDate}
          onChange={(e) => onChange("startDate", e.target.value)}
          error={!!fieldErrors?.startDate}
          helperText={fieldErrors?.startDate?.[0]}
          disabled={isSubmitting}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>

      <Box>
        <FieldLabel
          label="Terms"
          info="Conditions of the lease agreement. Example: 6 months, monthly fee of 200, insurance covered by client"
        />
        <TextField
          multiline
          minRows={3}
          size="small"
          fullWidth
          value={values.terms}
          onChange={(e) => onChange("terms", e.target.value)}
          disabled={isSubmitting}
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 1 }}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} disabled={isSubmitting} sx={{ minWidth: 100 }}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ minWidth: 120 }}>
          {isSubmitting ? "Saving…" : "Lease Artwork"}
        </Button>
      </Box>
    </Box>
  );
}
