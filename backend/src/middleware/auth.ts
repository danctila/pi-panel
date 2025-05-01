import { Request, Response, NextFunction } from 'express';

// Simple Tailscale IP-based authentication
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.socket.remoteAddress || '';
  
  // Check if request is coming from localhost or private IP (Tailscale network)
  const isLocalhost = clientIp === '127.0.0.1' || clientIp === '::1';
  const isPrivateNetwork = 
    clientIp.startsWith('10.') || 
    clientIp.startsWith('100.') || // Tailscale typically uses 100.x.x.x
    clientIp.startsWith('172.16.') || 
    clientIp.startsWith('192.168.');
  
  if (isLocalhost || isPrivateNetwork) {
    next();
  } else {
    // Not from Tailscale network
    res.status(401).json({ 
      message: 'Access denied',
      error: 'This panel is only accessible via Tailscale network'
    });
  }
}; 