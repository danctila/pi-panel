import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Auth status check
router.get('/status', authenticate, (req, res) => {
  res.json({ 
    status: 'authenticated',
    message: 'You are accessing via Tailscale network',
    ip: req.ip || req.socket.remoteAddress
  });
});

export default router; 