import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { getClients, getClientById } from "@artsdiva/api/client.api";
import type { Client } from "@artsdiva/types/client.types";

interface ClientAutocompleteProps {
  value: string;
  onChange: (clientId: string) => void;
  error?: string;
  disabled?: boolean;
  redirectOnCreate?: string;
}

const CREATE_OPTION: Client = {
  id: "__create__",
  name: "__create__",
  createdAt: "",
  updatedAt: "",
};

export function ClientAutocomplete({
  value,
  onChange,
  error,
  disabled,
  redirectOnCreate,
}: ClientAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["clients-autocomplete", inputValue],
    queryFn: () => getClients({ search: inputValue, limit: 30 }),
    staleTime: 10_000,
  });

  const { data: prefilledClient } = useQuery({
    queryKey: ["client-prefill", value],
    queryFn: () => getClientById(value),
    enabled: !!value && value !== "__create__",
    staleTime: 60_000,
  });

  const clients = data?.data ?? [];

  const allOptions: Client[] =
    prefilledClient && !clients.find((c) => c.id === prefilledClient.id)
      ? [prefilledClient, ...clients]
      : clients;

  const selectedClient = allOptions.find((c) => c.id === value) ?? null;

  const handleCreateNew = () => {
    const params = new URLSearchParams();
    if (redirectOnCreate) params.set("redirectTo", redirectOnCreate);
    if (inputValue.trim()) params.set("name", inputValue.trim());
    window.location.href = `/clients/new?${params.toString()}`;
  };

  return (
    <Autocomplete
      options={[...allOptions, CREATE_OPTION]}
      getOptionLabel={(opt: Client) => (opt.id === "__create__" ? "" : opt.name)}
      value={selectedClient}
      inputValue={inputValue}
      onInputChange={(_, val, reason) => {
        if (reason === "reset" && val === "" && value) return;
        setInputValue(val);
      }}
      onChange={(_, opt) => {
        if (!opt) { onChange(""); return; }
        if (opt.id === "__create__") { handleCreateNew(); return; }
        onChange(opt.id);
      }}
      disabled={disabled}
      loading={isLoading}
      filterOptions={(opts) => opts}
      isOptionEqualToValue={(opt, val) => opt.id === val.id}
      renderOption={(props, option) => {
        if (option.id === "__create__") {
          return (
            <Box
              component="li"
              {...props}
              key="__create__"
              sx={{ borderTop: "1px solid", borderColor: "divider", color: "primary.main", fontWeight: 600, py: 1 }}
            >
              + Create new client {inputValue ? `"${inputValue}"` : ""}
            </Box>
          );
        }
        return (
          <Box component="li" {...props} key={option.id}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{option.name}</Typography>
              {option.contactInfo?.email && (
                <Typography variant="caption" color="text.secondary">{option.contactInfo.email}</Typography>
              )}
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = params as any;
        return (
          <TextField
            {...params}
            size="small"
            placeholder="Search client..."
            error={!!error}
            helperText={error}
            slotProps={{
              input: {
                ...p.InputProps,
                endAdornment: (
                  <>
                    {isLoading && <CircularProgress size={16} />}
                    {p.InputProps?.endAdornment}
                  </>
                ),
              },
              htmlInput: p.inputProps,
            }}
          />
        );
      }}
    />
  );
}
