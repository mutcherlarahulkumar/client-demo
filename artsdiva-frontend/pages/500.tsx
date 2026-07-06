import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import HomeIcon from "@mui/icons-material/Home";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function ServerErrorPage() {
  const router = useRouter();

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
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
        500
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        Something went wrong on our end
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        The server hit an unexpected error. It's not something you did — try again in a moment,
        and reach out if it keeps happening.
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => router.reload()}>
          Try Again
        </Button>
        <Button variant="contained" startIcon={<HomeIcon />} onClick={() => void router.push("/")}>
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
}
