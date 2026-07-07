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
import CircularProgress from "@mui/material/CircularProgress";
import { BackLink } from "@artsdiva/components/ui/BackLink";
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
  commissionPercent: Yup.number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100")
    .required("Commission % is required"),
  commissionTerms: Yup.string().min(1).max(500).required("Commission terms required"),
  mouStatus: Yup.mixed<MouStatus>().oneOf(["SIGNED", "PENDING", "NOT_REQUIRED"]).required(),
  email: Yup.string()
    .transform((v) => (v === "" ? undefined : v))
    .email("Invalid email")
    .test(
      "email-or-phone",
      "Provide an email or a phone number",
      function (value) {
        return Boolean(value || this.parent.phone);
      },
    ),
  phoneCountryCode: Yup.string().matches(PHONE_CODE_RE, "Invalid dial code").optional(),
  phone: Yup.string()
    .transform((v) => (v === "" ? undefined : v))
    .matches(PHONE_RE, "Invalid phone number")
    .test(
      "email-or-phone",
      "Provide an email or a phone number",
      function (value) {
        return Boolean(value || this.parent.email);
      },
    ),
  address: Yup.string().max(500).optional(),
});

interface FormValues {
  name: string;
  bio: string;
  commissionPercent: string;
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
  commissionPercent: "",
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
  // Optional ?name= prefill (e.g. handed over from another form).
  const prefillName = typeof router.query.name === "string" ? router.query.name : "";

  if (isEdit && artistLoading) return <SkeletonDetailCard />;

  const initialValues: FormValues = artist
    ? {
        name: artist.name,
        bio: artist.bio ?? "",
        commissionPercent: artist.commissionPercent != null ? String(artist.commissionPercent) : "",
        commissionTerms: artist.commissionTerms,
        mouStatus: artist.mouStatus,
        email: artist.contactInfo?.email ?? "",
        phoneCountryCode: artist.contactInfo?.phoneCountryCode ?? "+91",
        phone: artist.contactInfo?.phone ?? "",
        address: artist.contactInfo?.address ?? "",
      }
    : { ...EMPTY, name: prefillName };

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
      commissionPercent: Number(values.commissionPercent),
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
    <Box sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 720, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <BackLink
          href={artistId ? `/artists/${artistId}` : "/artists"}
          label={isEdit ? "Back to Artist" : "Back to Artists"}
        />
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
            <Card elevation={2}>
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

                  {/* Commission % + MOU Status side by side */}
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <FieldLabel label="Artist Share (%)" required info="The artist's percentage of sale/lease revenue. Example: 70 for a 70/30 split (artist keeps 70%, gallery keeps 30%)." />
                      <TextField
                        name="commissionPercent"
                        size="small"
                        fullWidth
                        type="number"
                        placeholder="70"
                        value={values.commissionPercent}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.commissionPercent && !!errors.commissionPercent}
                        helperText={touched.commissionPercent ? errors.commissionPercent : undefined}
                        slotProps={{ htmlInput: { min: 0, max: 100, step: "0.5" } }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <FieldLabel label="MOU Status" required info="Whether a Memorandum of Understanding (the agreement covering commission and exhibition terms) is signed with this artist yet." />
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

                  {/* Freeform commission notes alongside the structured % */}
                  <Box>
                    <FieldLabel label="Commission Terms" required info="Freeform notes on the agreement — payment schedule, exceptions, special conditions. Example: 70/30 split, paid within 30 days of sale" />
                    <TextField
                      name="commissionTerms"
                      size="small"
                      fullWidth
                      placeholder="70/30 split, paid within 30 days of sale"
                      value={values.commissionTerms}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.commissionTerms && !!errors.commissionTerms}
                      helperText={touched.commissionTerms ? errors.commissionTerms : undefined}
                    />
                  </Box>

                  <Divider />

                  {/* Contact section */}
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Contact Information (email or phone required)
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

            <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 2.5 }}>
              <Button variant="outlined" onClick={() => void router.back()} disabled={isSubmitting} sx={{ minWidth: 120 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}>
                {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Artist"}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
}



