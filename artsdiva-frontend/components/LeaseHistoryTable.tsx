import type { Artwork } from "@artsdiva/types/artwork.types";
import type { Lease } from "@artsdiva/types/lease.types";
import { LeaseStatusBadge } from "@artsdiva/components/LeaseStatusBadge";

export interface LeaseHistoryEntry extends Lease {
  artwork: Pick<Artwork, "id" | "title" | "images" | "status">;
}

interface LeaseHistoryTableProps {
  leases: LeaseHistoryEntry[];
  onArtworkClick: (artworkId: string) => void;
}

export function LeaseHistoryTable({ leases, onArtworkClick }: LeaseHistoryTableProps) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b text-left">
          <th className="py-2">Artwork</th>
          <th className="py-2">Start</th>
          <th className="py-2">End</th>
          <th className="py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {leases.map((lease) => (
          <tr key={lease.id} onClick={() => onArtworkClick(lease.artwork.id)} className="cursor-pointer border-b">
            <td className="py-2">
              <div className="flex items-center gap-2">
                {lease.artwork.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={lease.artwork.images[0]} alt="" className="h-8 w-8 border object-cover" />
                )}
                {lease.artwork.title}
              </div>
            </td>
            <td className="py-2">{new Date(lease.startDate).toLocaleDateString()}</td>
            <td className="py-2">{lease.endDate ? new Date(lease.endDate).toLocaleDateString() : "—"}</td>
            <td className="py-2">
              <LeaseStatusBadge status={lease.status} />
            </td>
          </tr>
        ))}
        {leases.length === 0 && (
          <tr>
            <td colSpan={4} className="py-4 text-center">
              No lease history yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
