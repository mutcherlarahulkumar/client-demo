import { Component, type ErrorInfo, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// Next's own 500 page only covers errors thrown during SSR/build — a crash
// during client-side rendering after the page has hydrated needs an actual
// React error boundary, or the user just sees a blank screen / Next's raw
// dev overlay with no way back into the app.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ error: null });
    window.location.href = "/";
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <Box
          sx={{
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            px: 3,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#FEE2E2",
              color: "error.main",
              mb: 3,
            }}
          >
            <ErrorOutlineIcon fontSize="large" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
            This page ran into an unexpected error. Try reloading — if it keeps happening, let us
            know what you were doing when it broke.
          </Typography>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={this.handleReset}>
            Reload
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
