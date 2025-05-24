import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// User data interface based on Supabase auth
interface User {
  id: string;
  email?: string;
  user_metadata?: any;
  app_metadata?: any;
  aud: string;
  role?: string;
  exp?: number;
}

// Add user property to Express Request
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Authentication middleware that validates Supabase JWT tokens
 * Tokens can come from Authorization header or HTTP-only cookies
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Skip authentication for development if configured
  if (process.env.SKIP_AUTH === 'true') {
    console.log('⚠️  Authentication skipped (SKIP_AUTH=true)');
    next();
    return;
  }
  
  try {
    // Extract token from cookie or Authorization header
    let token: string | undefined;
    
    // First, try to get token from HTTP-only cookie
    if (req.cookies?.token) {
      token = req.cookies.token;
    }
    // Fallback to Authorization header (Bearer token)
    else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }
    
    if (!token) {
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided. Please log in.' 
      });
      return;
    }
    
    // Verify token with Supabase
    const { data: userData, error } = await supabase.auth.getUser(token);
    
    if (error || !userData?.user) {
      console.error('Supabase auth error:', error?.message);
      res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token verification failed. Please log in again.' 
      });
      return;
    }
    
    // Extract user information from verified token
    req.user = {
      id: userData.user.id,
      email: userData.user.email,
      user_metadata: userData.user.user_metadata,
      app_metadata: userData.user.app_metadata,
      aud: userData.user.aud,
      role: userData.user.role,
    };
    
    console.log(`✅ User authenticated: ${userData.user.email || userData.user.id}`);
    next();
    
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Internal server error during authentication.' 
    });
  }
}; 