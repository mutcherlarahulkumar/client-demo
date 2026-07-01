import type { ContactInfo } from "./common.types";

// Minimal shape needed by other modules (e.g. an Artwork's active lease
// client). Expanded with DTOs/query types when the Client module is built.
export interface Client {
  id: string;
  name: string;
  contactInfo?: ContactInfo | null;
  preferences?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}
