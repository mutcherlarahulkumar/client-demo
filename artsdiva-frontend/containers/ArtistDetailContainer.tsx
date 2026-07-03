import React, { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Link from "next/link";
import { useArtist, useDeleteArtist } from "@artsdiva/hooks/useArtists";
import { useArtworks } from "@artsdiva/hooks/useArtworks";
import { StatusBadge } from "@artsdiva/components/ui/StatusBadge";
import { SkeletonDetailCard } from "@artsdiva/components/ui/SkeletonTable";
import { ConfirmDialog } from "@artsdiva/components/ui/ConfirmDialog";
import { ImageWithFallback } from "@artsdiva/components/ui/ImagePlaceholder";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import { useAuth } from "@artsdiva/hooks/useAuth";

const AVATAR_COLORS = ["#4F46E5", "#0891B2", "#16A34A", "#DC2626", "#B45309", "#7C3AED"];
function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}
function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

interface ArtistDetailContainerProps {
  artistId: string;
}

export function ArtistDetailContainer({ artistId }: ArtistDetailContainerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: artist, isLoading, error } = useArtist(artistId);
  const { data: artworksData, isLoading: artworksLoading } = useArtworks({ artistId, limit: 50 });
  const deleteMutation = useDeleteArtist();

  const artworks = artworksData?.data ?? [];

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(artistId);
      showToast(`"${artist?.name ?? "Artist"}" deleted`);
      void router.push("/artists");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete artist", "error");
    }
  };

  if (isLoading) return <SkeletonDetailCard />;
  if (error || !artist) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error instanceof Error ? error.message : "Artist not found"}</Alert>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Box sx={{ p: 3, maxWidth: 1100 }}>
        {/* Breadcrumb */}
        <Link href="/artists" style={{ textDecoration: "none" }}>
          <Typography variant="body2" sx={{ color: "#94A3B8", mb: 2, cursor: "pointer", "&:hover": { color: "#4F46E5" } }}>
            ← Back to Artists
          </Typography>
        </Link>

        {/* Header card */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2.5 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  backgroundColor: avatarColor(artist.name),
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials(artist.name)}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A", mb: 0.5 }}>
                  {artist.name}
                </Typography>
                {artist.bio && (
                  <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6, mb: 1.5 }}>
                    {artist.bio}
                  </Typography>
                )}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                  <StatusBadge type="mou" status={artist.mouStatus} />
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => void router.push(`/artists/${artistId}/edit`)}
                  sx={{ color: "#64748B", borderColor: "#E2E8F0" }}
                >
                  ✏️ Edit
                </Button>
                {user?.role === "ADMIN" && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setDeleteOpen(true)}
                    sx={{ color: "#DC2626", borderColor: "#FECACA", "&:hover": { backgroundColor: "#FEF2F2" } }}
                  >
                    🗑 Delete
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Info + Contact row */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5, mb: 3 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ color: "#64748B", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", mb: 1.5 }}>
                Terms &amp; Agreement
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 0.25 }}>Commission Terms</Typography>
                  <Typography variant="body2" sx={{ color: "#0F172A", fontWeight: 500 }}>{artist.commissionTerms}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 0.25 }}>MOU Status</Typography>
                  <StatusBadge type="mou" status={artist.mouStatus} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 0.25 }}>Artist Since</Typography>
                  <Typography variant="body2" sx={{ color: "#0F172A" }}>
                    {new Date(artist.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ color: "#64748B", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", mb: 1.5 }}>
                Contact Info
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 0.25 }}>Email</Typography>
                  <Typography variant="body2" sx={{ color: "#0F172A" }}>{artist.contactInfo?.email ?? "—"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 0.25 }}>Phone</Typography>
                  <Typography variant="body2" sx={{ color: "#0F172A" }}>
                    {artist.contactInfo?.phoneCountryCode && artist.contactInfo?.phone
                      ? `${artist.contactInfo.phoneCountryCode} ${artist.contactInfo.phone}`
                      : artist.contactInfo?.phone ?? "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 0.25 }}>Address</Typography>
                  <Typography variant="body2" sx={{ color: "#0F172A" }}>{artist.contactInfo?.address ?? "—"}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Artworks section */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>
            Artworks
            {!artworksLoading && (
              <Chip
                label={artworks.length}
                size="small"
                sx={{ ml: 1, height: 20, fontSize: "0.7rem", backgroundColor: "#EEF2FF", color: "#4F46E5" }}
              />
            )}
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => void router.push(`/artworks/new?artistId=${artistId}`)}
          >
            + Add Artwork
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 2, border: "1px solid #E2E8F0", boxShadow: "none" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 48 }}></TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Medium</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {artworksLoading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 4, textAlign: "center" }}>
                    <Typography variant="body2" sx={{ color: "#94A3B8" }}>Loading artworks…</Typography>
                  </TableCell>
                </TableRow>
              ) : artworks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 5, textAlign: "center" }}>
                    <Typography variant="body2" sx={{ color: "#94A3B8" }}>No artworks yet for this artist.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                artworks.map((artwork) => (
                  <TableRow key={artwork.id} hover sx={{ cursor: "pointer" }} onClick={() => void router.push(`/artworks/${artwork.id}`)}>
                    <TableCell sx={{ py: 1 }}>
                      <ImageWithFallback src={artwork.images[0]} alt={artwork.title} width={40} height={40} borderRadius={4} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>{artwork.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "#475569" }}>{artwork.medium}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "#475569" }}>{artwork.year}</Typography>
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="artwork" status={artwork.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); void router.push(`/artworks/${artwork.id}/edit`); }}>
                          <Typography sx={{ fontSize: 13 }}>✏️</Typography>
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <ConfirmDialog
        open={deleteOpen}
        title={`Delete "${artist.name}"`}
        description="This will soft-delete the artist. Their artworks will remain but the artist will no longer appear in lists."
        confirmLabel="Delete Artist"
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteOpen(false)}
      />
    </motion.div>
  );
}
