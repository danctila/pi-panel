import { Request, Response } from 'express';

// Mock tunnel configuration
const mockTunnelConfig = {
  accountTag: 'abcdef1234567890',
  tunnelID: 'cf-tunnel-123456789',
  tunnelName: 'raspberry-pi-tunnel',
  tunnelSecret: 'mock-secret-token',
  credentials: {
    path: '/home/pi/.cloudflared/credentials.json'
  },
  ingress: [
    {
      hostname: 'frontend1.example.com',
      service: 'http://localhost:8080'
    },
    {
      hostname: 'api.example.com',
      service: 'http://localhost:3000'
    },
    {
      hostname: 'wordpress.example.com',
      service: 'http://localhost:8081'
    },
    {
      hostname: '*',
      service: 'http_status:404'
    }
  ]
};

// Mock tunnel status
const mockTunnelStatus = {
  status: 'running',
  connections: 2,
  uptime: '2d 5h 30m',
  version: '2023.5.0',
  metrics: {
    requests: 1245,
    bytesIn: 1024000,
    bytesOut: 5120000
  }
};

// Get tunnel configuration
export const getTunnelConfig = (req: Request, res: Response): void => {
  res.json({
    status: 'success',
    message: 'Tunnel configuration retrieved successfully',
    data: mockTunnelConfig
  });
};

// Get tunnel status
export const getTunnelStatus = (req: Request, res: Response): void => {
  res.json({
    status: 'success',
    message: 'Tunnel status retrieved successfully',
    data: mockTunnelStatus
  });
};

// Add a new tunnel route
export const addTunnelRoute = (req: Request, res: Response): void => {
  const { hostname, service } = req.body;
  
  if (!hostname || !service) {
    res.status(400).json({
      status: 'error',
      message: 'Hostname and service are required'
    });
    return;
  }
  
  // In a real implementation, we would add the route to the tunnel config
  // and reload the tunnel. For Phase 1, we just return mock success.
  
  res.status(201).json({
    status: 'success',
    message: `Route for ${hostname} added successfully`,
    data: {
      hostname,
      service
    }
  });
};

// Remove a tunnel route
export const removeTunnelRoute = (req: Request, res: Response): void => {
  const { hostname } = req.params;
  
  // Check if route exists in mock config
  const routeExists = mockTunnelConfig.ingress.some(
    route => route.hostname === hostname
  );
  
  if (!routeExists) {
    res.status(404).json({
      status: 'error',
      message: `Route for ${hostname} not found`
    });
    return;
  }
  
  // In a real implementation, we would remove the route from the tunnel config
  // and reload the tunnel. For Phase 1, we just return mock success.
  
  res.json({
    status: 'success',
    message: `Route for ${hostname} removed successfully`
  });
};

// Restart the tunnel
export const restartTunnel = (req: Request, res: Response): void => {
  // In a real implementation, we would restart the cloudflared service.
  // For Phase 1, we just return mock success.
  
  res.json({
    status: 'success',
    message: 'Cloudflare Tunnel restarted successfully',
    data: {
      ...mockTunnelStatus,
      uptime: '0h 0m 5s'
    }
  });
};

// Get tunnel logs
export const getTunnelLogs = (req: Request, res: Response): void => {
  const mockLogs = [
    `[${new Date().toISOString()}] INF Starting tunnel tunnelID=cf-tunnel-123456789`,
    `[${new Date().toISOString()}] INF Registered connIndex=0 connection=1234567890`,
    `[${new Date().toISOString()}] INF Metrics server listening on 127.0.0.1:1234`,
    `[${new Date().toISOString()}] INF Request processed connIndex=0 host=api.example.com status=200`
  ];
  
  res.json({
    status: 'success',
    message: 'Tunnel logs retrieved successfully',
    data: mockLogs
  });
}; 