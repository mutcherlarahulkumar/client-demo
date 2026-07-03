import React, { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import Link from "next/link";
import { useClient, useDeleteClient } from "@artsdiva/hooks/useClients";
import { SkeletonDetailCard } from "@artsdiva/components/ui/SkeletonTable";
import { ConfirmDialog } from "@artsdiva/components/ui/ConfirmDialog";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import { useAuth } from "@artsdiva/hooks/useAuth";

const AVATAR_COLORS = ["#4F46E5", "#0891B2", "#16A34A", "#DC2626", "#B45309", "#7C3AED"];
function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}
function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

interface ClientDetailContainerProps {
  clientId: string;
}

export function ClientDetailContainer({ clientId }: ClientDetailContainerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: client, isLoading, error } = useClient(clientId);
  const deleteMutation = useDeleteClient();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(clientId);
      showToast(`"${client?.name ?? "Client"}" deleted`);
      void router.push("/clients");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete client", "error");
    }
  };

  if (isLoading) return <SkeletonDetailCard />;
  if (error || !client) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error instanceof Error ? error.message : "Client not found"}</Alert>
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
        <Link href="/clients" style={{ textDecoration: "none" }}>
          <Typography variant="body2" sx={{ color: "#94A3B8", mb: 2, cursor: "pointer", "&:hover": { color: "#4F46E5" } }}>
            ← Back to Clients
          </Typography>
        </Link>

        {/* Header card */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  backgroundColor: avatarColor(client.name),
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials(client.name)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A" }}>{client.name}</Typography>
                {client.contactInfo?.email && (
                  <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>{client.contactInfo.email}</Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => void router.push(`/artworks/new?clientId=${clientId}`)}
                >
                  + Add Artwork
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => void router.push(`/clients/${clientId}/edit`)}
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

        {/* Info row */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5, mb: 3 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ color: "#64748B", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", mb: 1.5 }}>
                Contact Info
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 0.25 }}>Email</Typography>
                  <Typography variant="body2" sx={{ color: "#0F172A" }}>{client.contactInfo?.email ?? "—"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 0.25 }}>Phone</Typography>
                  <Typography variant="body2" sx={{ color: "#0F172A" }}>
                    {client.contactInfo?.phoneCountryCode && client.contactInfo?.phone
                      ? `${client.contactInfo.phoneCountryCode} ${client.contactInfo.phone}`
                      : client.contactInfo?.phone ?? "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 0.25 }}>Address</Typography>
                  <Typography variant="body2" sx={{ color: "#0F172A" }}>{client.contactInfo?.address ?? "—"}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ color: "#64748B", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", mb: 1.5 }}>
                Profile
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 0.25 }}>Preferences</Typography>
                  <Typography variant="body2" sx={{ color: "#0F172A" }}>{client.preferences ?? "—"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 0.25 }}>Notes</Typography>
                  <Typography variant="body2" sx={{ color: "#475569" }}>{client.notes ?? "—"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 0.25 }}>Client Since</Typography>
                  <Typography variant="body2" sx={{ color: "#0F172A" }}>
                    {new Date(client.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <ConfirmDialog
        open={deleteOpen}
        title={`Delete "${client.name}"`}
        description="This will soft-delete the client and remove them from active lists."
        confirmLabel="Delete Client"
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteOpen(false)}
      />
    </motion.div>
  );
}
