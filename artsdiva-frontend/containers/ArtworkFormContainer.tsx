import React from "react";
import { useRouter } from "next/router";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { BackLink } from "@artsdiva/components/ui/BackLink";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useArtwork, useCreateArtwork, useUpdateArtwork } from "@artsdiva/hooks/useArtworks";
import { ArtistSelect } from "@artsdiva/components/fields/ArtistSelect";
import { DimensionsInput } from "@artsdiva/components/fields/DimensionsInput";
import { YearPickerField } from "@artsdiva/components/fields/YearPickerField";
import { FieldLabel } from "@artsdiva/components/fields/FieldInfo";
import { SkeletonDetailCard } from "@artsdiva/components/ui/SkeletonTable";
import { StatusBadge } from "@artsdiva/components/ui/StatusBadge";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import type { Dimensions } from "@artsdiva/types/common.types";

const validationSchema = Yup.object({
  title: Yup.string().min(1).max(200).required("Title is required"),
  artistId: Yup.string().required("Artist is required"),
  medium: Yup.string().min(1).max(200).required("Medium is required"),
  dimensions: Yup.object({
    width: Yup.number().positive("Must be > 0").max(10000).required("Width required"),
    height: Yup.number().positive("Must be > 0").max(10000).required("Height required"),
    unit: Yup.mixed().oneOf(["cm", "in", "mm"]).required(),
  }).required(),
  year: Yup.number()
    .integer()
    .min(1800)
    .max(new Date().getFullYear(), "Cannot be in the future")
    .required("Year is required")
    .nullable(),
  acquisitionDate: Yup.string().required("Acquisition date is required"),
  notes: Yup.string().max(2000).optional(),
});

interface FormValues {
  title: string;
  artistId: string;
  medium: string;
  dimensions: Partial<Dimensions>;
  year: number | null;
  acquisitionDate: string;
  notes: string;
}

const EMPTY: FormValues = {
  title: "",
  artistId: "",
  medium: "",
  dimensions: { unit: "cm" },
  year: null,
  acquisitionDate: "",
  notes: "",
};

interface ArtworkFormContainerProps {
  artworkId?: string;
}

export function ArtworkFormContainer({ artworkId }: ArtworkFormContainerProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEdit = Boolean(artworkId);

  const { data: artwork, isLoading: artworkLoading } = useArtwork(artworkId);
  const createMutation = useCreateArtwork();
  const updateMutation = useUpdateArtwork(artworkId ?? "");

  const prefillArtistId =
    (typeof router.query.artistId === "string" ? router.query.artistId : undefined) ??
    (typeof router.query.autoArtistId === "string" ? router.query.autoArtistId : undefined);
  const redirectTo = typeof router.query.redirectTo === "string" ? router.query.redirectTo : undefined;

  if (isEdit && artworkLoading) return <SkeletonDetailCard />;

  const initialValues: FormValues = artwork
    ? {
        title: artwork.title,
        artistId: prefillArtistId ?? artwork.artistId,
        medium: artwork.medium,
        dimensions: artwork.dimensions,
        year: artwork.year,
        acquisitionDate: artwork.acquisitionDate.slice(0, 10),
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
      notes: values.notes || undefined,
    };

    const saved = isEdit
      ? await updateMutation.mutateAsync(payload)
      : await createMutation.mutateAsync(payload);

    showToast(isEdit ? "Artwork updated" : "Artwork created");

    if (redirectTo) {
      void router.push(`${redirectTo}?autoArtworkId=${saved.id}`);
    } else {
      void router.push(`/artworks/${saved.id}`);
    }
  };

  return (
    <Box sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 720, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <BackLink
          href={artworkId ? `/artworks/${artworkId}` : "/artworks"}
          label={isEdit ? "Back to Artwork" : "Back to Artworks"}
        />
        <Typography variant="h5">{isEdit ? `Edit: ${artwork?.title ?? ""}` : "Add New Artwork"}</Typography>
      </Box>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={async (values, helpers) => {
          try {
            await handleSubmit(values);
          } catch (err: unknown) {
            helpers.setStatus({ error: err instanceof Error ? err.message : "Failed to save artwork" });
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, status }) => (
          <Form>
            <Card elevation={2}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Title */}
                  <Box>
                    <FieldLabel label="Title" required />
                    <TextField
                      name="title"
                      size="small"
                      fullWidth
                      placeholder="Sunset IV"
                      value={values.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.title && !!errors.title}
                      helperText={touched.title ? errors.title : undefined}
                    />
                  </Box>

                  {/* Artist */}
                  <Box>
                    <FieldLabel label="Artist" required />
                    <ArtistSelect
                      value={values.artistId}
                      onChange={(id) => void setFieldValue("artistId", id)}
                      error={touched.artistId ? errors.artistId : undefined}
                      redirectOnCreate={`/artworks/${artworkId ? artworkId + "/edit" : "new"}`}
                    />
                  </Box>

                  {/* Medium + Year */}
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <FieldLabel label="Medium" required info="The materials and surface used. Example: Oil on canvas, Bronze, Watercolour on paper" />
                      <TextField
                        name="medium"
                        size="small"
                        fullWidth
                        placeholder="Oil on canvas"
                        value={values.medium}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.medium && !!errors.medium}
                        helperText={touched.medium ? errors.medium : undefined}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <FieldLabel label="Year Created" required />
                      <YearPickerField
                        value={values.year}
                        onChange={(y) => void setFieldValue("year", y)}
                        error={touched.year ? (errors.year as string) : undefined}
                      />
                    </Box>
                  </Box>

                  {/* Dimensions */}
                  <Box>
                    <FieldLabel label="Dimensions" required info="Physical size of the artwork as width by height. Example: 60 x 90 cm" />
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

                  <Divider />

                  {/* Acquisition Date + Status */}
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <FieldLabel label="Acquisition Date" required info="The date the gallery received or purchased this artwork, not the date it was painted." />
                      <DatePicker
                        value={values.acquisitionDate ? dayjs(values.acquisitionDate) : null}
                        onChange={(val) => void setFieldValue("acquisitionDate", val ? val.format("YYYY-MM-DD") : "")}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            error: touched.acquisitionDate && !!errors.acquisitionDate,
                            helperText: touched.acquisitionDate ? errors.acquisitionDate : undefined,
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <FieldLabel label="Status" info="Status is managed from the artwork page: lease it to a client to put it on lease, or use Mark as Sold. New artworks start in the collection." />
                      {isEdit && artwork ? (
                        <Box sx={{ pt: 0.75 }}>
                          <StatusBadge type="artwork" status={artwork.status} />
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
                          Starts as In Collection
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Notes */}
                  <Box>
                    <FieldLabel label="Notes" />
                    <TextField
                      name="notes"
                      size="small"
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Internal notes about condition, provenance, exhibition history..."
                      value={values.notes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.notes && !!errors.notes}
                      helperText={touched.notes ? errors.notes : undefined}
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
                {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Artwork"}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
}



