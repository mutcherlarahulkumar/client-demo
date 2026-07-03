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
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useArtwork, useCreateArtwork, useUpdateArtwork } from "@artsdiva/hooks/useArtworks";
import { ArtistAutocomplete } from "@artsdiva/components/fields/ArtistAutocomplete";
import { DimensionsInput } from "@artsdiva/components/fields/DimensionsInput";
import { YearPickerField } from "@artsdiva/components/fields/YearPickerField";
import { FieldLabel } from "@artsdiva/components/fields/FieldInfo";
import { SkeletonDetailCard } from "@artsdiva/components/ui/SkeletonTable";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import { useAuth } from "@artsdiva/hooks/useAuth";
import type { ArtworkStatus } from "@artsdiva/types/artwork.types";
import type { Dimensions } from "@artsdiva/types/common.types";

const validationSchema = Yup.object({
  title: Yup.string().min(1, "Required").max(200, "Too long").required("Title is required"),
  artistId: Yup.string().required("Artist is required"),
  medium: Yup.string().min(1, "Required").max(200, "Too long").required("Medium is required"),
  dimensions: Yup.object({
    width: Yup.number().positive("Must be > 0").max(10000).required("Width required"),
    height: Yup.number().positive("Must be > 0").max(10000).required("Height required"),
    unit: Yup.mixed().oneOf(["cm", "in", "mm"]).required(),
  }).required(),
  year: Yup.number()
    .integer("Must be a whole year")
    .min(1800, "Must be 1800 or later")
    .max(new Date().getFullYear(), "Cannot be in the future")
    .required("Year is required")
    .nullable(),
  acquisitionDate: Yup.string().required("Acquisition date is required"),
  status: Yup.mixed<ArtworkStatus>().oneOf(["IN_COLLECTION", "ON_LEASE", "SOLD"]).required(),
  notes: Yup.string().max(2000, "Too long").optional(),
});

interface FormValues {
  title: string;
  artistId: string;
  medium: string;
  dimensions: Partial<Dimensions>;
  year: number | null;
  acquisitionDate: string;
  status: ArtworkStatus;
  notes: string;
}

const EMPTY: FormValues = {
  title: "",
  artistId: "",
  medium: "",
  dimensions: { unit: "cm" },
  year: null,
  acquisitionDate: "",
  status: "IN_COLLECTION",
  notes: "",
};

interface ArtworkFormContainerProps {
  artworkId?: string;
}

