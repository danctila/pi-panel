import express from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { 
  uploadStaticSite,
  uploadBackendService,
  uploadDockerContainer
} from '../controllers/upload';

const router = express.Router();

// Apply authentication middleware to all upload routes
router.use(authenticate);

// Upload endpoints
router.post('/static', upload.single('siteZip'), uploadStaticSite);
router.post('/backend', upload.single('serviceZip'), uploadBackendService);
router.post('/docker', upload.single('containerZip'), uploadDockerContainer);

export default router; 