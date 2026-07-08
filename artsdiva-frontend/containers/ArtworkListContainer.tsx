import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
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
import Alert from "@mui/material/Alert";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useArtworks, useDeleteArtwork } from "@artsdiva/hooks/useArtworks";
import { useAuth } from "@artsdiva/hooks/useAuth";
import { exportArtworks } from "@artsdiva/api/artwork.api";
import { StatusBadge } from "@artsdiva/components/ui/StatusBadge";
import { SkeletonTableRows } from "@artsdiva/components/ui/SkeletonTable";
import { ConfirmDialog } from "@artsdiva/components/ui/ConfirmDialog";
import { ImageWithFallback } from "@artsdiva/components/ui/ImagePlaceholder";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import { useDebounce } from "@artsdiva/hooks/useDebounce";
import { toCsv, downloadCsv } from "@artsdiva/utils/csv";
import type { Artwork, ArtworkSortField, ArtworkStatus } from "@artsdiva/types/artwork.types";

export function ArtworkListContainer() {
  const router = useRouter();
  const { user } = useAuth();
  const canDelete = user?.role === "ADMIN";
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ArtworkStatus | "">("");
  const debouncedSearch = useDebounce(search, 300);
  const [deleteTarget, setDeleteTarget] = useState<Artwork | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<ArtworkSortField>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isExporting, setIsExporting] = useState(false);

  const filterParams = {
    search: debouncedSearch || undefined,
    status: status || undefined,
  };

  const { data, isLoading, error } = useArtworks({
    ...filterParams,
    page: page + 1,
    limit: rowsPerPage,
    sortBy,
    sortOrder,
  });

  const deleteMutation = useDeleteArtwork();
  const artworks = data?.data ?? [];
  const total = data?.total ?? 0;

  useEffect(() => { setPage(0); }, [debouncedSearch, status, sortBy, sortOrder]);

  const toggleSort = (field: ArtworkSortField) => {
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
      const rows = await exportArtworks({ ...filterParams, sortBy, sortOrder });
      const csv = toCsv(rows, [
        { key: "title", label: "Title" },
        { key: "artist", label: "Artist", value: (r) => r.artist?.name },
        { key: "medium", label: "Medium" },
        { key: "year", label: "Year" },
        { key: "dimensions", label: "Dimensions", value: (r) => formatDimensions(r) },
        { key: "status", label: "Status" },
      ]);
      downloadCsv("artworks.csv", csv);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to export artworks", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showToast(`"${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete artwork", "error");
    }
  };

  const formatDimensions = (artwork: Artwork) => {
    const d = artwork.dimensions;
    if (!d) return "—";
    return `${d.width} × ${d.height} ${d.unit}`;
  };

  return (
    <Box sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>Artworks</Typography>
          {!isLoading && (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              {total} {total === 1 ? "artwork" : "artworks"} total
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={() => void handleExport()} disabled={isExporting}>
            {isExporting ? "Exporting…" : "Export CSV"}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => void router.push("/artworks/new")}>
            Add Artwork
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
        <TextField
          size="small"
          placeholder="Search by title or medium..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: "100%", sm: 300 } }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>,
            },
          }}
        />
        <TextField
          size="small"
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ArtworkStatus | "")}
          sx={{ width: { xs: "100%", sm: 180 } }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="IN_COLLECTION">In Collection</MenuItem>
          <MenuItem value="ON_LEASE">On Lease</MenuItem>
          <MenuItem value="SOLD">Sold</MenuItem>
        </TextField>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error instanceof Error ? error.message : "Failed to load artworks"}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 2, border: 1, borderColor: "divider", boxShadow: "none" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 56 }}>Image</TableCell>
              <TableCell sortDirection={sortBy === "title" ? sortOrder : false}>
                <TableSortLabel active={sortBy === "title"} direction={sortBy === "title" ? sortOrder : "asc"} onClick={() => toggleSort("title")}>
                  Title
                </TableSortLabel>
              </TableCell>
              <TableCell>Artist</TableCell>
              <TableCell sortDirection={sortBy === "medium" ? sortOrder : false}>
                <TableSortLabel active={sortBy === "medium"} direction={sortBy === "medium" ? sortOrder : "asc"} onClick={() => toggleSort("medium")}>
                  Medium
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortBy === "year" ? sortOrder : false}>
                <TableSortLabel active={sortBy === "year"} direction={sortBy === "year" ? sortOrder : "asc"} onClick={() => toggleSort("year")}>
                  Year
                </TableSortLabel>
              </TableCell>
              <TableCell>Dimensions</TableCell>
              <TableCell sortDirection={sortBy === "status" ? sortOrder : false}>
                <TableSortLabel active={sortBy === "status"} direction={sortBy === "status" ? sortOrder : "asc"} onClick={() => toggleSort("status")}>
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <SkeletonTableRows rows={6} cols={8} />
            ) : artworks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography sx={{ color: "text.disabled", mb: search || status ? 0 : 2 }}>
                    {search || status ? "No artworks match your filters." : "No artworks yet."}
                  </Typography>
                  {!search && !status && (
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => void router.push("/artworks/new")}>
                      Add your first artwork
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {artworks.map((artwork) => (
                  <TableRow
                    key={artwork.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => void router.push(`/artworks/${artwork.id}`)}
                  >
                    <TableCell>
                      <ImageWithFallback
                        src={artwork.images[0]}
                        alt={artwork.title}
                        width={44}
                        height={44}
                        borderRadius={6}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        {artwork.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {artwork.artist?.name ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>{artwork.medium}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>{artwork.year}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>{formatDimensions(artwork)}</Typography>
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="artwork" status={artwork.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); void router.push(`/artworks/${artwork.id}/edit`); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {canDelete && (
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteTarget(artwork); }}>
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
        title={`Delete "${deleteTarget?.title ?? ""}"`}
        description="This will permanently remove the artwork. This action cannot be undone."
        confirmLabel="Delete Artwork"
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}



