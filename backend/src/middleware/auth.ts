import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import axios from 'axios';

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

// Cache for JWKS (avoid fetching on every request)
let jwksCache: any = null;
let jwksCacheTime = 0;
const JWKS_CACHE_DURATION = 3600000; // 1 hour in ms

// Fetch JWKS from Supabase
const fetchJWKS = async (): Promise<any> => {
  const now = Date.now();
  
  // Return cached JWKS if still valid
  if (jwksCache && (now - jwksCacheTime) < JWKS_CACHE_DURATION) {
    return jwksCache;
  }
  
  // Get Supabase project URL from environment variable
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is not defined in environment variables');
  }
  
  const response = await axios.get(`${supabaseUrl}/auth/v1/jwks`);
  jwksCache = response.data;
  jwksCacheTime = now;
  return jwksCache;
};

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Skip authentication for development if needed
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
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
    
    // Get JWT header to extract kid (key ID)
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded !== 'object' || !decoded.header || !decoded.header.kid) {
      res.status(401).json({ message: 'Invalid token format' });
      return;
    }
    
    // Fetch JWKs from Supabase
    const jwks = await fetchJWKS();
    const jwk = jwks.keys.find((key: any) => key.kid === decoded.header.kid);
    
    if (!jwk) {
      res.status(401).json({ message: 'Invalid token signature' });
      return;
    }
    
    // Convert JWK to PEM
    const pem = jwkToPem(jwk);
    
    // Verify the token
    const verified = jwt.verify(token, pem);
    if (typeof verified !== 'object') {
      throw new Error('Token verification failed');
    }
    
    // Attach user data to request
    req.user = verified as User;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed', error: (error as Error).message });
  }
}; 