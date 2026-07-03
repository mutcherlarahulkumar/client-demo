import { useState } from "react";
import { useRouter } from "next/router";
import { createArtwork, updateArtwork } from "@artsdiva/api/artwork.api";
import { useArtwork } from "@artsdiva/hooks/useArtwork";
import { useArtists } from "@artsdiva/hooks/useArtists";
import { ApiError, type FieldErrors } from "@artsdiva/api/http";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import { ArtworkForm, type ArtworkFormValues } from "@artsdiva/components/ArtworkForm";

const emptyValues: ArtworkFormValues = {
  title: "",
  artistId: "",
  medium: "",
  dimensions: "",
  year: "",
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
  const isEditMode = Boolean(artworkId);
  const { artwork } = useArtwork(artworkId);
  const { artists } = useArtists();
  const [values, setValues] = useState<ArtworkFormValues>(emptyValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors | null>(null);

  // Adjust form state when the fetched artwork arrives, computed during
  // render rather than in an effect (avoids an extra render pass — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [loadedArtworkId, setLoadedArtworkId] = useState<string | undefined>(undefined);
  if (artwork && artwork.id !== loadedArtworkId) {
    setLoadedArtworkId(artwork.id);
    setValues({
      title: artwork.title,
      artistId: artwork.artistId,
      medium: artwork.medium,
      dimensions: artwork.dimensions,
      year: String(artwork.year),
      acquisitionDate: artwork.acquisitionDate.slice(0, 10),
      status: artwork.status,
      notes: artwork.notes ?? "",
    });
  }

  const handleChange = <K extends keyof ArtworkFormValues>(field: K, value: ArtworkFormValues[K]): void => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (): void => {
    setIsSubmitting(true);
    setError(null);
    setFieldErrors(null);

    const payload = {
      title: values.title,
      artistId: values.artistId,
      medium: values.medium,
      dimensions: values.dimensions,
      year: Number(values.year),
      acquisitionDate: values.acquisitionDate,
      status: values.status,
      notes: values.notes || undefined,
    };

    const request = isEditMode && artworkId ? updateArtwork(artworkId, payload) : createArtwork(payload);

    void request
      .then((savedArtwork) => {
        showToast(isEditMode ? "Artwork updated" : "Artwork created");
        void router.push(`/artworks/${savedArtwork.id}`);
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.message);
          setFieldErrors(err.fieldErrors ?? null);
        } else {
          setError("Failed to save artwork");
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div>
      <h1 className="mb-4 text-lg font-medium">{isEditMode ? "Edit Artwork" : "Add Artwork"}</h1>
      <ArtworkForm
        values={values}
        artists={artists.map((a) => ({ id: a.id, name: a.name }))}
        isSubmitting={isSubmitting}
        error={error}
        fieldErrors={fieldErrors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel={isEditMode ? "Save changes" : "Create artwork"}
      />
    </div>
  );
}
