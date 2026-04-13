import axios, { AxiosInstance } from 'axios';

// ─── Response types matching store-pilot payloads ────────────────────────────

export interface StoreConfigResponse {
  storeCode: string;
  storeName: string;
  templateCode: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  imageURI: string;
  isAvailable: boolean;
  price: number;
  store: { id: string; name: string };
  category: { id: string; name: string };
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  subcategories?: CategoryResponse[];
}

export interface WeeklyProductResponse {
  id: string;
  productId: string;
  productName: string;
  productDescription: string;
  productImageURI: string;
  categoryName: string;
  storeName: string;
  type: 'NEW_ARRIVAL' | 'HEAVY_DISCOUNT' | 'TRENDING' | 'FEATURED' | 'SEASONAL' | 'CLEARANCE';
  discountPercentage: number;
  priority: number;
  active: boolean;
  isValid: boolean;
  description: string;
}

export interface TestimonialResponse {
  id: string;
  name: string;
  customerLocation: string;
  customerRole: string;
  companyName: string;
  avatarUrl: string;
  title: string;
  content: string;
  rating: number;
  productName: string;
  isFeatured: boolean;
  showOnHomepage: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async fetchStoreConfig(_domain?: string): Promise<StoreConfigResponse> {
    try {
      const response = await this.api.get<StoreConfigResponse>('/template-code');
      return response.data;
    } catch (error) {
      console.error('Error fetching store config:', error);
      throw error;
    }
  }

  /** GET /api/products?page=&size= */
  async fetchProducts(page = 0, size = 12): Promise<PageResponse<ProductResponse>> {
    const response = await this.api.get<PageResponse<ProductResponse>>(`/products?page=${page}&size=${size}`);
    return response.data;
  }

  /** GET /api/products/category/:slug */
  async fetchProductsByCategory(slug: string): Promise<ProductResponse[]> {
    const response = await this.api.get<ProductResponse[]>(`/products/category/${slug}`);
    return response.data;
  }

  /** GET /api/categories?page=&size= */
  async fetchCategories(page = 0, size = 20): Promise<PageResponse<CategoryResponse>> {
    const response = await this.api.get<PageResponse<CategoryResponse>>(`/categories?page=${page}&size=${size}`);
    return response.data;
  }

  /** GET /api/weekly-products/active */
  async fetchActiveWeeklyProducts(): Promise<WeeklyProductResponse[]> {
    const response = await this.api.get<WeeklyProductResponse[]>('/weekly-products/active');
    return response.data;
  }

  /** GET /api/weekly-products/type/:type */
  async fetchWeeklyProductsByType(type: WeeklyProductResponse['type']): Promise<WeeklyProductResponse[]> {
    const response = await this.api.get<WeeklyProductResponse[]>(`/weekly-products/type/${type}`);
    return response.data;
  }

  /** GET /api/testimonials/approved?page=&size= */
  async fetchApprovedTestimonials(page = 0, size = 6): Promise<PageResponse<TestimonialResponse>> {
    const response = await this.api.get<PageResponse<TestimonialResponse>>(`/testimonials/approved?page=${page}&size=${size}`);
    return response.data;
  }

  /**
   * Generic GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    const response = await this.api.get<T>(endpoint);
    return response.data;
  }

  /**
   * Generic POST request
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.api.post<T>(endpoint, data);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.api.put<T>(endpoint, data);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.api.delete<T>(endpoint);
    return response.data;
  }
}

export default new ApiService();
