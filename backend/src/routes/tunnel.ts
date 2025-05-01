import express from 'express';
import { authenticate } from '../middleware/auth';
import { 
  getTunnelConfig,
  getTunnelStatus,
  addTunnelRoute,
  removeTunnelRoute,
  restartTunnel,
  getTunnelLogs
} from '../controllers/tunnel';

const router = express.Router();

// Apply authentication middleware to all tunnel routes
router.use(authenticate);

// Tunnel management endpoints
router.get('/config', getTunnelConfig);
router.get('/status', getTunnelStatus);
router.post('/routes', addTunnelRoute);
router.delete('/routes/:hostname', removeTunnelRoute);
router.post('/restart', restartTunnel);
router.get('/logs', getTunnelLogs);

export default router; 