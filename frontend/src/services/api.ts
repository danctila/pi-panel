import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Get API URL from env or use a default
const API_URL = process.env.REACT_APP_API_URL || 'https://admin.totaltechtools.com/api';

// Create Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create axios instance with common config
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Essential for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  async (config) => {
    // Get session from Supabase
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    
    // If we have a session, add the token to request headers
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      
      // For cookie-based auth, ensure we're sending the token as a cookie too
      if (config.withCredentials) {
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='));
          
        if (!cookieValue) {
          document.cookie = `token=${session.access_token}; path=/; SameSite=Lax`;
        }
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Service for interacting with the API
const apiService = {
  // Standard REST methods
  get: async (endpoint: string) => {
    return await apiClient.get(endpoint);
  },

  post: async (endpoint: string, data: any) => {
    return await apiClient.post(endpoint, data);
  },

  put: async (endpoint: string, data: any) => {
    return await apiClient.put(endpoint, data);
  },

  delete: async (endpoint: string) => {
    return await apiClient.delete(endpoint);
  },

  // File upload methods
  uploadFile: async (endpoint: string, formData: FormData) => {
    // Ensure we're using the proper endpoint format - remove any leading slashes
    const sanitizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    return await apiClient.post(sanitizedEndpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Dashboard specific methods
  getDashboardData: async () => {
    try {
      const response = await apiClient.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Frontend operations
  deployStaticSite: async (siteData: {
    siteName: string;
    domain: string;
    extractPath: string;
  }) => {
    return await apiClient.post('/deploy/static', siteData);
  },

  // Backend operations
  deployBackendService: async (serviceData: {
    serviceName: string;
    domain: string;
    port?: number;
    extractPath: string;
    type: string;
  }) => {
    return await apiClient.post('/deploy/backend', serviceData);
  },

  // Docker operations
  deployDockerContainer: async (containerData: {
    containerName: string;
    domain: string;
    port?: number;
    extractPath: string;
  }) => {
    return await apiClient.post('/deploy/docker', containerData);
  },

  // Service management
  startService: async (serviceType: string, serviceId: string) => {
    return await apiClient.post(`/${serviceType}/${serviceId}/start`);
  },

  stopService: async (serviceType: string, serviceId: string) => {
    return await apiClient.post(`/${serviceType}/${serviceId}/stop`);
  },

  restartService: async (serviceType: string, serviceId: string) => {
    return await apiClient.post(`/${serviceType}/${serviceId}/restart`);
  },

  deleteService: async (serviceType: string, serviceId: string) => {
    return await apiClient.delete(`/${serviceType}/${serviceId}`);
  },

  getServiceLogs: async (serviceType: string, serviceId: string) => {
    return await apiClient.get(`/${serviceType}/${serviceId}/logs`);
  },

  // Test API connection
  testConnection: async () => {
    return await apiClient.get('/health');
  }
};

export default apiService; 