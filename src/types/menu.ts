export interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  image: string;
  available: boolean;
  featured: boolean;
  preparationTime: string;
  rating: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuQueryParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}

export interface MenuResponse {
  items: MenuItem[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}
