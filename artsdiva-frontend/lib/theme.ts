import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#4F46E5", light: "#6366F1", dark: "#3730A3" },
    secondary: { main: "#0F172A" },
    background: { default: "#F8FAFC", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#64748B" },
    divider: "#E2E8F0",
    success: { main: "#16A34A", light: "#DCFCE7" },
    warning: { main: "#B45309", light: "#FEF3C7" },
    error: { main: "#DC2626", light: "#FEE2E2" },
    info: { main: "#1D4ED8", light: "#DBEAFE" },
  },
  typography: {
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h4: { fontWeight: 700, fontSize: "1.5rem" },
    h5: { fontWeight: 700, fontSize: "1.25rem" },
    h6: { fontWeight: 600, fontSize: "1rem" },
    subtitle1: { fontWeight: 600 },
    body2: { color: "#64748B" },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
        contained: { boxShadow: "none", "&:hover": { boxShadow: "none" } },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#FFFFFF",
          "& fieldset": { borderColor: "#E2E8F0" },
          "&:hover fieldset": { borderColor: "#CBD5E1" },
          "&.Mui-focused fieldset": { borderColor: "#4F46E5" },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { color: "#64748B", "&.Mui-focused": { color: "#4F46E5" } } },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 20, fontWeight: 500, fontSize: "0.75rem" } },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #E2E8F0" } },
    },
    MuiTableHead: {
      styleOverrides: { root: { "& th": { backgroundColor: "#F1F5F9", fontWeight: 700, fontSize: "0.75rem", color: "#64748B", letterSpacing: "0.06em", textTransform: "uppercase" } } },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:last-child td": { borderBottom: 0 },
          "&:hover": { backgroundColor: "#F8FAFC" },
          transition: "background-color 0.15s ease",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderColor: "#F1F5F9", padding: "12px 16px" } },
    },
    MuiAutocomplete: {
      styleOverrides: { paper: { borderRadius: 8, boxShadow: "0 4px 24px rgba(0,0,0,0.12)" } },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { borderRadius: 6, fontSize: "0.75rem", backgroundColor: "#0F172A" } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16 } },
    },
  },
});

export default theme;
