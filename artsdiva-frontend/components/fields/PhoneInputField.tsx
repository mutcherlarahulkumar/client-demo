import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Typography from "@mui/material/Typography";

const COUNTRY_CODES = [
  { code: "+91",  flag: "🇮🇳", country: "India" },
  { code: "+1",   flag: "🇺🇸", country: "USA" },
  { code: "+44",  flag: "🇬🇧", country: "UK" },
  { code: "+61",  flag: "🇦🇺", country: "Australia" },
  { code: "+971", flag: "🇦🇪", country: "UAE" },
  { code: "+65",  flag: "🇸🇬", country: "Singapore" },
  { code: "+49",  flag: "🇩🇪", country: "Germany" },
  { code: "+33",  flag: "🇫🇷", country: "France" },
  { code: "+81",  flag: "🇯🇵", country: "Japan" },
  { code: "+86",  flag: "🇨🇳", country: "China" },
  { code: "+27",  flag: "🇿🇦", country: "South Africa" },
  { code: "+234", flag: "🇳🇬", country: "Nigeria" },
];

interface PhoneInputFieldProps {
  countryCode: string;
  phone: string;
  onCountryCodeChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  countryCodeError?: string;
  phoneError?: string;
  disabled?: boolean;
}

export function PhoneInputField({
  countryCode,
  phone,
  onCountryCodeChange,
  onPhoneChange,
  countryCodeError,
  phoneError,
  disabled,
}: PhoneInputFieldProps) {
  const selectedCode = countryCode || "+91";
  const found = COUNTRY_CODES.find((c) => c.code === selectedCode);

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
      <FormControl size="small" error={!!countryCodeError} sx={{ flexShrink: 0, width: 120 }}>
        <Select
          value={selectedCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          disabled={disabled}
          displayEmpty
          MenuProps={{
            PaperProps: { sx: { maxHeight: 280, minWidth: 220 } },
            anchorOrigin: { vertical: "bottom", horizontal: "left" },
            transformOrigin: { vertical: "top", horizontal: "left" },
          }}
          renderValue={() => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{found?.flag ?? "🌍"}</span>
              <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1 }}>
                {selectedCode}
              </Typography>
            </Box>
          )}
        >
          {COUNTRY_CODES.map((c) => (
            <MenuItem key={c.code} value={c.code}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                <span style={{ fontSize: "1.1rem", lineHeight: 1, flexShrink: 0 }}>{c.flag}</span>
                <Typography variant="body2" sx={{ flex: 1 }}>{c.country}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                  {c.code}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
        {countryCodeError && <FormHelperText>{countryCodeError}</FormHelperText>}
      </FormControl>

      <TextField
        fullWidth
        size="small"
        placeholder="9876543210"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        disabled={disabled}
        error={!!phoneError}
        helperText={phoneError}
        slotProps={{ htmlInput: { inputMode: "numeric" } }}
      />
    </Box>
  );
}
