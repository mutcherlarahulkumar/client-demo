import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import * as Yup from "yup";
import { useLeases } from "@artsdiva/hooks/useLeases";
import { LeaseForm, type LeaseFormValues } from "@artsdiva/components/LeaseForm";
import type { FieldErrors } from "@artsdiva/api/http";

const emptyValues: LeaseFormValues = { clientId: "", startDate: "", rateAmount: "", terms: "" };

// Mirrors backend createLeaseSchema (artsdiva-backend/src/validators/lease.validator.ts)
// so bad input never has to make a round trip to find out it's invalid.
const validationSchema = Yup.object({
  clientId: Yup.string().required("Client is required"),
  startDate: Yup.date().typeError("Enter a valid date").required("Start date is required"),
  rateAmount: Yup.number()
    .typeError("Must be a number")
    .positive("Must be greater than 0")
    .required("Lease rate is required"),
  terms: Yup.string().optional(),
});

function toFieldErrors(err: Yup.ValidationError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const inner of err.inner) {
    if (inner.path) fieldErrors[inner.path] = [inner.message];
  }
  return fieldErrors;
}

interface LeaseFormContainerProps {
  artworkId: string;
  onLeased: () => void;
  onCancel?: () => void;
}

export function LeaseFormContainer({ artworkId, onLeased, onCancel }: LeaseFormContainerProps) {
  const router = useRouter();
  const { isSubmitting, error, fieldErrors, createLease } = useLeases({ onMutate: onLeased });
  const [values, setValues] = useState<LeaseFormValues>(emptyValues);
  const [validationErrors, setValidationErrors] = useState<FieldErrors | null>(null);

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
    setValidationErrors(null);
  };

  const handleSubmit = (): void => {
    try {
      validationSchema.validateSync(values, { abortEarly: false });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        setValidationErrors(toFieldErrors(err));
      }
      return;
    }

    setValidationErrors(null);
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
      fieldErrors={validationErrors ?? fieldErrors}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
