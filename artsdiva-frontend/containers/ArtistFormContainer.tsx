import React from "react";
import { useRouter } from "next/router";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import Link from "next/link";
import { useArtist, useCreateArtist, useUpdateArtist } from "@artsdiva/hooks/useArtists";
import { PhoneInputField } from "@artsdiva/components/fields/PhoneInputField";
import { FieldLabel } from "@artsdiva/components/fields/FieldInfo";
import { SkeletonDetailCard } from "@artsdiva/components/ui/SkeletonTable";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import { useAuth } from "@artsdiva/hooks/useAuth";
import type { MouStatus } from "@artsdiva/types/artist.types";

const PHONE_CODE_RE = /^\+\d{1,4}$/;
const PHONE_RE = /^[\d\s\-().]{6,15}$/;

const validationSchema = Yup.object({
  name: Yup.string().min(2, "At least 2 characters").max(150, "Too long").required("Name is required"),
  bio: Yup.string().max(5000, "Too long").optional(),
  commissionTerms: Yup.string().min(1, "Required").max(500, "Too long").required("Commission terms required"),
  mouStatus: Yup.mixed<MouStatus>().oneOf(["SIGNED", "PENDING", "NOT_REQUIRED"]).required(),
  email: Yup.string().transform((v) => v === "" ? undefined : v).email("Invalid email").optional(),
  phoneCountryCode: Yup.string().matches(PHONE_CODE_RE, "Invalid dial code (e.g. +91)").optional(),
  phone: Yup.string().transform((v) => v === "" ? undefined : v).matches(PHONE_RE, "Invalid phone number").optional(),
  address: Yup.string().max(500, "Too long").optional(),
});

interface FormValues {
  name: string;
  bio: string;
  commissionTerms: string;
  mouStatus: MouStatus;
  email: string;
  phoneCountryCode: string;
  phone: string;
  address: string;
}

const EMPTY: FormValues = {
  name: "",
  bio: "",
  commissionTerms: "",
  mouStatus: "PENDING",
  email: "",
  phoneCountryCode: "+91",
  phone: "",
  address: "",
};

interface ArtistFormContainerProps {
  artistId?: string;
}

