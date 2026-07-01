// Minimal shape needed by other modules (e.g. Artist detail's linked
// artworks list). Expanded with DTOs/query types when the Artwork module
// itself is built.
export type ArtworkStatus = "IN_COLLECTION" | "ON_LEASE" | "SOLD";

export interface Artwork {
  id: string;
  title: string;
  artistId: string;
  medium: string;
  dimensions: string;
  year: number;
  acquisitionDate: string;
  status: ArtworkStatus;
  images: string[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}
