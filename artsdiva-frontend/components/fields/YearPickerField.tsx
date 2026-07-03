import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";

interface YearPickerFieldProps {
  value: number | null;
  onChange: (year: number | null) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
}

export function YearPickerField({
  value,
  onChange,
  error,
  disabled,
  label = "Year",
}: YearPickerFieldProps) {
  const dayjsValue: Dayjs | null = value ? dayjs().year(value) : null;

  return (
    <DatePicker
      label={label}
      views={["year"]}
      openTo="year"
      value={dayjsValue}
      onChange={(newVal: Dayjs | null) => onChange(newVal ? newVal.year() : null)}
      disabled={disabled}
      minDate={dayjs().year(1800)}
      maxDate={dayjs()}
      slotProps={{
        textField: {
          size: "small",
          fullWidth: true,
          error: !!error,
          helperText: error,
        },
      }}
    />
  );
}
