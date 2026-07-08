import React, { useState } from "react";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import { BackLink } from "@artsdiva/components/ui/BackLink";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQueryClient } from "@tanstack/react-query";
import { ARTWORKS_KEY, useArtwork, useDeleteArtwork, useUpdateArtworkStatus, useUploadArtworkImages } from "@artsdiva/hooks/useArtworks";
import { LEASES_KEY, useLeaseHistory, useLeases } from "@artsdiva/hooks/useLeases";
import { LeaseHistoryTable } from "@artsdiva/components/LeaseHistoryTable";
import { StatusBadge } from "@artsdiva/components/ui/StatusBadge";
import { SkeletonDetailCard } from "@artsdiva/components/ui/SkeletonTable";
import { ConfirmDialog } from "@artsdiva/components/ui/ConfirmDialog";
import { ImageWithFallback } from "@artsdiva/components/ui/ImagePlaceholder";
import { LeaseFormContainer } from "@artsdiva/containers/LeaseFormContainer";
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
  const [leaseOpen, setLeaseOpen] = useState(false);

  // Returning from "New client" inside the lease form — reopen the panel so
  // the user sees their new client already selected.
  const autoClientId = typeof router.query.autoClientId === "string" ? router.query.autoClientId : undefined;
  React.useEffect(() => {
    if (autoClientId) setLeaseOpen(true);
  }, [autoClientId]);

  const { data: artwork, isLoading, error } = useArtwork(artworkId);
  const deleteMutation = useDeleteArtwork();
  const statusMutation = useUpdateArtworkStatus(artworkId);
  const uploadMutation = useUploadArtworkImages(artworkId);

  const queryClient = useQueryClient();
  const leaseActions = useLeases({
    onMutate: async () => {
      await queryClient.invalidateQueries({ queryKey: [ARTWORKS_KEY] });
      await queryClient.invalidateQueries({ queryKey: [LEASES_KEY] });
    },
  });
  const leaseHistory = useLeaseHistory({ artworkId, limit: 50 });

  const handleLeaseAction = async (action: "complete" | "cancel") => {
    const leaseId = artwork?.activeLease?.id;
    if (!leaseId) return;
    const ok = action === "complete"
      ? await leaseActions.completeLease(leaseId)
      : await leaseActions.cancelLease(leaseId);
    if (ok) {
      showToast(action === "complete" ? "Lease completed — artwork returned to collection" : "Lease cancelled");
    }
  };

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
    <Box>
      <Box sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 1100, mx: "auto" }}>
        {/* Breadcrumb */}
        <Box sx={{ mb: 2 }}>
          <BackLink href="/artworks" label="Back to Artworks" />
        </Box>

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>{artwork.title}</Typography>
            {artwork.artist && (
              <Typography
                variant="body2"
                sx={{ color: "primary.main", mt: 0.5, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
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
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
            {user?.role === "ADMIN" && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setDeleteOpen(true)}
                color="error"
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 3 }}>
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
                        border: i === selectedImage ? "2px solid" : "2px solid transparent", borderColor: i === selectedImage ? "primary.main" : "transparent",
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
                <Typography variant="caption" sx={{ color: "text.disabled" }}>
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
                <Typography variant="subtitle2" sx={{ color: "text.secondary", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", mb: 1.5 }}>
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
                      <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 0.25 }}>{label}</Typography>
                      <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>{value}</Typography>
                    </Box>
                  ))}
                  {artwork.notes && (
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 0.25 }}>Notes</Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>{artwork.notes}</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ color: "text.secondary", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", mb: 1.5 }}>
                  Status
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                  <StatusBadge type="artwork" status={artwork.status} />
                </Box>

                {artwork.status === "ON_LEASE" && artwork.activeLease ? (
                  <>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 0.25 }}>Leased to</Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "primary.main", fontWeight: 500, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                          onClick={() => void router.push(`/clients/${artwork.activeLease!.clientId}`)}
                        >
                          {artwork.activeLease.client.name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 0.25 }}>Since</Typography>
                        <Typography variant="body2">
                          {new Date(artwork.activeLease.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                        </Typography>
                      </Box>
                      {artwork.activeLease.rateAmount != null && (
                        <Box>
                          <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 0.25 }}>Lease Rate</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{artwork.activeLease.rateAmount}</Typography>
                        </Box>
                      )}
                    </Box>
                    {leaseActions.error && <Alert severity="error" sx={{ mb: 1.5 }}>{leaseActions.error}</Alert>}
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        disabled={leaseActions.isSubmitting}
                        onClick={() => void handleLeaseAction("complete")}
                      >
                        Complete Lease
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        disabled={leaseActions.isSubmitting}
                        onClick={() => void handleLeaseAction("cancel")}
                      >
                        Cancel Lease
                      </Button>
                    </Box>
                  </>
                ) : artwork.status === "SOLD" ? (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      This artwork has been sold and can no longer be leased.
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={statusMutation.isPending}
                      onClick={() => void handleStatusChange("IN_COLLECTION")}
                    >
                      Return to Collection
                    </Button>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      Available at the gallery. Lease it below, or mark it sold.
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={statusMutation.isPending}
                      onClick={() => void handleStatusChange("SOLD")}
                    >
                      Mark as Sold
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Lease section — only an artwork sitting in the collection can be leased */}
      {artwork.status === "IN_COLLECTION" && (
      <Box sx={{ px: { xs: 2.5, md: 4 }, pb: { xs: 3, md: 4 }, maxWidth: 1100, mx: "auto" }}>
        <Card variant="outlined">
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: leaseOpen ? 2 : 0 }}>
              <Typography variant="subtitle2" sx={{ color: "text.secondary", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Lease this Artwork
              </Typography>
              <Button size="small" variant={leaseOpen ? "outlined" : "contained"} onClick={() => setLeaseOpen((p) => !p)}>
                {leaseOpen ? "Cancel" : "Lease"}
              </Button>
            </Box>
            <Collapse in={leaseOpen} unmountOnExit>
              <LeaseFormContainer
                artworkId={artworkId}
                onLeased={() => {
                  setLeaseOpen(false);
                  showToast("Artwork leased successfully");
                  // Refetch so the page immediately reflects ON_LEASE + the active lease.
                  void queryClient.invalidateQueries({ queryKey: [ARTWORKS_KEY] });
                  void queryClient.invalidateQueries({ queryKey: [LEASES_KEY] });
                }}
                onCancel={() => setLeaseOpen(false)}
              />
            </Collapse>
          </CardContent>
        </Card>
      </Box>
      )}

      {/* Lease history */}
      <Box sx={{ px: { xs: 2.5, md: 4 }, pb: { xs: 3, md: 4 }, maxWidth: 1100, mx: "auto" }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Lease History
          {leaseHistory.data && <Chip label={leaseHistory.data.total} size="small" sx={{ ml: 1 }} />}
        </Typography>
        <LeaseHistoryTable
          leases={leaseHistory.data?.data ?? []}
          isLoading={leaseHistory.isLoading}
          show="client"
          onRowClick={(lease) => void router.push(`/clients/${lease.client.id}`)}
        />
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
    </Box>
  );
}



