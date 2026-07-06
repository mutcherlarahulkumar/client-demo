import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import HomeIcon from "@mui/icons-material/Home";

export default function NotFoundPage() {
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
          bgcolor: "rgba(25, 118, 210, 0.08)",
          color: "primary.main",
          mb: 3,
        }}
      >
        <SearchOffIcon fontSize="large" />
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
        404
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        Page not found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        The page you're looking for doesn't exist, may have been moved, or the link might be
        outdated.
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button variant="outlined" onClick={() => void router.back()}>
          Go Back
        </Button>
        <Button variant="contained" startIcon={<HomeIcon />} onClick={() => void router.push("/")}>
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
}
