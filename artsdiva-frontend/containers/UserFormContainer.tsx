import React from "react";
import { useRouter } from "next/router";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { BackLink } from "@artsdiva/components/ui/BackLink";
import { FieldLabel } from "@artsdiva/components/fields/FieldInfo";
import { useCreateUser } from "@artsdiva/hooks/useUsers";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import type { Role } from "@artsdiva/types/auth.types";

const validationSchema = Yup.object({
  name: Yup.string().min(1, "Name is required").required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(8, "At least 8 characters").required("Password is required"),
  role: Yup.mixed<Role>().oneOf(["ADMIN", "STAFF"]).required(),
});

interface FormValues {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const EMPTY: FormValues = { name: "", email: "", password: "", role: "STAFF" };

export function UserFormContainer() {
  const router = useRouter();
  const { showToast } = useToast();
  const createMutation = useCreateUser();

  const handleSubmit = async (values: FormValues) => {
    await createMutation.mutateAsync(values);
    showToast("User created");
    void router.push("/users");
  };

  return (
    <Box sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 720, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <BackLink href="/users" label="Back to Users" />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Add New User</Typography>
      </Box>

      <Formik
        initialValues={EMPTY}
        validationSchema={validationSchema}
        onSubmit={async (values, helpers) => {
          try {
            await handleSubmit(values);
          } catch (err: unknown) {
            helpers.setStatus({ error: err instanceof Error ? err.message : "Failed to create user" });
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting, status }) => (
          <Form>
            <Card elevation={2}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <FieldLabel label="Name" required />
                    <TextField
                      name="name"
                      size="small"
                      fullWidth
                      placeholder="Jordan Rivera"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.name && !!errors.name}
                      helperText={touched.name ? errors.name : undefined}
                    />
                  </Box>

                  <Box>
                    <FieldLabel label="Email" required />
                    <TextField
                      name="email"
                      size="small"
                      fullWidth
                      type="email"
                      placeholder="jordan@artsdiva.com"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && !!errors.email}
                      helperText={touched.email ? errors.email : undefined}
                    />
                  </Box>

                  <Box>
                    <FieldLabel label="Temporary Password" required info="The new user should change this after their first login." />
                    <TextField
                      name="password"
                      size="small"
                      fullWidth
                      type="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.password && !!errors.password}
                      helperText={touched.password ? errors.password : undefined}
                    />
                  </Box>

                  <Box>
                    <FieldLabel label="Role" required info="Admins can manage users and delete records; Staff can create and edit but not delete." />
                    <TextField
                      name="role"
                      size="small"
                      fullWidth
                      select
                      value={values.role}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <MenuItem value="STAFF">Staff</MenuItem>
                      <MenuItem value="ADMIN">Admin</MenuItem>
                    </TextField>
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
                {isSubmitting ? "Saving…" : "Create User"}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
}
