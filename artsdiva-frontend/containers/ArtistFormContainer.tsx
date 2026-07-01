import { useState } from "react";
import { useRouter } from "next/router";
import { createArtist, updateArtist } from "@artsdiva/api/artist.api";
import { useArtist } from "@artsdiva/hooks/useArtist";
import { ApiError } from "@artsdiva/api/http";
import { ArtistForm, type ArtistFormValues } from "@artsdiva/components/ArtistForm";

const emptyValues: ArtistFormValues = {
  name: "",
  bio: "",
  email: "",
  phone: "",
  address: "",
  commissionTerms: "",
  mouStatus: "PENDING",
};

interface ArtistFormContainerProps {
  artistId?: string;
}

export function ArtistFormContainer({ artistId }: ArtistFormContainerProps) {
  const router = useRouter();
  const isEditMode = Boolean(artistId);
  const { artist } = useArtist(artistId);
  const [values, setValues] = useState<ArtistFormValues>(emptyValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Adjust form state when the fetched artist arrives, computed during
  // render rather than in an effect (avoids an extra render pass — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [loadedArtistId, setLoadedArtistId] = useState<string | undefined>(undefined);
  if (artist && artist.id !== loadedArtistId) {
    setLoadedArtistId(artist.id);
    setValues({
      name: artist.name,
      bio: artist.bio ?? "",
      email: artist.contactInfo?.email ?? "",
      phone: artist.contactInfo?.phone ?? "",
      address: artist.contactInfo?.address ?? "",
      commissionTerms: artist.commissionTerms,
      mouStatus: artist.mouStatus,
    });
  }

  const handleChange = <K extends keyof ArtistFormValues>(field: K, value: ArtistFormValues[K]): void => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (): void => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: values.name,
      bio: values.bio || undefined,
      contactInfo: {
        email: values.email || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
      },
      commissionTerms: values.commissionTerms,
      mouStatus: values.mouStatus,
    };

    const request = isEditMode && artistId ? updateArtist(artistId, payload) : createArtist(payload);

    void request
      .then((savedArtist) => {
        void router.push(`/artists/${savedArtist.id}`);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to save artist");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div>
      <h1 className="mb-4 text-lg font-medium">{isEditMode ? "Edit Artist" : "Add Artist"}</h1>
      <ArtistForm
        values={values}
        isSubmitting={isSubmitting}
        error={error}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel={isEditMode ? "Save changes" : "Create artist"}
      />
    </div>
  );
}
