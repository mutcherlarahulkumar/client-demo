import type { MouStatus } from "@artsdiva/types/artist.types";

export interface ArtistFormValues {
  name: string;
  bio: string;
  email: string;
  phone: string;
  address: string;
  commissionTerms: string;
  mouStatus: MouStatus;
}

interface ArtistFormProps {
  values: ArtistFormValues;
  isSubmitting: boolean;
  error: string | null;
  onChange: <K extends keyof ArtistFormValues>(field: K, value: ArtistFormValues[K]) => void;
  onSubmit: () => void;
  submitLabel: string;
}

export function ArtistForm({ values, isSubmitting, error, onChange, onSubmit, submitLabel }: ArtistFormProps) {
  return (
    <form
      className="flex max-w-md flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          className="border px-2 py-1"
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Bio
        <textarea className="border px-2 py-1" value={values.bio} onChange={(e) => onChange("bio", e.target.value)} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          type="email"
          className="border px-2 py-1"
          value={values.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Phone
        <input className="border px-2 py-1" value={values.phone} onChange={(e) => onChange("phone", e.target.value)} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Address
        <input
          className="border px-2 py-1"
          value={values.address}
          onChange={(e) => onChange("address", e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Commission terms
        <input
          className="border px-2 py-1"
          value={values.commissionTerms}
          onChange={(e) => onChange("commissionTerms", e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        MOU status
        <select
          className="border px-2 py-1"
          value={values.mouStatus}
          onChange={(e) => onChange("mouStatus", e.target.value as MouStatus)}
        >
          <option value="PENDING">Pending</option>
          <option value="SIGNED">Signed</option>
          <option value="NOT_REQUIRED">Not required</option>
        </select>
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
