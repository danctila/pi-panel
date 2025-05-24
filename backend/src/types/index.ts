// User and auth types
export interface User {
  id: string;
  username: string;
  password: string; // Hashed
  role: 'admin' | 'user';
}

// Frontend site types
export interface FrontendSite {
  id: string;
  name: string;
  domain: string;
  path: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Backend service types
export interface BackendService {
  id: string;
  name: string;
  type: 'nodejs' | 'python' | 'go' | 'docker' | 'other';
  domain: string;
  port: number;
  path: string;
  status: 'running' | 'stopped' | 'error';
  pid?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Docker container types
export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'error';
  port: number;
  path: string;
  domain: string;
  createdAt: Date;
  updatedAt: Date;
}

// Upload response types
export interface UploadResponse {
  success: boolean;
  message: string;
  file?: {
    path: string;
    originalName: string;
    size: number;
  };
  extractPath?: string;
  zipFilePath?: string; // Path to the original uploaded zip file for cleanup
  sanitizedName?: string; // The sanitized name used for deployment
  error?: string;
}

// Deployment response types
export interface DeploymentResponse {
  success: boolean;
  message: string;
  service?: FrontendSite | BackendService | DockerContainer;
  details?: {
    targetPath?: string;
    configPath?: string;
    nginxDeployed?: boolean;
    tunnelConfigured?: boolean;
    tunnelError?: string;
    port?: number;
    pm2Started?: boolean;
  };
  error?: string;
}

// Tunnel configuration
export interface TunnelConfig {
  id: string;
  name: string;
  domain: string;
  service: 'frontend' | 'backend' | 'docker';
  serviceId: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// API error type
export interface APIError {
  status: number;
  message: string;
  error?: any;
} 