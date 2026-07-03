import React from "react";
import { useRouter } from "next/router";
import { Formik, Form } from "formik";
import * as Yup from "yup";
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
import type { MouStatus } from "@artsdiva/types/artist.types";

const PHONE_CODE_RE = /^\+\d{1,4}$/;
const PHONE_RE = /^[\d\s\-().]{6,15}$/;

const validationSchema = Yup.object({
  name: Yup.string().min(2, "At least 2 characters").max(150).required("Name is required"),
  bio: Yup.string().max(5000).optional(),
  commissionTerms: Yup.string().min(1).max(500).required("Commission terms required"),
  mouStatus: Yup.mixed<MouStatus>().oneOf(["SIGNED", "PENDING", "NOT_REQUIRED"]).required(),
  email: Yup.string().transform((v) => (v === "" ? undefined : v)).email("Invalid email").optional(),
  phoneCountryCode: Yup.string().matches(PHONE_CODE_RE, "Invalid dial code").optional(),
  phone: Yup.string().transform((v) => (v === "" ? undefined : v)).matches(PHONE_RE, "Invalid phone number").optional(),
  address: Yup.string().max(500).optional(),
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
  const isEdit = Boolean(artistId);

  const { data: artist, isLoading: artistLoading } = useArtist(artistId);
  const createMutation = useCreateArtist();
  const updateMutation = useUpdateArtist(artistId ?? "");

  const redirectTo = typeof router.query.redirectTo === "string" ? router.query.redirectTo : undefined;

  if (isEdit && artistLoading) return <SkeletonDetailCard />;

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

    const saved = isEdit
      ? await updateMutation.mutateAsync(payload)
      : await createMutation.mutateAsync(payload);

    showToast(isEdit ? "Artist updated" : "Artist created");

    if (redirectTo) {
      void router.push(`${redirectTo}?autoArtistId=${saved.id}`);
    } else {
      void router.push(`/artists/${saved.id}`);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 720 }}>
      <Box sx={{ mb: 3 }}>
        <Link href={artistId ? `/artists/${artistId}` : "/artists"} style={{ textDecoration: "none" }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, "&:hover": { textDecoration: "underline" } }}>
            â† {isEdit ? "Back to Artist" : "Back to Artists"}
          </Typography>
        </Link>
        <Typography variant="h5">{isEdit ? `Edit: ${artist?.name ?? ""}` : "Add New Artist"}</Typography>
      </Box>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={async (values, helpers) => {
          try {
            await handleSubmit(values);
          } catch (err: unknown) {
            helpers.setStatus({ error: err instanceof Error ? err.message : "Failed to save artist" });
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, status }) => (
          <Form>
            <Card variant="outlined">
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Name */}
                  <Box>
                    <FieldLabel label="Name" required />
                    <TextField
                      name="name"
                      size="small"
                      fullWidth
                      placeholder="Sarah Collins"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.name && !!errors.name}
                      helperText={touched.name ? errors.name : undefined}
                    />
                  </Box>

                  {/* Commission Terms + MOU Status side by side */}
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <FieldLabel label="Commission Terms" required />
                      <TextField
                        name="commissionTerms"
                        size="small"
                        fullWidth
                        placeholder="30% on sale"
                        value={values.commissionTerms}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.commissionTerms && !!errors.commissionTerms}
                        helperText={touched.commissionTerms ? errors.commissionTerms : undefined}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <FieldLabel label="MOU Status" required />
                      <TextField
                        name="mouStatus"
                        size="small"
                        fullWidth
                        select
                        value={values.mouStatus}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.mouStatus && !!errors.mouStatus}
                        helperText={touched.mouStatus ? errors.mouStatus : undefined}
                      >
                        <MenuItem value="SIGNED">Signed</MenuItem>
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="NOT_REQUIRED">Not Required</MenuItem>
                      </TextField>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Contact section */}
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Contact Information
                  </Typography>

                  <Box>
                    <FieldLabel label="Email" />
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
                      helperText={touched.email ? errors.email : undefined}
                    />
                  </Box>

                  <Box>
                    <FieldLabel label="Phone" />
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
                    <FieldLabel label="Address" />
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
                      helperText={touched.address ? errors.address : undefined}
                    />
                  </Box>

                  <Divider />

                  {/* Bio */}
                  <Box>
                    <FieldLabel label="Bio" />
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
                      helperText={touched.bio ? errors.bio : undefined}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {status?.error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {status.error as string}
              </Alert>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2.5 }}>
              <Button variant="outlined" onClick={() => void router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? "Savingâ€¦" : isEdit ? "Save Changes" : "Create Artist"}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

