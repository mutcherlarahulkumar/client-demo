import React, { useState } from "react";
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
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useArtworks, useDeleteArtwork } from "@artsdiva/hooks/useArtworks";
import { StatusBadge } from "@artsdiva/components/ui/StatusBadge";
import { SkeletonTableRows } from "@artsdiva/components/ui/SkeletonTable";
import { ConfirmDialog } from "@artsdiva/components/ui/ConfirmDialog";
import { ImageWithFallback } from "@artsdiva/components/ui/ImagePlaceholder";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import { useDebounce } from "@artsdiva/hooks/useDebounce";
import type { Artwork, ArtworkStatus } from "@artsdiva/types/artwork.types";

export function ArtworkListContainer() {
  const router = useRouter();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ArtworkStatus | "">("");
  const debouncedSearch = useDebounce(search, 300);
  const [deleteTarget, setDeleteTarget] = useState<Artwork | null>(null);

  const { data, isLoading, error } = useArtworks({
    search: debouncedSearch || undefined,
    status: status || undefined,
    limit: 20,
  });

  const deleteMutation = useDeleteArtwork();
  const artworks = data?.data ?? [];
  const total = data?.total ?? 0;

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
    if (!d) return "â€”";
    return `${d.width} Ã— ${d.height} ${d.unit}`;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>Artworks</Typography>
          {!isLoading && (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              {total} {total === 1 ? "artwork" : "artworks"} total
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => void router.push("/artworks/new")}>
          Add Artwork
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5 }}>
        <TextField
          size="small"
          placeholder="Search by title or medium..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>,
            },
          }}
        />
        <TextField
          size="small"
          select
          value={status}
          onChange={(e) => setStatus(e.target.value as ArtworkStatus | "")}
          sx={{ width: 180 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="IN_COLLECTION">ðŸŸ¢ In Collection</MenuItem>
          <MenuItem value="ON_LEASE">ðŸ”µ On Lease</MenuItem>
          <MenuItem value="SOLD">ðŸŸ¡ Sold</MenuItem>
        </TextField>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error instanceof Error ? error.message : "Failed to load artworks"}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 2, border: 1, borderColor: "divider", boxShadow: "none" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 56 }}>Image</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Artist</TableCell>
              <TableCell>Medium</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Dimensions</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <SkeletonTableRows rows={6} cols={8} />
            ) : artworks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography sx={{ color: "text.disabled" }}>
                    {search || status ? "No artworks match your filters." : "No artworks yet. Add one to get started."}
                  </Typography>
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
                        {artwork.artist?.name ?? "â€”"}
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
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteTarget(artwork); }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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



