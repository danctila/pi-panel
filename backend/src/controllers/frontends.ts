import { Request, Response } from 'express';

// Mock frontend site data
const mockFrontends = [
  {
    id: '1',
    name: 'Personal Portfolio',
    domain: 'portfolio.example.com',
    status: 'running',
    directory: '/var/www/portfolio',
    lastDeployed: '2023-06-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Company Website',
    domain: 'company.example.com',
    status: 'running',
    directory: '/var/www/company',
    lastDeployed: '2023-07-20T14:45:00Z'
  }
];

// Get all frontend sites
export const getFrontends = (req: Request, res: Response): void => {
  res.json({
    status: 'success',
    message: 'Frontend sites retrieved successfully',
    data: mockFrontends
  });
};

// Get a specific frontend site by ID
export const getFrontendById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const frontend = mockFrontends.find(f => f.id === id);
  
  if (!frontend) {
    res.status(404).json({
      status: 'error',
      message: 'Frontend site not found'
    });
    return;
  }
  
  res.json({
    status: 'success',
    message: 'Frontend site retrieved successfully',
    data: frontend
  });
};

// Create a new frontend site
export const createFrontend = (req: Request, res: Response): void => {
  res.status(201).json({
    status: 'success',
    message: 'Frontend site created successfully',
    data: {
      id: String(mockFrontends.length + 1),
      ...req.body,
      status: 'deploying',
      lastDeployed: new Date().toISOString()
    }
  });
};

// Update a frontend site
export const updateFrontend = (req: Request, res: Response): void => {
  const { id } = req.params;
  const frontendExists = mockFrontends.some(f => f.id === id);
  
  if (!frontendExists) {
    res.status(404).json({
      status: 'error',
      message: 'Frontend site not found'
    });
    return;
  }
  
  res.json({
    status: 'success',
    message: 'Frontend site updated successfully',
    data: {
      id,
      ...req.body,
      lastDeployed: new Date().toISOString()
    }
  });
};

// Delete a frontend site
export const deleteFrontend = (req: Request, res: Response): void => {
  const { id } = req.params;
  const frontendExists = mockFrontends.some(f => f.id === id);
  
  if (!frontendExists) {
    res.status(404).json({
      status: 'error',
      message: 'Frontend site not found'
    });
    return;
  }
  
  res.json({
    status: 'success',
    message: 'Frontend site deleted successfully'
  });
}; 