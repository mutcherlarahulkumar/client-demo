import { useState } from "react";
import { useRouter } from "next/router";
import { createClient, updateClient } from "@artsdiva/api/client.api";
import { useClient } from "@artsdiva/hooks/useClient";
import { ApiError, type FieldErrors } from "@artsdiva/api/http";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import { ClientForm, type ClientFormValues } from "@artsdiva/components/ClientForm";

const emptyValues: ClientFormValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
  preferences: "",
  notes: "",
};

interface ClientFormContainerProps {
  clientId?: string;
}

export function ClientFormContainer({ clientId }: ClientFormContainerProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditMode = Boolean(clientId);
  const { client } = useClient(clientId);
  const [values, setValues] = useState<ClientFormValues>(emptyValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors | null>(null);

  // Adjust form state when the fetched client arrives, computed during
  // render rather than in an effect (avoids an extra render pass — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [loadedClientId, setLoadedClientId] = useState<string | undefined>(undefined);
  if (client && client.id !== loadedClientId) {
    setLoadedClientId(client.id);
    setValues({
      name: client.name,
      email: client.contactInfo?.email ?? "",
      phone: client.contactInfo?.phone ?? "",
      address: client.contactInfo?.address ?? "",
      preferences: client.preferences ?? "",
      notes: client.notes ?? "",
    });
  }

  const handleChange = <K extends keyof ClientFormValues>(field: K, value: ClientFormValues[K]): void => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (): void => {
    setIsSubmitting(true);
    setError(null);
    setFieldErrors(null);

    const payload = {
      name: values.name,
      contactInfo: {
        email: values.email || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
      },
      preferences: values.preferences || undefined,
      notes: values.notes || undefined,
    };

    const request = isEditMode && clientId ? updateClient(clientId, payload) : createClient(payload);

    void request
      .then((savedClient) => {
        showToast(isEditMode ? "Client updated" : "Client created");
        void router.push(`/clients/${savedClient.id}`);
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.message);
          setFieldErrors(err.fieldErrors ?? null);
        } else {
          setError("Failed to save client");
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div>
      <h1 className="mb-4 text-lg font-medium">{isEditMode ? "Edit Client" : "Add Client"}</h1>
      <ClientForm
        values={values}
        isSubmitting={isSubmitting}
        error={error}
        fieldErrors={fieldErrors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel={isEditMode ? "Save changes" : "Create client"}
      />
    </div>
  );
}
