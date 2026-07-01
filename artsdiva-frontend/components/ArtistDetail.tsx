import type { ArtistWithArtworks } from "@artsdiva/types/artist.types";

interface ArtistDetailProps {
  artist: ArtistWithArtworks;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onArtworkClick: (artworkId: string) => void;
}

export function ArtistDetail({ artist, canDelete, onEdit, onDelete, onArtworkClick }: ArtistDetailProps) {
  return (
    <div>
      <h1 className="text-lg font-medium">{artist.name}</h1>
      {artist.bio && <p className="mt-2 text-sm">{artist.bio}</p>}

      <dl className="mt-4 grid grid-cols-2 gap-y-1 text-sm">
        <dt>Commission terms</dt>
        <dd>{artist.commissionTerms}</dd>
        <dt>MOU status</dt>
        <dd>{artist.mouStatus}</dd>
        {artist.contactInfo?.email && (
          <>
            <dt>Email</dt>
            <dd>{artist.contactInfo.email}</dd>
          </>
        )}
        {artist.contactInfo?.phone && (
          <>
            <dt>Phone</dt>
            <dd>{artist.contactInfo.phone}</dd>
          </>
        )}
        {artist.contactInfo?.address && (
          <>
            <dt>Address</dt>
            <dd>{artist.contactInfo.address}</dd>
          </>
        )}
      </dl>

      <div className="mt-4 flex gap-2">
        <button onClick={onEdit} className="border px-2 py-1 text-sm">
          Edit
        </button>
        {canDelete && (
          <button onClick={onDelete} className="border px-2 py-1 text-sm">
            Delete
          </button>
        )}
      </div>

      <h2 className="mt-6 text-sm font-medium">Artworks</h2>
      <table className="mt-2 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Title</th>
            <th className="py-2">Medium</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {artist.artworks.map((artwork) => (
            <tr key={artwork.id} onClick={() => onArtworkClick(artwork.id)} className="cursor-pointer border-b">
              <td className="py-2">{artwork.title}</td>
              <td className="py-2">{artwork.medium}</td>
              <td className="py-2">{artwork.status}</td>
            </tr>
          ))}
          {artist.artworks.length === 0 && (
            <tr>
              <td colSpan={3} className="py-4 text-center">
                No artworks linked yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
