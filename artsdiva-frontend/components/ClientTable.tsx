import type { Client } from "@artsdiva/types/client.types";

interface ClientTableProps {
  clients: Client[];
  onRowClick: (id: string) => void;
}

export function ClientTable({ clients, onRowClick }: ClientTableProps) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b text-left">
          <th className="py-2">Name</th>
          <th className="py-2">Email</th>
          <th className="py-2">Phone</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => (
          <tr key={client.id} onClick={() => onRowClick(client.id)} className="cursor-pointer border-b">
            <td className="py-2">{client.name}</td>
            <td className="py-2">{client.contactInfo?.email ?? "—"}</td>
            <td className="py-2">{client.contactInfo?.phone ?? "—"}</td>
          </tr>
        ))}
        {clients.length === 0 && (
          <tr>
            <td colSpan={3} className="py-4 text-center">
              No clients found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
