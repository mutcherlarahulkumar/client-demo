import React from "react";
import { useRouter } from "next/router";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import Link from "next/link";
import { useClient, useCreateClient, useUpdateClient } from "@artsdiva/hooks/useClients";
import { PhoneInputField } from "@artsdiva/components/fields/PhoneInputField";
import { FieldLabel } from "@artsdiva/components/fields/FieldInfo";
import { SkeletonDetailCard } from "@artsdiva/components/ui/SkeletonTable";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import { useAuth } from "@artsdiva/hooks/useAuth";

const PHONE_CODE_RE = /^\+\d{1,4}$/;
const PHONE_RE = /^[\d\s\-().]{6,15}$/;

const validationSchema = Yup.object({
  name: Yup.string().min(2, "At least 2 characters").max(150, "Too long").required("Name is required"),
  email: Yup.string().transform((v) => v === "" ? undefined : v).email("Invalid email").optional(),
  phoneCountryCode: Yup.string().matches(PHONE_CODE_RE, "Invalid dial code").optional(),
  phone: Yup.string().transform((v) => v === "" ? undefined : v).matches(PHONE_RE, "Invalid phone number").optional(),
  address: Yup.string().max(500, "Too long").optional(),
  preferences: Yup.string().max(2000, "Too long").optional(),
  notes: Yup.string().max(2000, "Too long").optional(),
});

interface FormValues {
  name: string;
  email: string;
  phoneCountryCode: string;
  phone: string;
  address: string;
  preferences: string;
  notes: string;
}

const EMPTY: FormValues = {
  name: "",
  email: "",
  phoneCountryCode: "+91",
  phone: "",
  address: "",
  preferences: "",
  notes: "",
};

interface ClientFormContainerProps {
  clientId?: string;
}

export function ClientFormContainer({ clientId }: ClientFormContainerProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isEdit = Boolean(clientId);

  const { data: client, isLoading: clientLoading } = useClient(clientId);
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient(clientId ?? "");

  if (isEdit && clientLoading) {
    return <SkeletonDetailCard />;
  }

  const initialValues: FormValues = client
    ? {
        name: client.name,
        email: client.contactInfo?.email ?? "",
        phoneCountryCode: client.contactInfo?.phoneCountryCode ?? "+91",
        phone: client.contactInfo?.phone ?? "",
        address: client.contactInfo?.address ?? "",
        preferences: client.preferences ?? "",
        notes: client.notes ?? "",
      }
    : EMPTY;

  const handleSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      contactInfo: {
        email: values.email || undefined,
        phoneCountryCode: values.phoneCountryCode || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
      },
      preferences: values.preferences || undefined,
      notes: values.notes || undefined,
    };

    try {
      const saved = isEdit
        ? await updateMutation.mutateAsync(payload)
        : await createMutation.mutateAsync(payload);

      showToast(isEdit ? "Client updated" : "Client created");
      void router.push(`/clients/${saved.id}`);
    } catch (err) {
      throw err;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 860 }}>
      <Box sx={{ mb: 3 }}>
        <Link href={clientId ? `/clients/${clientId}` : "/clients"} style={{ textDecoration: "none" }}>
          <Typography variant="body2" sx={{ color: "#94A3B8", mb: 0.5, cursor: "pointer", "&:hover": { color: "#4F46E5" } }}>
            ← {isEdit ? "Back to Client" : "Back to Clients"}
          </Typography>
        </Link>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A" }}>
          {isEdit ? `Edit: ${client?.name ?? ""}` : "Add New Client"}
        </Typography>
      </Box>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={async (values, helpers) => {
          try {
            await handleSubmit(values);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to save client";
            helpers.setStatus({ error: msg });
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, status }) => (
          <Form>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Contact Info */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: "#64748B", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Contact Info
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box>
                      <FieldLabel label="Name" description="The client's full name or organisation name." required isAdmin={isAdmin} />
                      <TextField name="name" size="small" fullWidth placeholder="James Okoro" value={values.name} onChange={handleChange} onBlur={handleBlur} error={touched.name && !!errors.name} helperText={touched.name && errors.name} />
                    </Box>

                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <FieldLabel label="Email" description="Primary contact email for lease correspondence and invoicing." isAdmin={isAdmin} />
                        <TextField name="email" size="small" fullWidth type="email" placeholder="james@example.com" value={values.email} onChange={handleChange} onBlur={handleBlur} error={touched.email && !!errors.email} helperText={touched.email && errors.email} />
                      </Box>
                    </Box>

                    <Box>
                      <FieldLabel label="Phone" description="Client's contact number. Select country dial code first." isAdmin={isAdmin} />
                      <PhoneInputField
                        countryCode={values.phoneCountryCode}
                        phone={values.phone}
                        onCountryCodeChange={(val) => void setFieldValue("phoneCountryCode", val)}
                        onPhoneChange={(val) => void setFieldValue("phone", val)}
                        countryCodeError={touched.phoneCountryCode ? errors.phoneCountryCode : undefined}
                        phoneError={touched.phone ? errors.phone : undefined}
                      />
                    </Box>

                    <Box>
                      <FieldLabel label="Address" description="Client's billing or delivery address." isAdmin={isAdmin} />
                      <TextField name="address" size="small" fullWidth multiline rows={2} placeholder="5 Park Row, Manchester M3 3AX" value={values.address} onChange={handleChange} onBlur={handleBlur} error={touched.address && !!errors.address} helperText={touched.address && errors.address} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Profile */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: "#64748B", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Profile
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box>
                      <FieldLabel label="Preferences" description="Art style, medium, or subject preferences. Helps match this client to relevant artworks." isAdmin={isAdmin} />
                      <TextField name="preferences" size="small" fullWidth multiline rows={3} placeholder="Contemporary abstract, large format works..." value={values.preferences} onChange={handleChange} onBlur={handleBlur} error={touched.preferences && !!errors.preferences} helperText={touched.preferences && errors.preferences} />
                    </Box>
                    <Box>
                      <FieldLabel label="Notes" description="Internal notes — payment history, special requirements, relationship context." isAdmin={isAdmin} />
                      <TextField name="notes" size="small" fullWidth multiline rows={3} placeholder="Internal notes about this client..." value={values.notes} onChange={handleChange} onBlur={handleBlur} error={touched.notes && !!errors.notes} helperText={touched.notes && errors.notes} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {status?.error && <Alert severity="error">{status.error as string}</Alert>}
              <Divider />

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
                <Button variant="outlined" onClick={() => void router.back()} disabled={isSubmitting} sx={{ color: "#64748B", borderColor: "#E2E8F0" }}>Cancel</Button>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Client"}
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
}
