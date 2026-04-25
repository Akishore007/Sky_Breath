const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const REQUEST_TIMEOUT = 30000; // 30 seconds

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }
    return headers;
  }

  /**
   * Parse error responses with multiple formats support
   */
  private parseErrorMessage(errorData: any): string {
    // Handle field-specific errors (e.g., {username: ["User already exists"], email: ["..."]})
    if (typeof errorData === 'object' && !Array.isArray(errorData)) {
      const fieldErrors: string[] = [];
      for (const [field, messages] of Object.entries(errorData)) {
        if (Array.isArray(messages)) {
          messages.forEach(msg => fieldErrors.push(`${field}: ${msg}`));
        } else if (typeof messages === 'string') {
          fieldErrors.push(`${field}: ${messages}`);
        }
      }
      if (fieldErrors.length > 0) {
        return fieldErrors.join('; ');
      }
    }
    
    // Try common error response formats
    if (errorData?.detail) return errorData.detail;
    if (errorData?.message) return errorData.message;
    if (errorData?.error) return errorData.error;
    if (typeof errorData === 'string') return errorData;
    
    return JSON.stringify(errorData);
  }

  /**
   * Make HTTP request with timeout support
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] ${options.method || 'GET'} ${endpoint}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {}),
        },
      });

      clearTimeout(timeoutId);

      // Handle authentication errors
      if (response.status === 401) {
        console.warn('[API] Unauthorized - clearing token and redirecting to login');
        this.clearToken();
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = this.parseErrorMessage(errorData);
        } catch (parseError) {
          // If JSON parsing fails, try text
          try {
            const errorText = await response.text();
            if (errorText && errorText.length > 0) {
              errorMessage = errorText;
            }
          } catch {
            // Use default error message
          }
        }
        
        console.error(`[API] Error [${response.status}] ${endpoint}:`, errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`[API] Success ${endpoint}:`, data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        // Network error - likely backend is down or CORS issue
        console.error('[API] Network error - backend may be offline');
        throw new Error('Server unavailable. Please check your connection.');
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error(`[API] Request timeout for ${endpoint}`);
          throw new Error('Request timed out. Please try again.');
        }
        console.error(`[API] Request failed for ${endpoint}:`, error.message);
        throw error;
      }
      
      console.error(`[API] Unexpected error for ${endpoint}:`, error);
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }

  // User endpoints
  async register(data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name?: string;
    last_name?: string;
    location?: string;
  }) {
    console.log('API: Registering user:', data.email);
    const response = await this.request<any>('/users/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('API: Register response:', response);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async login(username: string, password: string) {
    console.log('API: Logging in user:', username);
    const response = await this.request<any>('/users/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    console.log('API: Login response:', response);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async logout() {
    await this.request('/users/logout/', { method: 'POST' });
    this.clearToken();
  }

  async getCurrentUser() {
    return this.request<any>('/users/me/');
  }

  async updateProfile(data: any) {
    const user = await this.getCurrentUser();
    return this.request<any>(`/users/${user.id}/update_preferences/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Weather endpoints
  async getCurrentWeather(location?: string) {
    const endpoint = location
      ? `/weather/current/by_location/?location=${location}`
      : '/weather/current/current/';
    return this.request<any>(endpoint);
  }

  async getWeatherForecast(location: string, days: number = 7) {
    return this.request<any>(
      `/weather/forecast/by_location/?location=${location}&days=${days}`
    );
  }

  async getRecentWeather(location: string, limit: number = 24) {
    return this.request<any>(
      `/weather/current/recent/?location=${location}&limit=${limit}`
    );
  }

  async getWeatherUpdateStatus() {
    return this.request<any>('/weather/current/update_status/');
  }

  // Alert endpoints
  async getAlerts() {
    return this.request<any>('/alerts/');
  }

  async getUnreadAlerts() {
    return this.request<any>('/alerts/unread/');
  }

  async getCriticalAlerts() {
    return this.request<any>('/alerts/critical/');
  }

  async getAlertSummary() {
    return this.request<any>('/alerts/summary/');
  }

  async markAlertAsRead(id: number) {
    return this.request<any>(`/alerts/${id}/mark_as_read/`, {
      method: 'POST',
    });
  }

  async dismissAlert(id: number) {
    return this.request<any>(`/alerts/${id}/dismiss/`, {
      method: 'POST',
    });
  }

  // Analytics endpoints
  async getUserAnalytics() {
    return this.request<any>('/analytics/user/my_analytics/');
  }

  async getWeatherSummary() {
    return this.request<any>('/analytics/user/weather_summary/');
  }

  async getEngagementMetrics() {
    return this.request<any>('/analytics/user/engagement/');
  }

  async getDailyStats(limit: number = 30) {
    return this.request<any>(`/analytics/daily/my_stats/?limit=${limit}`);
  }

  async getStatsByDate(date: string) {
    return this.request<any>(`/analytics/daily/by_date/?date=${date}`);
  }

  async getWeatherTrends() {
    return this.request<any>('/analytics/daily/trends/');
  }

  // News endpoints
  async getNews(limit: number = 10) {
    return this.request<any>(`/news/?limit=${limit}`);
  }

  async getLatestNews(limit: number = 10) {
    return this.request<any>(`/news/latest/?limit=${limit}`);
  }

  async getTrendingNews(limit: number = 10) {
    return this.request<any>(`/news/trending/?limit=${limit}`);
  }

  async getNewsByCategory(category: string) {
    return this.request<any>(`/news/by_category/?category=${category}`);
  }

  async searchNews(query: string) {
    return this.request<any>(`/news/search/?q=${encodeURIComponent(query)}`);
  }

  async getNewsArticle(id: number) {
    return this.request<any>(`/news/${id}/`);
  }

  async getNewsCategories() {
    return this.request<any>('/news/categories/');
  }
}

export default new ApiService();
