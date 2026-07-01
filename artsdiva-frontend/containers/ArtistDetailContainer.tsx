import { useRouter } from "next/router";
import { useAuth } from "@artsdiva/hooks/useAuth";
import { useArtist } from "@artsdiva/hooks/useArtist";
import { ArtistDetail } from "@artsdiva/components/ArtistDetail";

interface ArtistDetailContainerProps {
  artistId: string;
}

export function ArtistDetailContainer({ artistId }: ArtistDetailContainerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { artist, isLoading, error, deleteArtist } = useArtist(artistId);

  const handleDelete = (): void => {
    if (!window.confirm("Delete this artist?")) return;
    void deleteArtist().then((success) => {
      if (success) void router.push("/artists");
    });
  };

  if (isLoading) return <p className="text-sm">Loading...</p>;
  if (error || !artist)
    return (
      <p role="alert" className="text-sm">
        {error ?? "Artist not found"}
      </p>
    );

  return (
    <ArtistDetail
      artist={artist}
      canDelete={user?.role === "ADMIN"}
      onEdit={() => void router.push(`/artists/${artistId}/edit`)}
      onDelete={handleDelete}
      onArtworkClick={(artworkId) => void router.push(`/artworks/${artworkId}`)}
    />
  );
}
