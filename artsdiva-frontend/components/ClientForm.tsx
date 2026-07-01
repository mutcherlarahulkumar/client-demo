export interface ClientFormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
  preferences: string;
  notes: string;
}

interface ClientFormProps {
  values: ClientFormValues;
  isSubmitting: boolean;
  error: string | null;
  onChange: <K extends keyof ClientFormValues>(field: K, value: ClientFormValues[K]) => void;
  onSubmit: () => void;
  submitLabel: string;
}

export function ClientForm({ values, isSubmitting, error, onChange, onSubmit, submitLabel }: ClientFormProps) {
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
        <input className="border px-2 py-1" value={values.name} onChange={(e) => onChange("name", e.target.value)} required />
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
        Preferences
        <textarea
          className="border px-2 py-1"
          value={values.preferences}
          onChange={(e) => onChange("preferences", e.target.value)}
        />
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
