import React, { useState } from "react";
import { useRouter } from "next/router";
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { BackLink } from "@artsdiva/components/ui/BackLink";
import { useArtist, useDeleteArtist } from "@artsdiva/hooks/useArtists";
import { useDocuments } from "@artsdiva/hooks/useDocuments";
import { DocumentLogSection } from "@artsdiva/components/DocumentLogSection";
import type { DocumentFileType } from "@artsdiva/types/document.types";
import { StatusBadge } from "@artsdiva/components/ui/StatusBadge";
import { SkeletonDetailCard } from "@artsdiva/components/ui/SkeletonTable";
import { ConfirmDialog } from "@artsdiva/components/ui/ConfirmDialog";
import { ImageWithFallback } from "@artsdiva/components/ui/ImagePlaceholder";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import { useAuth } from "@artsdiva/hooks/useAuth";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface ArtistDetailContainerProps {
  artistId: string;
}

export function ArtistDetailContainer({
  artistId,
}: ArtistDetailContainerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: artist, isLoading, error } = useArtist(artistId);
  const deleteMutation = useDeleteArtist();
  const documents = useDocuments("ARTIST", artistId);
  const [documentType, setDocumentType] = useState<DocumentFileType>("MOU");

  const artworks = artist?.artworks ?? [];

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(artistId);
      showToast(`"${artist?.name ?? "Artist"}" deleted`);
      void router.push("/artists");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete artist",
        "error",
      );
    }
  };

  if (isLoading) return <SkeletonDetailCard />;
  if (error || !artist) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : "Artist not found"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      <Box sx={{ mb: 2 }}>
        <BackLink href="/artists" label="Back to Artists" />
      </Box>

      {/* Header card */}
      <Card variant="outlined" sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                fontSize: "1.25rem",
                fontWeight: 700,
                bgcolor: "rgba(25, 118, 210, 0.12)", color: "primary.main",
              }}
            >
              {initials(artist.name)}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: 0 } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {artist.name}
              </Typography>
              {artist.bio && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6, mb: 1 }}
                >
                  {artist.bio}
                </Typography>
              )}
              <StatusBadge type="mou" status={artist.mouStatus} />
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => void router.push(`/artists/${artistId}/edit`)}
              >
                Edit
              </Button>
              {user?.role === "ADMIN" && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Info row */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
          mb: 2.5,
        }}
      >
        <Card variant="outlined">
          <CardContent sx={{ p: 2.5 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: "block", mb: 1.5 }}
            >
              Terms &amp; Agreement
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  Commission Split
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {artist.commissionPercent != null
                    ? `${artist.commissionPercent}% artist / ${Math.round((100 - artist.commissionPercent) * 100) / 100}% gallery`
                    : "—"}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  Commission Terms
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {artist.commissionTerms}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  MOU Status
                </Typography>
                <StatusBadge type="mou" status={artist.mouStatus} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  Artist Since
                </Typography>
                <Typography variant="body2">
                  {new Date(artist.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent sx={{ p: 2.5 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: "block", mb: 1.5 }}
            >
              Contact Info
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  Email
                </Typography>
                <Typography variant="body2">
                  {artist.contactInfo?.email ?? "—"}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  Phone
                </Typography>
                <Typography variant="body2">
                  {artist.contactInfo?.phone
                    ? `${artist.contactInfo.phoneCountryCode ?? ""} ${artist.contactInfo.phone}`.trim()
                    : "—"}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  Address
                </Typography>
                <Typography variant="body2">
                  {artist.contactInfo?.address ?? "—"}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Artworks */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          mb: 1.5,
        }}
      >
        <Typography variant="h6">
          Artworks
          {!isLoading && (
            <Chip label={artworks.length} size="small" sx={{ ml: 1 }} />
          )}
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => void router.push(`/artworks/new?artistId=${artistId}`)}
        >
          Add Artwork
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading artworks…
                  </Typography>
                </TableCell>
              </TableRow>
            ) : artworks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <Typography variant="body2" color="text.secondary">
                    No artworks yet for this artist.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              artworks.map((artwork) => (
                <TableRow
                  key={artwork.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => void router.push(`/artworks/${artwork.id}`)}
                >
                  <TableCell sx={{ py: 1 }}>
                    <ImageWithFallback
                      src={artwork.images[0]}
                      alt={artwork.title}
                      width={40}
                      height={40}
                      borderRadius={4}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {artwork.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {artwork.medium}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {artwork.year}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge type="artwork" status={artwork.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          void router.push(`/artworks/${artwork.id}/edit`);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3 }}>
        <DocumentLogSection
          documents={documents.documents}
          isLoading={documents.isLoading}
          error={documents.error}
          canDelete={user?.role === "ADMIN"}
          fileType={documentType}
          onFileTypeChange={setDocumentType}
          onUpload={(file) => void documents.upload(documentType, file)}
          onDelete={(id) => void documents.remove(id)}
        />
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
    </Box>
  );
}
