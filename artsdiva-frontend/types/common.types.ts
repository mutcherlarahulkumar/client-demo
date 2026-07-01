export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
