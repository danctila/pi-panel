import { Request, Response } from 'express';

// Get dashboard data
export const getDashboardData = (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Dashboard accessed via Tailscale',
    data: {
      services: [],
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version
      }
    }
  });
}; 