import { useRef } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@artsdiva/hooks/useAuth";
import { useArtwork } from "@artsdiva/hooks/useArtwork";
import { ArtworkStatusBadge } from "@artsdiva/components/ArtworkStatusBadge";
import { ArtworkImageGallery } from "@artsdiva/components/ArtworkImageGallery";
import type { ArtworkStatus } from "@artsdiva/types/artwork.types";

interface ArtworkDetailContainerProps {
  artworkId: string;
}

export function ArtworkDetailContainer({ artworkId }: ArtworkDetailContainerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { artwork, isLoading, error, deleteArtwork, updateStatus, uploadImages } = useArtwork(artworkId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDelete = (): void => {
    if (!window.confirm("Delete this artwork?")) return;
    void deleteArtwork().then((success) => {
      if (success) void router.push("/artworks");
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    void uploadImages(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (isLoading) return <p className="text-sm">Loading...</p>;
  if (error || !artwork)
    return (
      <p role="alert" className="text-sm">
        {error ?? "Artwork not found"}
      </p>
    );

  return (
    <div>
      <h1 className="text-lg font-medium">{artwork.title}</h1>

      <dl className="mt-4 grid grid-cols-2 gap-y-1 text-sm">
        <dt>Artist</dt>
        <dd>
          <button onClick={() => void router.push(`/artists/${artwork.artist.id}`)} className="underline">
            {artwork.artist.name}
          </button>
        </dd>
        <dt>Medium</dt>
        <dd>{artwork.medium}</dd>
        <dt>Dimensions</dt>
        <dd>{artwork.dimensions}</dd>
        <dt>Year</dt>
        <dd>{artwork.year}</dd>
        <dt>Status</dt>
        <dd>
          <ArtworkStatusBadge status={artwork.status} />
        </dd>
        {artwork.activeLease && (
          <>
            <dt>Leased to</dt>
            <dd>
              <button
                onClick={() => void router.push(`/clients/${artwork.activeLease?.client.id}`)}
                className="underline"
              >
                {artwork.activeLease.client.name}
              </button>
            </dd>
          </>
        )}
        {artwork.notes && (
          <>
            <dt>Notes</dt>
            <dd>{artwork.notes}</dd>
          </>
        )}
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="text-sm">
          Status:
          <select
            value={artwork.status}
            onChange={(e) => void updateStatus(e.target.value as ArtworkStatus)}
            className="ml-2 border px-2 py-1 text-sm"
          >
            <option value="IN_COLLECTION">In collection</option>
            <option value="ON_LEASE">On lease</option>
            <option value="SOLD">Sold</option>
          </select>
        </label>

        <button onClick={() => void router.push(`/artworks/${artworkId}/edit`)} className="border px-2 py-1 text-sm">
          Edit
        </button>

        {user?.role === "ADMIN" && (
          <button onClick={handleDelete} className="border px-2 py-1 text-sm">
            Delete
          </button>
        )}
      </div>

      <h2 className="mt-6 text-sm font-medium">Images</h2>
      <ArtworkImageGallery images={artwork.images} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="mt-2 text-sm"
      />
    </div>
  );
}
