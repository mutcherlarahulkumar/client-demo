import { useState } from "react";
import { useClients } from "@artsdiva/hooks/useClients";
import { useLeases } from "@artsdiva/hooks/useLeases";
import { LeaseForm, type LeaseFormValues } from "@artsdiva/components/LeaseForm";

const emptyValues: LeaseFormValues = { clientId: "", startDate: "", terms: "" };

interface LeaseFormContainerProps {
  artworkId: string;
  onLeased: () => void;
}

// Rendered inline from the Artwork detail page's "Lease this artwork" button.
export function LeaseFormContainer({ artworkId, onLeased }: LeaseFormContainerProps) {
  const { data: clientsData } = useClients({});
  const clients = clientsData?.data ?? [];
  const { isSubmitting, error, fieldErrors, createLease } = useLeases({ onMutate: onLeased });
  const [values, setValues] = useState<LeaseFormValues>(emptyValues);

  const handleChange = <K extends keyof LeaseFormValues>(field: K, value: LeaseFormValues[K]): void => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (): void => {
    void createLease({
      artworkId,
      clientId: values.clientId,
      startDate: values.startDate,
      terms: values.terms || undefined,
    }).then((lease) => {
      if (lease) setValues(emptyValues);
    });
  };

  return (
    <LeaseForm
      values={values}
      clients={clients.map((c) => ({ id: c.id, name: c.name }))}
      isSubmitting={isSubmitting}
      error={error}
      fieldErrors={fieldErrors}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
}
