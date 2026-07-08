import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useArtists, useDeleteArtist } from "@artsdiva/hooks/useArtists";
import { useAuth } from "@artsdiva/hooks/useAuth";
import { exportArtists } from "@artsdiva/api/artist.api";
import { StatusBadge } from "@artsdiva/components/ui/StatusBadge";
import { SkeletonTableRows } from "@artsdiva/components/ui/SkeletonTable";
import { ConfirmDialog } from "@artsdiva/components/ui/ConfirmDialog";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import type { Artist, ArtistSortField } from "@artsdiva/types/artist.types";
import { useDebounce } from "@artsdiva/hooks/useDebounce";
import { toCsv, downloadCsv } from "@artsdiva/utils/csv";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ArtistListContainer() {
  const router = useRouter();
  const { user } = useAuth();
  const canDelete = user?.role === "ADMIN";
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [deleteTarget, setDeleteTarget] = useState<Artist | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<ArtistSortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isExporting, setIsExporting] = useState(false);

  const listParams = {
    search: debouncedSearch || undefined,
    page: page + 1,
    limit: rowsPerPage,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, error } = useArtists(listParams);

  const deleteMutation = useDeleteArtist();

  const artists = data?.data ?? [];
  const total = data?.total ?? 0;

  // Reset to the first page whenever the result set could change shape.
  useEffect(() => { setPage(0); }, [debouncedSearch, sortBy, sortOrder]);

  const toggleSort = (field: ArtistSortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const rows = await exportArtists({ search: debouncedSearch || undefined, sortBy, sortOrder });
      const csv = toCsv(rows, [
        { key: "name", label: "Name" },
        { key: "commissionPercent", label: "Commission %" },
        { key: "commissionTerms", label: "Commission Terms" },
        { key: "mouStatus", label: "MOU Status" },
        { key: "email", label: "Email", value: (r) => r.contactInfo?.email },
        { key: "phone", label: "Phone", value: (r) => r.contactInfo?.phone },
      ]);
      downloadCsv("artists.csv", csv);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to export artists", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showToast(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete artist";
      showToast(msg, "error");
    }
  };

  return (
    <Box sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            Artists
          </Typography>
          {!isLoading && (
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.25 }}
            >
              {total} {total === 1 ? "artist" : "artists"} total
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={() => void handleExport()}
            disabled={isExporting}
          >
            {isExporting ? "Exporting…" : "Export CSV"}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => void router.push("/artists/new")}
          >
            Add Artist
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2.5 }}>
        <TextField
          size="small"
          placeholder="Search artists by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: "100%", sm: 320 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : "Failed to load artists"}
        </Alert>
      )}

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={sortBy === "name" ? sortOrder : false}>
                <TableSortLabel active={sortBy === "name"} direction={sortBy === "name" ? sortOrder : "asc"} onClick={() => toggleSort("name")}>
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortBy === "commissionPercent" ? sortOrder : false}>
                <TableSortLabel active={sortBy === "commissionPercent"} direction={sortBy === "commissionPercent" ? sortOrder : "asc"} onClick={() => toggleSort("commissionPercent")}>
                  Commission Terms
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortBy === "mouStatus" ? sortOrder : false}>
                <TableSortLabel active={sortBy === "mouStatus"} direction={sortBy === "mouStatus" ? sortOrder : "asc"} onClick={() => toggleSort("mouStatus")}>
                  MOU Status
                </TableSortLabel>
              </TableCell>
              <TableCell>Contact</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <SkeletonTableRows rows={6} cols={5} />
            ) : artists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography sx={{ color: "text.disabled", mb: search ? 0 : 2 }}>
                    {search
                      ? `No artists found for "${search}"`
                      : "No artists yet."}
                  </Typography>
                  {!search && (
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => void router.push("/artists/new")}>
                      Add your first artist
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {artists.map((artist) => (
                  <TableRow
                    key={artist.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => void router.push(`/artists/${artist.id}`)}
                  >
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: "rgba(25, 118, 210, 0.12)", color: "primary.main",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {initials(artist.name)}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "text.primary" }}
                          >
                            {artist.name}
                          </Typography>
                          {artist.contactInfo?.email && (
                            <Typography
                              variant="caption"
                              sx={{ color: "text.disabled" }}
                            >
                              {artist.contactInfo.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {artist.commissionTerms}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="mou" status={artist.mouStatus} />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {artist.contactInfo?.phoneCountryCode &&
                        artist.contactInfo?.phone
                          ? `${artist.contactInfo.phoneCountryCode} ${artist.contactInfo.phone}`
                          : (artist.contactInfo?.phone ?? "—")}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 0.5,
                        }}
                      >
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              void router.push(`/artists/${artist.id}/edit`);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {canDelete && (
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(artist);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[10, 20, 50, 100]}
        sx={{ "& .MuiTablePagination-toolbar": { flexWrap: { xs: "wrap", sm: "nowrap" }, justifyContent: { xs: "center", sm: "flex-end" } }, "& .MuiTablePagination-spacer": { display: { xs: "none", sm: "block" } } }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.name ?? ""}"`}
        description="This will permanently remove the artist. This action cannot be undone."
        confirmLabel="Delete Artist"
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
