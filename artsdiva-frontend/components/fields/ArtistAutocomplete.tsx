import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { getArtists } from "@artsdiva/api/artist.api";
import type { Artist } from "@artsdiva/types/artist.types";

interface ArtistAutocompleteProps {
  value: string;
  onChange: (artistId: string) => void;
  error?: string;
  disabled?: boolean;
  redirectOnCreate?: string;
}

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
    queryFn: () => getArtists({ search: inputValue, limit: 20 }),
    staleTime: 10_000,
  });

  const artists = data?.data ?? [];
  const selectedArtist = artists.find((a) => a.id === value) ?? null;

  const handleCreateNew = () => {
    const params = new URLSearchParams();
    if (redirectOnCreate) {
      params.set("redirectTo", redirectOnCreate);
    }
    window.location.href = `/artists/new?${params.toString()}`;
  };

  return (
    <Autocomplete
      options={artists}
      getOptionLabel={(opt: Artist) => opt.name}
      value={selectedArtist}
      inputValue={inputValue}
      onInputChange={(_, val) => setInputValue(val)}
      onChange={(_, opt) => onChange(opt?.id ?? "")}
      disabled={disabled}
      loading={isLoading}
      filterOptions={(x) => x}
      isOptionEqualToValue={(opt, val) => opt.id === val.id}
      noOptionsText={
        <Box>
          <Typography variant="body2" sx={{ color: "#94A3B8", mb: 1 }}>
            No artists found for &ldquo;{inputValue}&rdquo;
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Box
            onClick={handleCreateNew}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              color: "#4F46E5",
              fontWeight: 600,
              fontSize: "0.875rem",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            <Typography>+</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#4F46E5" }}>
              Create new artist &ldquo;{inputValue}&rdquo;
            </Typography>
          </Box>
        </Box>
      }
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {option.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "#94A3B8" }}>
              {option.commissionTerms}
            </Typography>
          </Box>
        </li>
      )}
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
