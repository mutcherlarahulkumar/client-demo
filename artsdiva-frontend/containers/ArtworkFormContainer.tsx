import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createArtwork, updateArtwork } from "@artsdiva/api/artwork.api";
import { useArtwork } from "@artsdiva/hooks/useArtwork";
import { useArtists } from "@artsdiva/hooks/useArtists";
import { ApiError } from "@artsdiva/api/http";
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
  const isEditMode = Boolean(artworkId);
  const { artwork } = useArtwork(artworkId);
  const { artists } = useArtists();
  const [values, setValues] = useState<ArtworkFormValues>(emptyValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (artwork) {
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
  }, [artwork]);

  const handleChange = <K extends keyof ArtworkFormValues>(field: K, value: ArtworkFormValues[K]): void => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (): void => {
    setIsSubmitting(true);
    setError(null);

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
        void router.push(`/artworks/${savedArtwork.id}`);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to save artwork");
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
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel={isEditMode ? "Save changes" : "Create artwork"}
      />
    </div>
  );
}
