import express from 'express';
import { authenticate } from '../middleware/auth';
import { 
  getFrontends,
  getFrontendById,
  createFrontend,
  updateFrontend,
  deleteFrontend
} from '../controllers/frontends';

const router = express.Router();

// Apply authentication middleware to all frontends routes
router.use(authenticate);

// Frontend sites endpoints
router.get('/', getFrontends);
router.get('/:id', getFrontendById);
router.post('/', createFrontend);
router.put('/:id', updateFrontend);
router.delete('/:id', deleteFrontend);

export default router; 