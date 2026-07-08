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
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import { useUsers, useDeactivateUser } from "@artsdiva/hooks/useUsers";
import { useAuth } from "@artsdiva/hooks/useAuth";
import { SkeletonTableRows } from "@artsdiva/components/ui/SkeletonTable";
import { ConfirmDialog } from "@artsdiva/components/ui/ConfirmDialog";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import { useDebounce } from "@artsdiva/hooks/useDebounce";
import type { UserSummary } from "@artsdiva/types/auth.types";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function UserListContainer() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [deactivateTarget, setDeactivateTarget] = useState<UserSummary | null>(null);

  const { data, isLoading, error } = useUsers({
    search: debouncedSearch || undefined,
    limit: 50,
  });
  const deactivateMutation = useDeactivateUser();

  const users = data?.data ?? [];
  const total = data?.total ?? 0;

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await deactivateMutation.mutateAsync(deactivateTarget.id);
      showToast(`"${deactivateTarget.name}" deactivated`);
      setDeactivateTarget(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to deactivate user", "error");
    }
  };

  return (
    <Box sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>Users</Typography>
          {!isLoading && (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              {total} {total === 1 ? "user" : "users"} total
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => void router.push("/users/new")}>
          Add User
        </Button>
      </Box>

      <Box sx={{ mb: 2.5 }}>
        <TextField
          size="small"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: "100%", sm: 320 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : "Failed to load users"}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 2, border: 1, borderColor: "divider", boxShadow: "none" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <SkeletonTableRows rows={5} cols={4} />
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography sx={{ color: "text.disabled" }}>
                    {search ? `No users found for "${search}"` : "No users yet."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: "rgba(25, 118, 210, 0.12)", color: "primary.main", fontSize: "0.75rem", fontWeight: 700 }}>
                        {initials(u.name)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        {u.name}
                        {u.id === currentUser?.id && (
                          <Typography component="span" variant="caption" sx={{ color: "text.disabled", ml: 0.75 }}>(you)</Typography>
                        )}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>{u.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.role === "ADMIN" ? "Admin" : "Staff"}
                      size="small"
                      sx={{
                        backgroundColor: u.role === "ADMIN" ? "#DBEAFE" : "#F1F5F9",
                        color: u.role === "ADMIN" ? "#1D4ED8" : "#64748B",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {u.id !== currentUser?.id && (
                      <Tooltip title="Deactivate">
                        <IconButton size="small" color="error" onClick={() => setDeactivateTarget(u)}>
                          <PersonOffOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={!!deactivateTarget}
        title={`Deactivate "${deactivateTarget?.name ?? ""}"`}
        description="This user will no longer be able to log in. This can't be undone from here."
        confirmLabel="Deactivate"
        loading={deactivateMutation.isPending}
        onConfirm={() => void handleDeactivate()}
        onCancel={() => setDeactivateTarget(null)}
      />
    </Box>
  );
}
