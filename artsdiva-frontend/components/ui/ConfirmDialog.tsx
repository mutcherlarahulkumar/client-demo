import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Dialog from "@mui/material/Dialog";
import Paper from "@mui/material/Paper";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={onCancel}
          maxWidth="xs"
          fullWidth
          PaperComponent={({ children, ...props }) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{ borderRadius: 16 }}
            >
              {/* Must actually be a Paper, not a bare div — Paper is what
                  supplies the background color and elevation shadow; the
                  Dialog-generated className only handles layout/position. */}
              <Paper {...props}>{children}</Paper>
            </motion.div>
          )}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: "#FEE2E2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                <DeleteOutlineIcon fontSize="small" sx={{ color: "error.main" }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
              {description}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button variant="outlined" onClick={onCancel} disabled={loading} sx={{ color: "text.secondary", borderColor: "divider" }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={onConfirm}
              disabled={loading}
              sx={{ backgroundColor: "#DC2626", "&:hover": { backgroundColor: "#B91C1C" } }}
            >
              {loading ? "Deleting…" : confirmLabel}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

