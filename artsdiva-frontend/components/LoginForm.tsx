import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type { FieldErrors } from "@artsdiva/api/http";

interface LoginFormProps {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  fieldErrors: FieldErrors | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

export function LoginForm({
  email,
  password,
  isLoading,
  error,
  fieldErrors,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        px: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 400, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 3 }}>
            ArtsDiva IMS
          </Typography>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Email *"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                error={!!fieldErrors?.email}
                helperText={fieldErrors?.email?.[0]}
                autoComplete="email"
                autoFocus
              />

              <TextField
                label="Password *"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                error={!!fieldErrors?.password}
                helperText={fieldErrors?.password?.[0]}
                autoComplete="current-password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                          size="small"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {error && (
                <Alert severity="error" sx={{ py: 0.5 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isLoading}
                sx={{ mt: 1, fontWeight: 700, letterSpacing: "0.05em" }}
              >
                {isLoading ? "Signing in…" : "SIGN IN"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
