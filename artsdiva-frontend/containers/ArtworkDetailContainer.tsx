import React, { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Link from "next/link";
import { useArtwork, useDeleteArtwork, useUpdateArtworkStatus, useUploadArtworkImages } from "@artsdiva/hooks/useArtworks";
import { StatusBadge } from "@artsdiva/components/ui/StatusBadge";
import { SkeletonDetailCard } from "@artsdiva/components/ui/SkeletonTable";
import { ConfirmDialog } from "@artsdiva/components/ui/ConfirmDialog";
import { ImageWithFallback } from "@artsdiva/components/ui/ImagePlaceholder";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import { useAuth } from "@artsdiva/hooks/useAuth";
import type { ArtworkStatus } from "@artsdiva/types/artwork.types";

interface ArtworkDetailContainerProps {
  artworkId: string;
}

export function ArtworkDetailContainer({ artworkId }: ArtworkDetailContainerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: artwork, isLoading, error } = useArtwork(artworkId);
  const deleteMutation = useDeleteArtwork();
  const statusMutation = useUpdateArtworkStatus(artworkId);
  const uploadMutation = useUploadArtworkImages(artworkId);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(artworkId);
      showToast(`"${artwork?.title ?? "Artwork"}" deleted`);
      void router.push("/artworks");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete artwork", "error");
    }
  };

  const handleStatusChange = async (status: ArtworkStatus) => {
    try {
      await statusMutation.mutateAsync(status);
      showToast("Status updated");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update status", "error");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;
    try {
      await uploadMutation.mutateAsync(files);
      showToast("Images uploaded");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to upload images", "error");
    }
    e.target.value = "";
  };

  if (isLoading) return <SkeletonDetailCard />;
  if (error || !artwork) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error instanceof Error ? error.message : "Artwork not found"}</Alert>
      </Box>
    );
  }

  const dims = artwork.dimensions
    ? `${artwork.dimensions.width} × ${artwork.dimensions.height} ${artwork.dimensions.unit}`
    : "—";

  const images = artwork.images ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Box sx={{ p: 3, maxWidth: 1100 }}>
        {/* Breadcrumb */}
        <Link href="/artworks" style={{ textDecoration: "none" }}>
          <Typography variant="body2" sx={{ color: "#94A3B8", mb: 2, cursor: "pointer", "&:hover": { color: "#4F46E5" } }}>
            ← Back to Artworks
          </Typography>
        </Link>

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A" }}>{artwork.title}</Typography>
            {artwork.artist && (
              <Typography
                variant="body2"
                sx={{ color: "#4F46E5", mt: 0.5, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                onClick={() => void router.push(`/artists/${artwork.artist!.id}`)}
              >
                by {artwork.artist.name}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => void router.push(`/artworks/${artworkId}/edit`)}
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

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
          {/* Left: Image gallery */}
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ mb: 1.5 }}>
                <ImageWithFallback
                  src={images[selectedImage]}
                  alt={artwork.title}
                  width="100%"
                  height={300}
                  borderRadius={8}
                />
              </Box>
              {images.length > 1 && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                  {images.map((img, i) => (
                    <Box
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 1,
                        overflow: "hidden",
                        border: i === selectedImage ? "2px solid #4F46E5" : "2px solid transparent",
                        cursor: "pointer",
                        opacity: i === selectedImage ? 1 : 0.65,
                        transition: "all 0.15s",
                      }}
                    >
                      <ImageWithFallback src={img} alt={`${artwork.title} ${i + 1}`} width={52} height={52} borderRadius={0} />
                    </Box>
                  ))}
                </Box>
              )}
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                  {images.length} {images.length === 1 ? "image" : "images"}
                </Typography>
                <Button
                  component="label"
                  size="small"
                  variant="text"
                  sx={{ ml: "auto", fontSize: "0.75rem" }}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? "Uploading…" : "+ Upload"}
                  <input type="file" accept="image/*" multiple hidden onChange={(e) => void handleImageUpload(e)} />
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Right: Details */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ color: "#64748B", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", mb: 1.5 }}>
                  Artwork Details
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {[
                    { label: "Medium", value: artwork.medium },
                    { label: "Dimensions", value: dims },
                    { label: "Year", value: artwork.year },
                    { label: "Acquired", value: new Date(artwork.acquisitionDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
                  ].map(({ label, value }) => (
                    <Box key={label}>
                      <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 0.25 }}>{label}</Typography>
                      <Typography variant="body2" sx={{ color: "#0F172A", fontWeight: 500 }}>{value}</Typography>
                    </Box>
                  ))}
                  {artwork.notes && (
                    <Box>
                      <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 0.25 }}>Notes</Typography>
                      <Typography variant="body2" sx={{ color: "#475569" }}>{artwork.notes}</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ color: "#64748B", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", mb: 1.5 }}>
                  Status
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  <StatusBadge type="artwork" status={artwork.status} />
                </Box>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={artwork.status}
                  onChange={(e) => void handleStatusChange(e.target.value as ArtworkStatus)}
                  disabled={statusMutation.isPending}
                  sx={{ mt: 1 }}
                >
                  <MenuItem value="IN_COLLECTION">🟢 In Collection</MenuItem>
                  <MenuItem value="ON_LEASE">🔵 On Lease</MenuItem>
                  <MenuItem value="SOLD">🟡 Sold</MenuItem>
                </TextField>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      <ConfirmDialog
        open={deleteOpen}
        title={`Delete "${artwork.title}"`}
        description="This will soft-delete the artwork. It will no longer appear in the collection."
        confirmLabel="Delete Artwork"
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteOpen(false)}
      />
    </motion.div>
  );
}
