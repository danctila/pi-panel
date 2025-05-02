import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// User data interface
interface User {
  id: string;
  email: string;
  app_metadata: any;
  user_metadata: any;
  aud: string;
}

// Add user property to Express Request
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Skip authentication for development if needed
  if (process.env.SKIP_AUTH === 'true') {
    next();
    return;
  }
  
  try {
    // Get token from cookie
    const token = req.cookies?.token;
    
    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    try {
      // Validate token
      const decoded = jwt.decode(token);
      
      if (!decoded || typeof decoded !== 'object') {
        throw new Error('Invalid token format');
      }
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        throw new Error('Token has expired');
      }
      
      // Use the decoded token data as the user
      req.user = decoded as User;
      next();
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(401).json({ message: 'Authentication failed', error: (error as Error).message });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed', error: (error as Error).message });
  }
}; 