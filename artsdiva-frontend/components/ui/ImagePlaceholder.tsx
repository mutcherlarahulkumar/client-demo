import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
}

export function ImageWithFallback({
  src,
  alt,
  width = "100%",
  height = 200,
  borderRadius = 8,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <Box
        sx={{
          width,
          height,
          borderRadius,
          backgroundColor: "#F1F5F9",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: 1, borderColor: "divider",
          gap: 1,
        }}
      >
        <Typography sx={{ fontSize: 36 }}>ðŸ–¼</Typography>
        <Typography variant="caption" sx={{ color: "text.disabled", textAlign: "center", px: 2 }}>
          No image
        </Typography>
      </Box>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      style={{
        width,
        height,
        borderRadius,
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}

