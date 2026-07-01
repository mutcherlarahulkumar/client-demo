import { useRouter } from "next/router";
import { useAuth } from "@artsdiva/hooks/useAuth";
import { useClient } from "@artsdiva/hooks/useClient";
import { LeaseHistoryTable } from "@artsdiva/components/LeaseHistoryTable";

interface ClientDetailContainerProps {
  clientId: string;
}

// Lease actions (create/complete/cancel) live on the Artwork detail page —
// this view is read-only lease history, per the Lease module design.
export function ClientDetailContainer({ clientId }: ClientDetailContainerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { client, isLoading, error, deleteClient } = useClient(clientId);

  const handleDelete = (): void => {
    if (!window.confirm("Delete this client?")) return;
    void deleteClient().then((success) => {
      if (success) void router.push("/clients");
    });
  };

  if (isLoading) return <p className="text-sm">Loading...</p>;
  if (error || !client)
    return (
      <p role="alert" className="text-sm">
        {error ?? "Client not found"}
      </p>
    );

  return (
    <div>
      <h1 className="text-lg font-medium">{client.name}</h1>

      <dl className="mt-4 grid grid-cols-2 gap-y-1 text-sm">
        {client.contactInfo?.email && (
          <>
            <dt>Email</dt>
            <dd>{client.contactInfo.email}</dd>
          </>
        )}
        {client.contactInfo?.phone && (
          <>
            <dt>Phone</dt>
            <dd>{client.contactInfo.phone}</dd>
          </>
        )}
        {client.contactInfo?.address && (
          <>
            <dt>Address</dt>
            <dd>{client.contactInfo.address}</dd>
          </>
        )}
        {client.preferences && (
          <>
            <dt>Preferences</dt>
            <dd>{client.preferences}</dd>
          </>
        )}
        {client.notes && (
          <>
            <dt>Notes</dt>
            <dd>{client.notes}</dd>
          </>
        )}
      </dl>

      <div className="mt-4 flex gap-2">
        <button onClick={() => void router.push(`/clients/${clientId}/edit`)} className="border px-2 py-1 text-sm">
          Edit
        </button>
        {user?.role === "ADMIN" && (
          <button onClick={handleDelete} className="border px-2 py-1 text-sm">
            Delete
          </button>
        )}
      </div>

      <h2 className="mt-6 text-sm font-medium">Lease history</h2>
      <LeaseHistoryTable leases={client.leases} onArtworkClick={(id) => void router.push(`/artworks/${id}`)} />
    </div>
  );
}
