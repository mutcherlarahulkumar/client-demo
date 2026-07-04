import React, { useState } from "react";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import { BackLink } from "@artsdiva/components/ui/BackLink";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useClient, useDeleteClient } from "@artsdiva/hooks/useClients";
import { SkeletonDetailCard } from "@artsdiva/components/ui/SkeletonTable";
import { ConfirmDialog } from "@artsdiva/components/ui/ConfirmDialog";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import { useAuth } from "@artsdiva/hooks/useAuth";


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
    <Box>
      <Box sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 1100, mx: "auto" }}>
        {/* Breadcrumb */}
        <Box sx={{ mb: 2 }}>
          <BackLink href="/clients" label="Back to Clients" />
        </Box>

        {/* Header card */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: "rgba(25, 118, 210, 0.12)", color: "primary.main",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials(client.name)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>{client.name}</Typography>
                {client.contactInfo?.email && (
                  <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>{client.contactInfo.email}</Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => void router.push(`/clients/${clientId}/edit`)}
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
          </CardContent>
        </Card>

        {/* Info row */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5, mb: 3 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ color: "text.secondary", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", mb: 1.5 }}>
                Contact Info
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 0.25 }}>Email</Typography>
                  <Typography variant="body2" sx={{ color: "text.primary" }}>{client.contactInfo?.email ?? "—"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 0.25 }}>Phone</Typography>
                  <Typography variant="body2" sx={{ color: "text.primary" }}>
                    {client.contactInfo?.phoneCountryCode && client.contactInfo?.phone
                      ? `${client.contactInfo.phoneCountryCode} ${client.contactInfo.phone}`
                      : client.contactInfo?.phone ?? "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 0.25 }}>Address</Typography>
                  <Typography variant="body2" sx={{ color: "text.primary" }}>{client.contactInfo?.address ?? "—"}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ color: "text.secondary", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", mb: 1.5 }}>
                Profile
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 0.25 }}>Preferences</Typography>
                  <Typography variant="body2" sx={{ color: "text.primary" }}>{client.preferences ?? "—"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 0.25 }}>Notes</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>{client.notes ?? "—"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 0.25 }}>Client Since</Typography>
                  <Typography variant="body2" sx={{ color: "text.primary" }}>
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
    </Box>
  );
}

