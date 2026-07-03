import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@artsdiva/hooks/useAuth";
import { useArtwork } from "@artsdiva/hooks/useArtwork";
import { useLeases } from "@artsdiva/hooks/useLeases";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import { ArtworkStatusBadge } from "@artsdiva/components/ArtworkStatusBadge";
import { ArtworkImageGallery } from "@artsdiva/components/ArtworkImageGallery";
import { LeaseStatusBadge } from "@artsdiva/components/LeaseStatusBadge";
import { LeaseActionButtons } from "@artsdiva/components/LeaseActionButtons";
import { ConfirmDialog } from "@artsdiva/components/ConfirmDialog";
import { LeaseFormContainer } from "@artsdiva/containers/LeaseFormContainer";
import type { ArtworkStatus } from "@artsdiva/types/artwork.types";

interface ArtworkDetailContainerProps {
  artworkId: string;
}

export function ArtworkDetailContainer({ artworkId }: ArtworkDetailContainerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { artwork, isLoading, error, deleteArtwork, updateStatus, uploadImages, refetch } = useArtwork(artworkId);
  const { isSubmitting: isLeaseActionSubmitting, completeLease, cancelLease } = useLeases({ onMutate: refetch });
  const [showLeaseForm, setShowLeaseForm] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDelete = (): void => {
    setIsConfirmOpen(false);
    void deleteArtwork().then((success) => {
      if (success) {
        showToast("Artwork deleted");
        void router.push("/artworks");
      } else {
        showToast("Failed to delete artwork", "error");
      }
    });
  };

  const handleCompleteLease = (leaseId: string): void => {
    void completeLease(leaseId).then((success) => {
      showToast(success ? "Lease completed" : "Failed to complete lease", success ? "success" : "error");
    });
  };

  const handleCancelLease = (leaseId: string): void => {
    void cancelLease(leaseId).then((success) => {
      showToast(success ? "Lease cancelled" : "Failed to cancel lease", success ? "success" : "error");
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    void uploadImages(files).then((success) => {
      showToast(success ? "Images uploaded" : "Failed to upload images", success ? "success" : "error");
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (isLoading) return <p className="text-sm">Loading...</p>;
  if (error || !artwork)
    return (
      <p role="alert" className="text-sm">
        {error ?? "Artwork not found"}
      </p>
    );

  const activeLease = artwork.activeLease;

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
        {activeLease && (
          <>
            <dt>Leased to</dt>
            <dd className="flex items-center gap-2">
              <button onClick={() => void router.push(`/clients/${activeLease.client.id}`)} className="underline">
                {activeLease.client.name}
              </button>
              <LeaseStatusBadge status={activeLease.status} />
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
        {activeLease ? (
          <LeaseActionButtons
            isSubmitting={isLeaseActionSubmitting}
            onComplete={() => handleCompleteLease(activeLease.id)}
            onCancel={() => handleCancelLease(activeLease.id)}
          />
        ) : (
          <>
            <label className="text-sm">
              Status:
              <select
                value={artwork.status}
                onChange={(e) => void updateStatus(e.target.value as ArtworkStatus)}
                className="ml-2 border px-2 py-1 text-sm"
              >
                <option value="IN_COLLECTION">In collection</option>
                <option value="SOLD">Sold</option>
              </select>
            </label>
            <button onClick={() => setShowLeaseForm((prev) => !prev)} className="border px-2 py-1 text-sm">
              {showLeaseForm ? "Cancel lease form" : "Lease this artwork"}
            </button>
          </>
        )}

        <button onClick={() => void router.push(`/artworks/${artworkId}/edit`)} className="border px-2 py-1 text-sm">
          Edit
        </button>

        {user?.role === "ADMIN" && (
          <button onClick={() => setIsConfirmOpen(true)} className="border px-2 py-1 text-sm">
            Delete
          </button>
        )}
      </div>

      {showLeaseForm && !activeLease && (
        <div className="mt-4">
          <LeaseFormContainer
            artworkId={artworkId}
            onLeased={() => {
              setShowLeaseForm(false);
              showToast("Artwork leased");
              void refetch();
            }}
          />
        </div>
      )}

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

      <ConfirmDialog
        open={isConfirmOpen}
        title="Delete artwork"
        message={`Delete "${artwork.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
