import express from 'express';
import { authenticate } from '../middleware/auth';
import { 
  deployStaticSite,
  deployBackendService,
  deployDockerContainer
} from '../controllers/deploy';

const router = express.Router();

// Apply authentication middleware to all deploy routes
router.use(authenticate);

// Deployment endpoints
router.post('/static', deployStaticSite);
router.post('/backend', deployBackendService);
router.post('/docker', deployDockerContainer);

export default router; 