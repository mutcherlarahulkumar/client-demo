export interface ContactInfo {
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
  address?: string;
}

export interface Dimensions {
  width: number;
  height: number;
  unit: "cm" | "in" | "mm";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
