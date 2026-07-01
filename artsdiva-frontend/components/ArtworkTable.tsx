import type { Artwork } from "@artsdiva/types/artwork.types";
import { ArtworkStatusBadge } from "@artsdiva/components/ArtworkStatusBadge";

interface ArtworkTableProps {
  artworks: Artwork[];
  onRowClick: (id: string) => void;
}

export function ArtworkTable({ artworks, onRowClick }: ArtworkTableProps) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b text-left">
          <th className="py-2">Title</th>
          <th className="py-2">Medium</th>
          <th className="py-2">Year</th>
          <th className="py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {artworks.map((artwork) => (
          <tr key={artwork.id} onClick={() => onRowClick(artwork.id)} className="cursor-pointer border-b">
            <td className="py-2">{artwork.title}</td>
            <td className="py-2">{artwork.medium}</td>
            <td className="py-2">{artwork.year}</td>
            <td className="py-2">
              <ArtworkStatusBadge status={artwork.status} />
            </td>
          </tr>
        ))}
        {artworks.length === 0 && (
          <tr>
            <td colSpan={4} className="py-4 text-center">
              No artworks found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
