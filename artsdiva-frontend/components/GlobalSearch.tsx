import React, { useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import PaletteIcon from "@mui/icons-material/Palette";
import ImageIcon from "@mui/icons-material/Image";
import PeopleIcon from "@mui/icons-material/People";
import { search } from "@artsdiva/api/search.api";
import { useDebounce } from "@artsdiva/hooks/useDebounce";
import type { SearchResultItem, SearchResultType } from "@artsdiva/types/search.types";

const TYPE_META: Record<SearchResultType, { group: string; path: string; icon: React.ReactNode }> = {
  artist: { group: "Artists", path: "/artists", icon: <PaletteIcon fontSize="small" /> },
  artwork: { group: "Artworks", path: "/artworks", icon: <ImageIcon fontSize="small" /> },
  client: { group: "Clients", path: "/clients", icon: <PeopleIcon fontSize="small" /> },
};

export function GlobalSearch() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const debounced = useDebounce(inputValue, 300);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["global-search", debounced],
    queryFn: () => search(debounced.trim()),
    enabled: debounced.trim().length >= 2,
    staleTime: 10_000,
  });

  const options: SearchResultItem[] = data
    ? [...data.artists, ...data.artworks, ...data.clients]
    : [];

  return (
    <Autocomplete<SearchResultItem>
      size="small"
      options={options}
      filterOptions={(opts) => opts}
      groupBy={(opt) => TYPE_META[opt.type].group}
      getOptionLabel={(opt) => opt.label}
      isOptionEqualToValue={(opt, val) => opt.id === val.id && opt.type === val.type}
      inputValue={inputValue}
      onInputChange={(_, val, reason) => {
        if (reason !== "reset") setInputValue(val);
      }}
      value={null}
      onChange={(_, opt) => {
        if (!opt) return;
        setInputValue("");
        void router.push(`${TYPE_META[opt.type].path}/${opt.id}`);
      }}
      loading={isFetching}
      autoHighlight
      blurOnSelect
      noOptionsText={
        isError
          ? "Search failed — check your connection"
          : debounced.trim().length < 2
            ? "Type at least 2 characters"
            : "No results found"
      }
      sx={{ width: { xs: 170, sm: 280, md: 360 } }}
      slotProps={{ popper: { sx: { minWidth: 320 } } }}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={`${option.type}-${option.id}`} sx={{ display: "flex", gap: 1 }}>
          <Box sx={{ color: "text.disabled", display: "flex", alignItems: "center" }}>
            {TYPE_META[option.type].icon}
          </Box>
          <Typography variant="body2">{option.label}</Typography>
        </Box>
      )}
      renderInput={(params) => (
        // MUI v9: Autocomplete's input wiring lives in params.slotProps
        // (input/htmlInput/inputLabel) — it MUST be spread through, otherwise
        // the field renders but typing never reaches the Autocomplete.
        <TextField
          {...params}
          placeholder="Search artists, artworks, clients…"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#F1F3F6",
              borderRadius: 2,
              "& fieldset": { border: "none" },
              "&:hover": { backgroundColor: "#EAEDF1" },
              "&.Mui-focused": {
                backgroundColor: "#fff",
                boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.25)",
              },
            },
          }}
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps.input,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {isFetching && <CircularProgress size={14} />}
                  {params.slotProps.input.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
