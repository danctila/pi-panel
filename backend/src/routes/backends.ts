import express from 'express';
import { authenticate } from '../middleware/auth';
import { 
  getBackends,
  getBackendById,
  createBackend,
  updateBackend,
  deleteBackend,
  startBackend,
  stopBackend,
  restartBackend,
  getLogs
} from '../controllers/backends';

const router = express.Router();

// Apply authentication middleware to all backends routes
router.use(authenticate);

// Backend services endpoints
router.get('/', getBackends);
router.get('/:id', getBackendById);
router.post('/', createBackend);
router.put('/:id', updateBackend);
router.delete('/:id', deleteBackend);

// Process management endpoints
router.post('/:id/start', startBackend);
router.post('/:id/stop', stopBackend);
router.post('/:id/restart', restartBackend);

// Logs endpoint
router.get('/:id/logs', getLogs);

export default router; 