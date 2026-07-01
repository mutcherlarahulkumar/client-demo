import { useRouter } from "next/router";
import { useArtists } from "@artsdiva/hooks/useArtists";
import { ArtistTable } from "@artsdiva/components/ArtistTable";

export function ArtistListContainer() {
  const router = useRouter();
  const { artists, isLoading, error, search, setSearch } = useArtists();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <input
          type="search"
          placeholder="Search artists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-2 py-1 text-sm"
        />
        <button onClick={() => void router.push("/artists/new")} className="border px-2 py-1 text-sm">
          Add Artist
        </button>
      </div>

      {isLoading && <p className="text-sm">Loading...</p>}
      {error && (
        <p role="alert" className="text-sm">
          {error}
        </p>
      )}

      {!isLoading && !error && (
        <ArtistTable artists={artists} onRowClick={(id) => void router.push(`/artists/${id}`)} />
      )}
    </div>
  );
}
