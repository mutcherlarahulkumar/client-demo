import type { ArtworkStatus } from "@artsdiva/types/artwork.types";

export interface ArtworkFormValues {
  title: string;
  artistId: string;
  medium: string;
  dimensions: string;
  year: string;
  acquisitionDate: string;
  status: ArtworkStatus;
  notes: string;
}

interface ArtworkFormArtistOption {
  id: string;
  name: string;
}

interface ArtworkFormProps {
  values: ArtworkFormValues;
  artists: ArtworkFormArtistOption[];
  isSubmitting: boolean;
  error: string | null;
  onChange: <K extends keyof ArtworkFormValues>(field: K, value: ArtworkFormValues[K]) => void;
  onSubmit: () => void;
  submitLabel: string;
}

export function ArtworkForm({ values, artists, isSubmitting, error, onChange, onSubmit, submitLabel }: ArtworkFormProps) {
  return (
    <form
      className="flex max-w-md flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        Title
        <input className="border px-2 py-1" value={values.title} onChange={(e) => onChange("title", e.target.value)} required />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Artist
        <select
          className="border px-2 py-1"
          value={values.artistId}
          onChange={(e) => onChange("artistId", e.target.value)}
          required
        >
          <option value="">Select an artist</option>
          {artists.map((artist) => (
            <option key={artist.id} value={artist.id}>
              {artist.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Medium
        <input className="border px-2 py-1" value={values.medium} onChange={(e) => onChange("medium", e.target.value)} required />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Dimensions
        <input
          className="border px-2 py-1"
          value={values.dimensions}
          onChange={(e) => onChange("dimensions", e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Year
        <input
          type="number"
          className="border px-2 py-1"
          value={values.year}
          onChange={(e) => onChange("year", e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Acquisition date
        <input
          type="date"
          className="border px-2 py-1"
          value={values.acquisitionDate}
          onChange={(e) => onChange("acquisitionDate", e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Status
        <select
          className="border px-2 py-1"
          value={values.status}
          onChange={(e) => onChange("status", e.target.value as ArtworkStatus)}
        >
          <option value="IN_COLLECTION">In collection</option>
          <option value="ON_LEASE">On lease</option>
          <option value="SOLD">Sold</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Notes
        <textarea className="border px-2 py-1" value={values.notes} onChange={(e) => onChange("notes", e.target.value)} />
      </label>

      {error && (
        <p role="alert" className="text-sm">
          {error}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="border px-2 py-1 text-sm">
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
