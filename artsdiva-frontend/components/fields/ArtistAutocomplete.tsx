import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import { getArtists, getArtistById } from "@artsdiva/api/artist.api";
import type { Artist } from "@artsdiva/types/artist.types";

interface ArtistAutocompleteProps {
  value: string;
  onChange: (artistId: string) => void;
  error?: string;
  disabled?: boolean;
  redirectOnCreate?: string;
}

const CREATE_OPTION: Artist = {
  id: "__create__",
  name: "__create__",
  commissionTerms: "",
  mouStatus: "PENDING",
  createdAt: "",
  updatedAt: "",
};

export function ArtistAutocomplete({
  value,
  onChange,
  error,
  disabled,
  redirectOnCreate,
}: ArtistAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["artists-autocomplete", inputValue],
    queryFn: () => getArtists({ search: inputValue, limit: 30 }),
    staleTime: 10_000,
  });

  // When a value (ID) is pre-filled but not in the search results, fetch by ID
  const { data: prefilledArtist } = useQuery({
    queryKey: ["artist-prefill", value],
    queryFn: () => getArtistById(value),
    enabled: !!value && value !== "__create__",
    staleTime: 60_000,
  });

  const artists = data?.data ?? [];

  // Merge the prefilled artist into options if not already present
  const allOptions: Artist[] = prefilledArtist && !artists.find((a) => a.id === prefilledArtist.id)
    ? [prefilledArtist, ...artists]
    : artists;

  const selectedArtist = allOptions.find((a) => a.id === value) ?? null;

  const handleCreateNew = () => {
    const params = new URLSearchParams();
    if (redirectOnCreate) params.set("redirectTo", redirectOnCreate);
    // Carry the typed name over so the create form starts pre-filled with it.
    if (inputValue.trim()) params.set("name", inputValue.trim());
    window.location.href = `/artists/new?${params.toString()}`;
  };

  return (
    <Autocomplete
      options={[...allOptions, CREATE_OPTION]}
      getOptionLabel={(opt: Artist) => opt.id === "__create__" ? "" : opt.name}
      value={selectedArtist}
      inputValue={inputValue}
      onInputChange={(_, val, reason) => {
        // "reset" fires when MUI syncs the input to the selected option's
        // label (on select / prefill). Accept it so the chosen artist's name
        // actually appears in the field; only ignore resets to empty while a
        // value is selected (prevents flicker during option reloads).
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
      filterOptions={(opts) => opts} // server-side filtering
      isOptionEqualToValue={(opt, val) => opt.id === val.id}
      renderOption={(props, option) => {
        if (option.id === "__create__") {
          return (
            <Box component="li" {...props} key="__create__"
              sx={{ borderTop: "1px solid", borderColor: "divider", color: "primary.main", fontWeight: 600, py: 1 }}
            >
              + Create new artist {inputValue ? `"${inputValue}"` : ""}
            </Box>
          );
        }
        return (
          <Box component="li" {...props} key={option.id}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{option.name}</Typography>
              <Typography variant="caption" color="text.secondary">{option.commissionTerms}</Typography>
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
            placeholder="Search artist..."
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
