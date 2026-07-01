import { useRouter } from "next/router";
import { useArtworks } from "@artsdiva/hooks/useArtworks";
import { useArtists } from "@artsdiva/hooks/useArtists";
import { ArtworkTable } from "@artsdiva/components/ArtworkTable";
import type { ArtworkStatus } from "@artsdiva/types/artwork.types";

export function ArtworkListContainer() {
  const router = useRouter();
  const { artworks, isLoading, error, search, setSearch, status, setStatus, artistId, setArtistId } =
    useArtworks();
  const { artists } = useArtists();

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search artworks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-2 py-1 text-sm"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ArtworkStatus | "")}
          className="border px-2 py-1 text-sm"
        >
          <option value="">All statuses</option>
          <option value="IN_COLLECTION">In collection</option>
          <option value="ON_LEASE">On lease</option>
          <option value="SOLD">Sold</option>
        </select>

        <select value={artistId} onChange={(e) => setArtistId(e.target.value)} className="border px-2 py-1 text-sm">
          <option value="">All artists</option>
          {artists.map((artist) => (
            <option key={artist.id} value={artist.id}>
              {artist.name}
            </option>
          ))}
        </select>

        <button onClick={() => void router.push("/artworks/new")} className="ml-auto border px-2 py-1 text-sm">
          Add Artwork
        </button>
      </div>

      {isLoading && <p className="text-sm">Loading...</p>}
      {error && (
        <p role="alert" className="text-sm">
          {error}
        </p>
      )}

      {!isLoading && !error && (
        <ArtworkTable artworks={artworks} onRowClick={(id) => void router.push(`/artworks/${id}`)} />
      )}
    </div>
  );
}
