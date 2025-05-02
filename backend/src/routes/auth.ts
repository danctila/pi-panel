import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Create session with token from Supabase
router.post('/session', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      res.status(400).json({ message: 'Token is required' });
      return;
    }
    
    // Set token as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
    });
    
    res.status(200).json({ status: 'success', message: 'Session established' });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ message: 'Failed to create session' });
  }
});

// Auth status check
router.get('/status', authenticate, (req, res) => {
  res.json({ 
    status: 'authenticated',
    message: 'You are authenticated with a valid token',
    user: req.user
  });
});

// Logout - clear cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

export default router; 