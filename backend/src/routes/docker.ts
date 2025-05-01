import express from 'express';
import { authenticate } from '../middleware/auth';
import { 
  getContainers,
  getContainerById,
  createContainer,
  deleteContainer,
  startContainer,
  stopContainer,
  restartContainer,
  getContainerLogs,
  getVolumes,
  getNetworks
} from '../controllers/docker';

const router = express.Router();

// Apply authentication middleware to all docker routes
router.use(authenticate);

// Container management endpoints
router.get('/containers', getContainers);
router.get('/containers/:id', getContainerById);
router.post('/containers', createContainer);
router.delete('/containers/:id', deleteContainer);
router.post('/containers/:id/start', startContainer);
router.post('/containers/:id/stop', stopContainer);
router.post('/containers/:id/restart', restartContainer);
router.get('/containers/:id/logs', getContainerLogs);

// Volume and network endpoints
router.get('/volumes', getVolumes);
router.get('/networks', getNetworks);

export default router; 