export function ArtistFormContainer({ artistId }: ArtistFormContainerProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isEdit = Boolean(artistId);

  const { data: artist, isLoading: artistLoading } = useArtist(artistId);
  const createMutation = useCreateArtist();
  const updateMutation = useUpdateArtist(artistId ?? "");

  // Handle redirect-back param (when navigating here from Artwork form)
  const redirectTo = typeof router.query.redirectTo === "string" ? router.query.redirectTo : undefined;

  if (isEdit && artistLoading) {
    return <SkeletonDetailCard />;
  }

  const initialValues: FormValues = artist
    ? {
        name: artist.name,
        bio: artist.bio ?? "",
        commissionTerms: artist.commissionTerms,
        mouStatus: artist.mouStatus,
        email: artist.contactInfo?.email ?? "",
        phoneCountryCode: artist.contactInfo?.phoneCountryCode ?? "+91",
        phone: artist.contactInfo?.phone ?? "",
        address: artist.contactInfo?.address ?? "",
      }
    : EMPTY;

  const handleSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      bio: values.bio || undefined,
      contactInfo: {
        email: values.email || undefined,
        phoneCountryCode: values.phoneCountryCode || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
      },
      commissionTerms: values.commissionTerms,
      mouStatus: values.mouStatus,
    };

    try {
      const saved = isEdit
        ? await updateMutation.mutateAsync(payload)
        : await createMutation.mutateAsync(payload);

      showToast(isEdit ? "Artist updated" : "Artist created");

      if (redirectTo) {
        // Redirect back with the new artist ID so autocomplete can auto-select
        void router.push(`${redirectTo}?autoArtistId=${saved.id}`);
      } else {
        void router.push(`/artists/${saved.id}`);
      }
    } catch (err: unknown) {
      throw err; // Formik will catch and show via status
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 860 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Link href={artistId ? `/artists/${artistId}` : "/artists"} style={{ textDecoration: "none" }}>
          <Typography variant="body2" sx={{ color: "#94A3B8", mb: 0.5, cursor: "pointer", "&:hover": { color: "#4F46E5" } }}>
            ← {isEdit ? "Back to Artist" : "Back to Artists"}
          </Typography>
        </Link>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A" }}>
          {isEdit ? `Edit: ${artist?.name ?? ""}` : "Add New Artist"}
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
            const msg = err instanceof Error ? err.message : "Failed to save artist";
            helpers.setStatus({ error: msg });
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, status }) => (
          <Form>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Profile section */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: "#64748B", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Profile
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box>
                      <FieldLabel
                        label="Name"
                        description="The artist's full legal or professional name as it appears in their portfolio."
                        required
                        isAdmin={isAdmin}
                      />
                      <TextField
                        name="name"
                        size="small"
                        fullWidth
                        placeholder="Sarah Collins"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.name && !!errors.name}
                        helperText={touched.name && errors.name}
                      />
                    </Box>

                    <Box>
                      <FieldLabel
                        label="Bio"
                        description="A short biography of the artist — their background, style, and notable works. Shown on their profile."
                        isAdmin={isAdmin}
                      />
                      <TextField
                        name="bio"
                        size="small"
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Tell us about this artist's style, background, and achievements..."
                        value={values.bio}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.bio && !!errors.bio}
                        helperText={touched.bio && errors.bio}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Contact section */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: "#64748B", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Contact Info
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box>
                      <FieldLabel label="Email" description="Artist's primary contact email for correspondence." isAdmin={isAdmin} />
                      <TextField
                        name="email"
                        size="small"
                        fullWidth
                        type="email"
                        placeholder="sarah@example.com"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && !!errors.email}
                        helperText={touched.email && errors.email}
                      />
                    </Box>

                    <Box>
                      <FieldLabel label="Phone" description="Artist's contact phone number. Select the country dial code first." isAdmin={isAdmin} />
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
                      <FieldLabel label="Address" description="Artist's studio or mailing address." isAdmin={isAdmin} />
                      <TextField
                        name="address"
                        size="small"
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="12 Studio Lane, London EC1A 1BB"
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.address && !!errors.address}
                        helperText={touched.address && errors.address}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Terms & Status */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: "#64748B", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Terms &amp; Status
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <FieldLabel
                        label="Commission Terms"
                        description="The percentage or flat fee ArtsDiva earns on each sale or lease of this artist's works."
                        required
                        isAdmin={isAdmin}
                      />
                      <TextField
                        name="commissionTerms"
                        size="small"
                        fullWidth
                        placeholder="30% on sale"
                        value={values.commissionTerms}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.commissionTerms && !!errors.commissionTerms}
                        helperText={touched.commissionTerms && errors.commissionTerms}
                      />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <FieldLabel
                        label="MOU Status"
                        description="Memorandum of Understanding status — whether a formal agreement has been signed with this artist."
                        required
                        isAdmin={isAdmin}
                      />
                      <TextField
                        name="mouStatus"
                        size="small"
                        fullWidth
                        select
                        value={values.mouStatus}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.mouStatus && !!errors.mouStatus}
                        helperText={touched.mouStatus && errors.mouStatus}
                      >
                        <MenuItem value="SIGNED">✅ Signed</MenuItem>
                        <MenuItem value="PENDING">🕐 Pending</MenuItem>
                        <MenuItem value="NOT_REQUIRED">➖ Not Required</MenuItem>
                      </TextField>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Error + Submit */}
              {status?.error && (
                <Alert severity="error">{status.error as string}</Alert>
              )}

              <Divider />

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
                <Button
                  variant="outlined"
                  onClick={() => void router.back()}
                  disabled={isSubmitting}
                  sx={{ color: "#64748B", borderColor: "#E2E8F0" }}
                >
                  Cancel
                </Button>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Artist"}
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