export function ArtworkFormContainer({ artworkId }: ArtworkFormContainerProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isEdit = Boolean(artworkId);

  const { data: artwork, isLoading: artworkLoading } = useArtwork(artworkId);
  const createMutation = useCreateArtwork();
  const updateMutation = useUpdateArtwork(artworkId ?? "");

  // Pre-fill artistId: from "Add Artwork" on Artist detail, or returning from creating a new artist
  const prefillArtistId =
    (typeof router.query.artistId === "string" ? router.query.artistId : undefined) ??
    (typeof router.query.autoArtistId === "string" ? router.query.autoArtistId : undefined);
  const redirectTo = typeof router.query.redirectTo === "string" ? router.query.redirectTo : undefined;

  if (isEdit && artworkLoading) {
    return <SkeletonDetailCard />;
  }

  const initialValues: FormValues = artwork
    ? {
        title: artwork.title,
        artistId: artwork.artistId,
        medium: artwork.medium,
        dimensions: artwork.dimensions,
        year: artwork.year,
        acquisitionDate: artwork.acquisitionDate.slice(0, 10),
        status: artwork.status,
        notes: artwork.notes ?? "",
      }
    : { ...EMPTY, artistId: prefillArtistId ?? "" };

  const handleSubmit = async (values: FormValues) => {
    const payload = {
      title: values.title,
      artistId: values.artistId,
      medium: values.medium,
      dimensions: values.dimensions as Dimensions,
      year: values.year!,
      acquisitionDate: values.acquisitionDate,
      status: values.status,
      notes: values.notes || undefined,
    };

    try {
      const saved = isEdit
        ? await updateMutation.mutateAsync(payload)
        : await createMutation.mutateAsync(payload);

      showToast(isEdit ? "Artwork updated" : "Artwork created");

      if (redirectTo) {
        void router.push(`${redirectTo}?autoArtworkId=${saved.id}`);
      } else {
        void router.push(`/artworks/${saved.id}`);
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 860 }}>
      <Box sx={{ mb: 3 }}>
        <Link href={artworkId ? `/artworks/${artworkId}` : "/artworks"} style={{ textDecoration: "none" }}>
          <Typography variant="body2" sx={{ color: "#94A3B8", mb: 0.5, cursor: "pointer", "&:hover": { color: "#4F46E5" } }}>
            ← {isEdit ? "Back to Artwork" : "Back to Artworks"}
          </Typography>
        </Link>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A" }}>
          {isEdit ? `Edit: ${artwork?.title ?? ""}` : "Add New Artwork"}
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
            const msg = err instanceof Error ? err.message : "Failed to save artwork";
            helpers.setStatus({ error: msg });
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, status }) => (
          <Form>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Details */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: "#64748B", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Artwork Details
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box>
                      <FieldLabel label="Title" description="The official title of the artwork as given by the artist." required isAdmin={isAdmin} />
                      <TextField name="title" size="small" fullWidth placeholder="Sunset IV" value={values.title} onChange={handleChange} onBlur={handleBlur} error={touched.title && !!errors.title} helperText={touched.title && errors.title} />
                    </Box>

                    <Box>
                      <FieldLabel label="Artist" description="The artist who created this work. Type to search. If not listed, create them first." required isAdmin={isAdmin} />
                      <ArtistAutocomplete
                        value={values.artistId}
                        onChange={(id) => void setFieldValue("artistId", id)}
                        error={touched.artistId ? errors.artistId : undefined}
                        redirectOnCreate={`/artworks/${artworkId ? artworkId + "/edit" : "new"}`}
                      />
                    </Box>

                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <FieldLabel label="Medium" description="The materials or technique used, e.g. 'Oil on canvas', 'Watercolour', 'Mixed media'." required isAdmin={isAdmin} />
                        <TextField name="medium" size="small" fullWidth placeholder="Oil on canvas" value={values.medium} onChange={handleChange} onBlur={handleBlur} error={touched.medium && !!errors.medium} helperText={touched.medium && errors.medium} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <FieldLabel label="Year Created" description="The year the artwork was completed by the artist." required isAdmin={isAdmin} />
                        <YearPickerField
                          value={values.year}
                          onChange={(y) => void setFieldValue("year", y)}
                          error={touched.year ? (errors.year as string) : undefined}
                        />
                      </Box>
                    </Box>

                    <Box>
                      <FieldLabel
                        label="Dimensions"
                        description="Physical size of the artwork. Enter Width × Height and the unit (cm, in, or mm). This is used for shipping estimates, wall planning, and catalogue listings."
                        required
                        isAdmin={isAdmin}
                      />
                      <DimensionsInput
                        value={values.dimensions}
                        onChange={(val) => void setFieldValue("dimensions", val)}
                        errors={{
                          width: touched.dimensions ? (errors.dimensions as { width?: string })?.width : undefined,
                          height: touched.dimensions ? (errors.dimensions as { height?: string })?.height : undefined,
                          unit: touched.dimensions ? (errors.dimensions as { unit?: string })?.unit : undefined,
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Acquisition & Status */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: "#64748B", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Acquisition &amp; Status
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <FieldLabel label="Acquisition Date" description="The date ArtsDiva acquired or accepted this artwork into the collection." required isAdmin={isAdmin} />
                      <DatePicker
                        value={values.acquisitionDate ? dayjs(values.acquisitionDate) : null}
                        onChange={(val) => void setFieldValue("acquisitionDate", val ? val.format("YYYY-MM-DD") : "")}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            error: touched.acquisitionDate && !!errors.acquisitionDate,
                            helperText: touched.acquisitionDate && errors.acquisitionDate,
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <FieldLabel label="Status" description="Current status: In Collection (physically held), On Lease (at a client's location), or Sold (transferred ownership)." required isAdmin={isAdmin} />
                      <TextField name="status" size="small" fullWidth select value={values.status} onChange={handleChange} error={touched.status && !!errors.status} helperText={touched.status && errors.status}>
                        <MenuItem value="IN_COLLECTION">🟢 In Collection</MenuItem>
                        <MenuItem value="ON_LEASE">🔵 On Lease</MenuItem>
                        <MenuItem value="SOLD">🟡 Sold</MenuItem>
                      </TextField>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <FieldLabel label="Notes" description="Internal notes about this artwork — condition, provenance, exhibition history, etc." isAdmin={isAdmin} />
                    <TextField name="notes" size="small" fullWidth multiline rows={3} placeholder="Internal notes..." value={values.notes} onChange={handleChange} onBlur={handleBlur} error={touched.notes && !!errors.notes} helperText={touched.notes && errors.notes} />
                  </Box>
                </CardContent>
              </Card>

              {status?.error && <Alert severity="error">{status.error as string}</Alert>}
              <Divider />

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
                <Button variant="outlined" onClick={() => void router.back()} disabled={isSubmitting} sx={{ color: "#64748B", borderColor: "#E2E8F0" }}>Cancel</Button>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Artwork"}
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
