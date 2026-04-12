import axios, { AxiosInstance } from 'axios';

export interface StoreConfigResponse {
  storeCode: string;
  storeName: string;
  templateCode: string;
}

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
      // Endpoint reads the Host header via TenantFilter — no query param needed
      const response = await this.api.get<StoreConfigResponse>('/template-code');
      return response.data;
    } catch (error) {
      console.error('Error fetching store config:', error);
      throw error;
    }
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
