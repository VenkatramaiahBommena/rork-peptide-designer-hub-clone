// API Client for interacting with backend and Cloudflare Workers

const API_BACKEND_URL = process.env.REACT_APP_API_BACKEND_URL || 'http://localhost:3001';
const API_WORKERS_URL = process.env.REACT_APP_API_WORKERS_URL || 'http://localhost:8787';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: any;
  useWorkers?: boolean;
}

class ApiClient {
  private backendUrl: string;
  private workersUrl: string;
  private token: string | null = null;

  constructor() {
    this.backendUrl = API_BACKEND_URL;
    this.workersUrl = API_WORKERS_URL;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private getHeaders(options?: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return { ...headers, ...(options?.headers || {}) };
  }

  private async request<T>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const useWorkers = options.useWorkers !== false;
    const baseUrl = useWorkers ? this.workersUrl : this.backendUrl;
    const url = `${baseUrl}${path}`;
    const method = options.method || 'GET';

    const fetchOptions: RequestInit = {
      method,
      headers: this.getHeaders(options),
    };

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP Error: ${response.status}`);
    }

    return response.json();
  }

  // ==================== PEPTIDE METHODS ====================

  async getPeptides(userId: string) {
    return this.request(`/api/peptides/${userId}`);
  }

  async getPeptide(userId: string, peptideId: string) {
    return this.request(`/api/peptides/${userId}/${peptideId}`);
  }

  async createPeptide(peptideData: {
    sequence: string;
    targetTherapy?: string;
    dockingScores?: Record<string, number>;
    userId: string;
  }) {
    return this.request('/api/peptides', {
      method: 'POST',
      body: peptideData,
    });
  }

  async updatePeptide(
    peptideId: string,
    updates: Record<string, any>
  ) {
    return this.request(`/api/peptides/${peptideId}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deletePeptide(peptideId: string) {
    return this.request(`/api/peptides/${peptideId}`, {
      method: 'DELETE',
    });
  }

  // ==================== DOCKING CALCULATION ====================

  async calculateDockingScores(sequence: string, parameters?: any) {
    return this.request('/api/docking/calculate', {
      method: 'POST',
      body: { sequence, parameters },
      useWorkers: true,
    });
  }

  // ==================== ALIGNMENT ====================

  async performAlignment(sequences: string[]) {
    return this.request('/api/alignment', {
      method: 'POST',
      body: { sequences },
      useWorkers: true,
    });
  }

  // ==================== SEARCH ====================

  async search(query: string) {
    return this.request(`/api/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      useWorkers: true,
    });
  }

  // ==================== ACTIVITY ====================

  async getActivity(userId: string, limit: number = 50) {
    return this.request(
      `/api/users/${userId}/activity?limit=${limit}`,
      { useWorkers: true }
    );
  }

  async logActivity(userId: string, action: string, details?: any) {
    return this.request(`/api/users/${userId}/activity`, {
      method: 'POST',
      body: { action, details },
      useWorkers: true,
    });
  }

  // ==================== HEALTH CHECK ====================

  async healthCheck() {
    try {
      return await this.request('/api/health', { useWorkers: true });
    } catch (error) {
      return { status: 'error' };
    }
  }

  // ==================== AUTH ====================

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
