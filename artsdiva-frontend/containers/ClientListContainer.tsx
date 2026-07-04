import React, { useState } from "react";
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
import { useClients, useDeleteClient } from "@artsdiva/hooks/useClients";
import { SkeletonTableRows } from "@artsdiva/components/ui/SkeletonTable";
import { ConfirmDialog } from "@artsdiva/components/ui/ConfirmDialog";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import { useDebounce } from "@artsdiva/hooks/useDebounce";
import type { Client } from "@artsdiva/types/client.types";


function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function ClientListContainer() {
  const router = useRouter();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const { data, isLoading, error } = useClients({
    search: debouncedSearch || undefined,
    limit: 20,
  });

  const deleteMutation = useDeleteClient();
  const clients = data?.data ?? [];
  const total = data?.total ?? 0;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showToast(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete client", "error");
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>Clients</Typography>
          {!isLoading && (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              {total} {total === 1 ? "client" : "clients"} total
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => void router.push("/clients/new")}>
          Add Client
        </Button>
      </Box>

      <Box sx={{ mb: 2.5 }}>
        <TextField
          size="small"
          placeholder="Search clients by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 320 }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>,
            },
          }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error instanceof Error ? error.message : "Failed to load clients"}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 2, border: 1, borderColor: "divider", boxShadow: "none" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <SkeletonTableRows rows={6} cols={5} />
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography sx={{ color: "text.disabled" }}>
                    {search ? `No clients found for "${search}"` : "No clients yet. Add one to get started."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {clients.map((client) => (
                  <TableRow
                    key={client.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => void router.push(`/clients/${client.id}`)}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: "0.75rem", fontWeight: 700 }}>
                          {initials(client.name)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                          {client.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {client.contactInfo?.email ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {client.contactInfo?.phoneCountryCode && client.contactInfo?.phone
                          ? `${client.contactInfo.phoneCountryCode} ${client.contactInfo.phone}`
                          : client.contactInfo?.phone ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
                        {client.contactInfo?.address ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); void router.push(`/clients/${client.id}/edit`); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteTarget(client); }}>
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
        title={`Delete "${deleteTarget?.name ?? ""}"`}
        description="This will permanently remove the client. This action cannot be undone."
        confirmLabel="Delete Client"
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}


