import React from "react";
import { useRouter } from "next/router";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { BackLink } from "@artsdiva/components/ui/BackLink";
import { FieldLabel } from "@artsdiva/components/fields/FieldInfo";
import { useChangePassword } from "@artsdiva/hooks/useUsers";
import { useToast } from "@artsdiva/contexts/ToastProvider";

const validationSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string().min(8, "At least 8 characters").required("New password is required"),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your new password"),
});

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const EMPTY: FormValues = { currentPassword: "", newPassword: "", confirmNewPassword: "" };

export function ChangePasswordContainer() {
  const router = useRouter();
  const { showToast } = useToast();
  const changePasswordMutation = useChangePassword();

  return (
    <Box sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 720, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <BackLink href="/" label="Back to Dashboard" />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Change Password</Typography>
      </Box>

      <Formik
        initialValues={EMPTY}
        validationSchema={validationSchema}
        onSubmit={async (values, helpers) => {
          try {
            await changePasswordMutation.mutateAsync({
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
            });
            showToast("Password changed");
            void router.push("/");
          } catch (err: unknown) {
            helpers.setStatus({ error: err instanceof Error ? err.message : "Failed to change password" });
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting, status }) => (
          <Form>
            <Card elevation={2}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <FieldLabel label="Current Password" required />
                    <TextField
                      name="currentPassword"
                      size="small"
                      fullWidth
                      type="password"
                      value={values.currentPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.currentPassword && !!errors.currentPassword}
                      helperText={touched.currentPassword ? errors.currentPassword : undefined}
                    />
                  </Box>

                  <Box>
                    <FieldLabel label="New Password" required />
                    <TextField
                      name="newPassword"
                      size="small"
                      fullWidth
                      type="password"
                      value={values.newPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.newPassword && !!errors.newPassword}
                      helperText={touched.newPassword ? errors.newPassword : undefined}
                    />
                  </Box>

                  <Box>
                    <FieldLabel label="Confirm New Password" required />
                    <TextField
                      name="confirmNewPassword"
                      size="small"
                      fullWidth
                      type="password"
                      value={values.confirmNewPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.confirmNewPassword && !!errors.confirmNewPassword}
                      helperText={touched.confirmNewPassword ? errors.confirmNewPassword : undefined}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {status?.error && (
              <Alert severity="error" sx={{ mt: 2 }}>{status.error as string}</Alert>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 2.5 }}>
              <Button variant="outlined" onClick={() => void router.back()} disabled={isSubmitting} sx={{ minWidth: 120 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}>
                {isSubmitting ? "Saving…" : "Change Password"}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
}
