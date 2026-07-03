import type { FieldErrors } from "@artsdiva/api/http";

export interface LeaseFormValues {
  clientId: string;
  startDate: string;
  terms: string;
}

interface LeaseFormClientOption {
  id: string;
  name: string;
}

interface LeaseFormProps {
  values: LeaseFormValues;
  clients: LeaseFormClientOption[];
  isSubmitting: boolean;
  error: string | null;
  fieldErrors: FieldErrors | null;
  onChange: <K extends keyof LeaseFormValues>(field: K, value: LeaseFormValues[K]) => void;
  onSubmit: () => void;
}

export function LeaseForm({ values, clients, isSubmitting, error, fieldErrors, onChange, onSubmit }: LeaseFormProps) {
  return (
    <form
      className="flex max-w-md flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        Client
        <select
          className="border px-2 py-1"
          value={values.clientId}
          onChange={(e) => onChange("clientId", e.target.value)}
          required
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        {fieldErrors?.clientId && <span className="text-xs text-red-700">{fieldErrors.clientId[0]}</span>}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Start date
        <input
          type="date"
          className="border px-2 py-1"
          value={values.startDate}
          onChange={(e) => onChange("startDate", e.target.value)}
          required
        />
        {fieldErrors?.startDate && <span className="text-xs text-red-700">{fieldErrors.startDate[0]}</span>}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Terms
        <textarea className="border px-2 py-1" value={values.terms} onChange={(e) => onChange("terms", e.target.value)} />
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="border px-2 py-1 text-sm">
        {isSubmitting ? "Saving..." : "Lease artwork"}
      </button>
    </form>
  );
}
