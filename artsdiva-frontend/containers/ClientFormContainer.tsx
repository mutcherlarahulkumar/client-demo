import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient, updateClient } from "@artsdiva/api/client.api";
import { useClient } from "@artsdiva/hooks/useClient";
import { ApiError } from "@artsdiva/api/http";
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
  const isEditMode = Boolean(clientId);
  const { client } = useClient(clientId);
  const [values, setValues] = useState<ClientFormValues>(emptyValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (client) {
      setValues({
        name: client.name,
        email: client.contactInfo?.email ?? "",
        phone: client.contactInfo?.phone ?? "",
        address: client.contactInfo?.address ?? "",
        preferences: client.preferences ?? "",
        notes: client.notes ?? "",
      });
    }
  }, [client]);

  const handleChange = <K extends keyof ClientFormValues>(field: K, value: ClientFormValues[K]): void => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (): void => {
    setIsSubmitting(true);
    setError(null);

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
        void router.push(`/clients/${savedClient.id}`);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to save client");
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
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel={isEditMode ? "Save changes" : "Create client"}
      />
    </div>
  );
}
