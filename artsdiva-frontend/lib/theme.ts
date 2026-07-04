import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: {
      defaultProps: { disableRipple: true, disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          // No color shift on hover or active — keep the same background
          "&:hover": { filter: "none" },
          "&:active": { filter: "none" },
        },
      },
    },
    MuiIconButton: {
      defaultProps: { disableRipple: true },
    },
    MuiListItemButton: {
      defaultProps: { disableRipple: true },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& th": {
            backgroundColor: "#F5F5F5",
            fontWeight: 700,
            fontSize: "0.75rem",
            color: "#666",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:last-child td": { borderBottom: 0 },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: "none" },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: "1px solid #e0e0e0" },
      },
    },
  },
});

export default theme;
