const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('shelfzone-auth');
    if (!stored) return null;
    
    const { state } = JSON.parse(stored);
    return state?.accessToken || null;
  } catch {
    return null;
  }
}

async function getRefreshToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('shelfzone-auth');
    if (!stored) return null;
    
    const { state } = JSON.parse(stored);
    return state?.refreshToken || null;
  } catch {
    return null;
  }
}

async function updateAccessToken(newToken: string): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem('shelfzone-auth');
    if (!stored) return;
    
    const data = JSON.parse(stored);
    if (data.state) {
      data.state.accessToken = newToken;
      localStorage.setItem('shelfzone-auth', JSON.stringify(data));
    }
  } catch {
    // Fail silently
  }
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = await getRefreshToken();
  
  if (!refreshToken) {
    throw new ApiError(401, 'Unauthorized', 'No refresh token available');
  }

  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    // Clear auth and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shelfzone-auth');
      window.location.href = '/login';
    }
    throw new ApiError(
      response.status,
      response.statusText,
      'Failed to refresh token'
    );
  }

  const data = await response.json();
  const newAccessToken = data.accessToken;
  
  // Update the access token in localStorage
  await updateAccessToken(newAccessToken);
  
  return newAccessToken;
}

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth, headers: customHeaders, ...rest } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Auto-attach Bearer token
  if (!skipAuth) {
    const token = await getAuthToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    headers,
    ...rest,
  });

  // Handle 401 with token refresh
  if (response.status === 401 && !skipAuth) {
    // Prevent multiple simultaneous refresh requests
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken()
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
    }

    try {
      const newToken = await refreshPromise;
      
      // Retry original request with new token
      (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      
      response = await fetch(`${API_URL}${endpoint}`, {
        headers,
        ...rest,
      });
    } catch (error) {
      throw new ApiError(
        401,
        'Unauthorized',
        'Session expired. Please log in again.'
      );
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(
      response.status,
      response.statusText,
      errorData.message || `HTTP ${response.status}`,
      errorData
    );
  }

  return response.json();
}

// Helper methods
export const api = {
  get: async <T = any>(endpoint: string, options?: ApiOptions): Promise<T> => {
    return apiRequest<T>(endpoint, { ...options, method: 'GET' });
  },
  
  post: async <T = any>(endpoint: string, data?: any, options?: ApiOptions): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  put: async <T = any>(endpoint: string, data?: any, options?: ApiOptions): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  delete: async <T = any>(endpoint: string, options?: ApiOptions): Promise<T> => {
    return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

// Also export as default for convenience
export default api;
