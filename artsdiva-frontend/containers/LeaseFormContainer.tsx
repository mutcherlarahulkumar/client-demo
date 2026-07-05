import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useLeases } from "@artsdiva/hooks/useLeases";
import { LeaseForm, type LeaseFormValues } from "@artsdiva/components/LeaseForm";

const emptyValues: LeaseFormValues = { clientId: "", startDate: "", rateAmount: "", terms: "" };

interface LeaseFormContainerProps {
  artworkId: string;
  onLeased: () => void;
  onCancel?: () => void;
}

export function LeaseFormContainer({ artworkId, onLeased, onCancel }: LeaseFormContainerProps) {
  const router = useRouter();
  const { isSubmitting, error, fieldErrors, createLease } = useLeases({ onMutate: onLeased });
  const [values, setValues] = useState<LeaseFormValues>(emptyValues);

  // Returning from "New client": the create form redirects back here with
  // ?autoClientId= so the freshly created client is pre-selected.
  const autoClientId = typeof router.query.autoClientId === "string" ? router.query.autoClientId : undefined;
  useEffect(() => {
    if (autoClientId) {
      setValues((prev) => ({ ...prev, clientId: autoClientId }));
    }
  }, [autoClientId]);

  const handleChange = <K extends keyof LeaseFormValues>(field: K, value: LeaseFormValues[K]): void => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (): void => {
    void createLease({
      artworkId,
      clientId: values.clientId,
      startDate: values.startDate,
      rateAmount: Number(values.rateAmount),
      terms: values.terms || undefined,
    }).then((lease) => {
      if (lease) setValues(emptyValues);
    });
  };

  return (
    <LeaseForm
      values={values}
      artworkId={artworkId}
      isSubmitting={isSubmitting}
      error={error}
      fieldErrors={fieldErrors}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
