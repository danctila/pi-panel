import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * Create session with token from Supabase client
 * Frontend sends the JWT token after successful Supabase login
 */
router.post('/session', (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      res.status(400).json({ 
        error: 'Token required',
        message: 'access_token is required in request body' 
      });
      return;
    }
    
    // Set token as HTTP-only cookie for secure session management
    res.cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days (matches Supabase default)
    });
    
    res.status(200).json({ 
      status: 'success', 
      message: 'Session established successfully' 
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ 
      error: 'Session failed',
      message: 'Failed to create session' 
    });
  }
});

/**
 * Check authentication status
 * Protected route that validates current session
 */
router.get('/status', authenticate, (req, res) => {
  res.json({ 
    status: 'authenticated',
    message: 'Valid session active',
    user: {
      id: req.user?.id,
      email: req.user?.email,
      // Don't expose sensitive metadata in status check
    }
  });
});

/**
 * Logout - clear session cookie
 * Removes the HTTP-only cookie containing the JWT
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  
  res.status(200).json({ 
    status: 'success', 
    message: 'Logged out successfully' 
  });
});

export default router; 