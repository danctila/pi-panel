import { Request, Response } from 'express';

// Mock backend service data
const mockBackends = [
  {
    id: '1',
    name: 'Node API Service',
    type: 'nodejs',
    status: 'running',
    port: 3000,
    url: 'api.example.com',
    directory: '/opt/backends/node-api',
    lastDeployed: '2023-06-10T08:20:00Z',
    pm2Id: 0
  },
  {
    id: '2',
    name: 'Flask App',
    type: 'python',
    status: 'stopped',
    port: 5000,
    url: 'flask.example.com',
    directory: '/opt/backends/flask-app',
    lastDeployed: '2023-07-05T11:15:00Z',
    pm2Id: 1
  }
];

// Get all backend services
export const getBackends = (req: Request, res: Response): void => {
  res.json({
    status: 'success',
    message: 'Backend services retrieved successfully',
    data: mockBackends
  });
};

// Get a specific backend service by ID
export const getBackendById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const backend = mockBackends.find(b => b.id === id);
  
  if (!backend) {
    res.status(404).json({
      status: 'error',
      message: 'Backend service not found'
    });
    return;
  }
  
  res.json({
    status: 'success',
    message: 'Backend service retrieved successfully',
    data: backend
  });
};

// Create a new backend service
export const createBackend = (req: Request, res: Response): void => {
  res.status(201).json({
    status: 'success',
    message: 'Backend service created successfully',
    data: {
      id: String(mockBackends.length + 1),
      ...req.body,
      status: 'deploying',
      lastDeployed: new Date().toISOString(),
      pm2Id: mockBackends.length
    }
  });
};

// Update a backend service
export const updateBackend = (req: Request, res: Response): void => {
  const { id } = req.params;
  const backendExists = mockBackends.some(b => b.id === id);
  
  if (!backendExists) {
    res.status(404).json({
      status: 'error',
      message: 'Backend service not found'
    });
    return;
  }
  
  res.json({
    status: 'success',
    message: 'Backend service updated successfully',
    data: {
      id,
      ...req.body,
      lastDeployed: new Date().toISOString()
    }
  });
};

// Delete a backend service
export const deleteBackend = (req: Request, res: Response): void => {
  const { id } = req.params;
  const backendExists = mockBackends.some(b => b.id === id);
  
  if (!backendExists) {
    res.status(404).json({
      status: 'error',
      message: 'Backend service not found'
    });
    return;
  }
  
  res.json({
    status: 'success',
    message: 'Backend service deleted successfully'
  });
};

// Start a backend service
export const startBackend = (req: Request, res: Response): void => {
  const { id } = req.params;
  const backend = mockBackends.find(b => b.id === id);
  
  if (!backend) {
    res.status(404).json({
      status: 'error',
      message: 'Backend service not found'
    });
    return;
  }
  
  res.json({
    status: 'success',
    message: `Backend service '${backend.name}' started successfully`,
    data: {
      ...backend,
      status: 'running'
    }
  });
};

// Stop a backend service
export const stopBackend = (req: Request, res: Response): void => {
  const { id } = req.params;
  const backend = mockBackends.find(b => b.id === id);
  
  if (!backend) {
    res.status(404).json({
      status: 'error',
      message: 'Backend service not found'
    });
    return;
  }
  
  res.json({
    status: 'success',
    message: `Backend service '${backend.name}' stopped successfully`,
    data: {
      ...backend,
      status: 'stopped'
    }
  });
};

// Restart a backend service
export const restartBackend = (req: Request, res: Response): void => {
  const { id } = req.params;
  const backend = mockBackends.find(b => b.id === id);
  
  if (!backend) {
    res.status(404).json({
      status: 'error',
      message: 'Backend service not found'
    });
    return;
  }
  
  res.json({
    status: 'success',
    message: `Backend service '${backend.name}' restarted successfully`,
    data: {
      ...backend,
      status: 'running'
    }
  });
};

// Get logs for a backend service
export const getLogs = (req: Request, res: Response): void => {
  const { id } = req.params;
  const backend = mockBackends.find(b => b.id === id);
  
  if (!backend) {
    res.status(404).json({
      status: 'error',
      message: 'Backend service not found'
    });
    return;
  }
  
  const mockLogs = [
    `[${new Date().toISOString()}] INFO: Server started on port ${backend.port}`,
    `[${new Date().toISOString()}] INFO: Connected to database`,
    `[${new Date().toISOString()}] INFO: API ready to accept requests`,
    `[${new Date().toISOString()}] INFO: Processed request from 192.168.1.1`
  ];
  
  res.json({
    status: 'success',
    message: `Logs retrieved for ${backend.name}`,
    data: mockLogs
  });
}; 