import type { Artist } from "@artsdiva/types/artist.types";

interface ArtistTableProps {
  artists: Artist[];
  onRowClick: (id: string) => void;
}

export function ArtistTable({ artists, onRowClick }: ArtistTableProps) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b text-left">
          <th className="py-2">Name</th>
          <th className="py-2">Commission terms</th>
          <th className="py-2">MOU status</th>
        </tr>
      </thead>
      <tbody>
        {artists.map((artist) => (
          <tr key={artist.id} onClick={() => onRowClick(artist.id)} className="cursor-pointer border-b">
            <td className="py-2">{artist.name}</td>
            <td className="py-2">{artist.commissionTerms}</td>
            <td className="py-2">{artist.mouStatus}</td>
          </tr>
        ))}
        {artists.length === 0 && (
          <tr>
            <td colSpan={3} className="py-4 text-center">
              No artists found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
