import React, { useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
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
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import { useArtists, useDeleteArtist } from "@artsdiva/hooks/useArtists";
import { StatusBadge } from "@artsdiva/components/ui/StatusBadge";
import { SkeletonTableRows } from "@artsdiva/components/ui/SkeletonTable";
import { ConfirmDialog } from "@artsdiva/components/ui/ConfirmDialog";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import type { Artist } from "@artsdiva/types/artist.types";
import { useDebounce } from "@artsdiva/hooks/useDebounce";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ["#4F46E5", "#0891B2", "#16A34A", "#DC2626", "#B45309", "#7C3AED"];
function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export function ArtistListContainer() {
  const router = useRouter();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [deleteTarget, setDeleteTarget] = useState<Artist | null>(null);

  const { data, isLoading, error } = useArtists({
    search: debouncedSearch || undefined,
    limit: 20,
  });

  const deleteMutation = useDeleteArtist();

  const artists = data?.data ?? [];
  const total = data?.total ?? 0;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showToast(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete artist";
      showToast(msg, "error");
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A" }}>
            Artists
          </Typography>
          {!isLoading && (
            <Typography variant="body2" sx={{ color: "#64748B", mt: 0.25 }}>
              {total} {total === 1 ? "artist" : "artists"} total
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          onClick={() => void router.push("/artists/new")}
          sx={{ gap: 0.5 }}
        >
          + Add Artist
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2.5 }}>
        <TextField
          size="small"
          placeholder="Search artists by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 320 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ color: "#94A3B8" }}>🔍</Typography>
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
        sx={{ borderRadius: 2, border: "1px solid #E2E8F0", boxShadow: "none" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Commission Terms</TableCell>
              <TableCell>MOU Status</TableCell>
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
                  <Typography sx={{ color: "#94A3B8" }}>
                    {search ? `No artists found for "${search}"` : "No artists yet. Add one to get started."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence>
                {artists.map((artist, i) => (
                  <motion.tr
                    key={artist.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    style={{ display: "table-row" }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            backgroundColor: avatarColor(artist.name),
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {initials(artist.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>
                            {artist.name}
                          </Typography>
                          {artist.contactInfo?.email && (
                            <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                              {artist.contactInfo.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "#475569" }}>
                        {artist.commissionTerms}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="mou" status={artist.mouStatus} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "#475569" }}>
                        {artist.contactInfo?.phoneCountryCode && artist.contactInfo?.phone
                          ? `${artist.contactInfo.phoneCountryCode} ${artist.contactInfo.phone}`
                          : artist.contactInfo?.phone ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => void router.push(`/artists/${artist.id}`)}
                            sx={{ color: "#64748B" }}
                          >
                            <Typography sx={{ fontSize: 14 }}>👁</Typography>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => void router.push(`/artists/${artist.id}/edit`)}
                            sx={{ color: "#64748B" }}
                          >
                            <Typography sx={{ fontSize: 14 }}>✏️</Typography>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(artist)}
                            sx={{ color: "#64748B", "&:hover": { color: "#DC2626" } }}
                          >
                            <Typography sx={{ fontSize: 14 }}>🗑</Typography>
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
