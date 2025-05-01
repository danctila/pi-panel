import { Request, Response } from 'express';

// Mock container data
const mockContainers = [
  {
    id: 'abc123def456',
    name: 'wordpress',
    image: 'wordpress:latest',
    status: 'running',
    state: 'running',
    ports: [
      { internal: 80, external: 8080 }
    ],
    volumes: [
      'wordpress_data:/var/www/html'
    ],
    networks: ['bridge'],
    created: '2023-05-20T09:30:00Z'
  },
  {
    id: 'xyz789uvw321',
    name: 'mongodb',
    image: 'mongo:latest',
    status: 'running',
    state: 'running',
    ports: [
      { internal: 27017, external: 27017 }
    ],
    volumes: [
      'mongo_data:/data/db'
    ],
    networks: ['bridge'],
    created: '2023-05-25T13:45:00Z'
  },
  {
    id: 'jkl456mno789',
    name: 'redis',
    image: 'redis:alpine',
    status: 'stopped',
    state: 'exited',
    ports: [
      { internal: 6379, external: 6379 }
    ],
    volumes: [],
    networks: ['bridge'],
    created: '2023-06-01T10:15:00Z'
  }
];

// Mock volumes data
const mockVolumes = [
  {
    name: 'wordpress_data',
    driver: 'local',
    mountpoint: '/var/lib/docker/volumes/wordpress_data/_data'
  },
  {
    name: 'mongo_data',
    driver: 'local',
    mountpoint: '/var/lib/docker/volumes/mongo_data/_data'
  }
];

// Mock networks data
const mockNetworks = [
  {
    id: 'net123',
    name: 'bridge',
    driver: 'bridge',
    scope: 'local',
    internal: false
  },
  {
    id: 'net456',
    name: 'host',
    driver: 'host',
    scope: 'local',
    internal: false
  }
];

// Get all containers
export const getContainers = (req: Request, res: Response): void => {
  res.json({
    status: 'success',
    message: 'Containers retrieved successfully',
    data: mockContainers
  });
};

// Get a specific container by ID
export const getContainerById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const container = mockContainers.find(c => c.id === id);
  
  if (!container) {
    res.status(404).json({
      status: 'error',
      message: 'Container not found'
    });
    return;
  }
  
  res.json({
    status: 'success',
    message: 'Container retrieved successfully',
    data: container
  });
};

// Create a new container
export const createContainer = (req: Request, res: Response): void => {
  const { name, image, ports, volumes } = req.body;
  
  res.status(201).json({
    status: 'success',
    message: 'Container created successfully',
    data: {
      id: Math.random().toString(36).substring(7) + Math.random().toString(36).substring(7),
      name: name || 'new-container',
      image: image || 'alpine:latest',
      status: 'created',
      state: 'created',
      ports: ports || [],
      volumes: volumes || [],
      networks: ['bridge'],
      created: new Date().toISOString()
    }
  });
};

// Delete a container
export const deleteContainer = (req: Request, res: Response): void => {
  const { id } = req.params;
  const containerExists = mockContainers.some(c => c.id === id);
  
  if (!containerExists) {
    res.status(404).json({
      status: 'error',
      message: 'Container not found'
    });
    return;
  }
  
  res.json({
    status: 'success',
    message: 'Container deleted successfully'
  });
};

// Start a container
export const startContainer = (req: Request, res: Response): void => {
  const { id } = req.params;
  const container = mockContainers.find(c => c.id === id);
  
  if (!container) {
    res.status(404).json({
      status: 'error',
      message: 'Container not found'
    });
    return;
  }
  
  res.json({
    status: 'success',
    message: `Container '${container.name}' started successfully`,
    data: {
      ...container,
      status: 'running',
      state: 'running'
    }
  });
};

// Stop a container
export const stopContainer = (req: Request, res: Response): void => {
  const { id } = req.params;
  const container = mockContainers.find(c => c.id === id);
  
  if (!container) {
    res.status(404).json({
      status: 'error',
      message: 'Container not found'
    });
    return;
  }
  
  res.json({
    status: 'success',
    message: `Container '${container.name}' stopped successfully`,
    data: {
      ...container,
      status: 'stopped',
      state: 'exited'
    }
  });
};

// Restart a container
export const restartContainer = (req: Request, res: Response): void => {
  const { id } = req.params;
  const container = mockContainers.find(c => c.id === id);
  
  if (!container) {
    res.status(404).json({
      status: 'error',
      message: 'Container not found'
    });
    return;
  }
  
  res.json({
    status: 'success',
    message: `Container '${container.name}' restarted successfully`,
    data: {
      ...container,
      status: 'running',
      state: 'running'
    }
  });
};

// Get logs for a container
export const getContainerLogs = (req: Request, res: Response): void => {
  const { id } = req.params;
  const container = mockContainers.find(c => c.id === id);
  
  if (!container) {
    res.status(404).json({
      status: 'error',
      message: 'Container not found'
    });
    return;
  }
  
  const mockLogs = [
    `[${new Date().toISOString()}] INFO: Container started`,
    `[${new Date().toISOString()}] INFO: Service initialized`,
    `[${new Date().toISOString()}] INFO: Accepting connections`,
    `[${new Date().toISOString()}] INFO: Client connected from 192.168.1.1`
  ];
  
  res.json({
    status: 'success',
    message: `Logs retrieved for ${container.name}`,
    data: mockLogs
  });
};

// Get all volumes
export const getVolumes = (req: Request, res: Response): void => {
  res.json({
    status: 'success',
    message: 'Volumes retrieved successfully',
    data: mockVolumes
  });
};

// Get all networks
export const getNetworks = (req: Request, res: Response): void => {
  res.json({
    status: 'success',
    message: 'Networks retrieved successfully',
    data: mockNetworks
  });
}; 