import { useRouter } from "next/router";
import { useClients } from "@artsdiva/hooks/useClients";
import { ClientTable } from "@artsdiva/components/ClientTable";

export function ClientListContainer() {
  const router = useRouter();
  const { clients, isLoading, error, search, setSearch } = useClients();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <input
          type="search"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-2 py-1 text-sm"
        />
        <button onClick={() => void router.push("/clients/new")} className="border px-2 py-1 text-sm">
          Add Client
        </button>
      </div>

      {isLoading && <p className="text-sm">Loading...</p>}
      {error && (
        <p role="alert" className="text-sm">
          {error}
        </p>
      )}

      {!isLoading && !error && (
        <ClientTable clients={clients} onRowClick={(id) => void router.push(`/clients/${id}`)} />
      )}
    </div>
  );
}
