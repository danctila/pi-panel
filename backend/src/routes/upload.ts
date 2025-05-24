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

// Debug middleware for logging all request details
const debugRequestMiddleware = (req, res, next) => {
  console.log('==== UPLOAD REQUEST RECEIVED ====');
  console.log('Request Path:', req.path);
  console.log('Request Method:', req.method);
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request Query:', req.query);
  console.log('Request Body:', req.body);
  console.log('Request Cookies:', req.cookies);
  console.log('IP Address:', req.ip);
  console.log('================================');
  next();
};

// Apply debug middleware to all upload routes
router.use(debugRequestMiddleware);

// Upload endpoints
router.post('/static', upload.single('siteZip'), (req, res, next) => {
  console.log('==== STATIC SITE UPLOAD DETAILS ====');
  console.log('File:', req.file);
  console.log('Body after file upload:', req.body);
  console.log('====================================');
  next();
}, uploadStaticSite);
router.post('/backend', upload.single('serviceZip'), (req, res, next) => {
  console.log('==== BACKEND APP UPLOAD DETAILS ====');
  console.log('File:', req.file);
  console.log('Body after file upload:', req.body);
  console.log('====================================');
  next();
}, uploadBackendService);
router.post('/docker', upload.single('containerZip'), (req, res, next) => {
  console.log('==== DOCKER APP UPLOAD DETAILS ====');
  console.log('File:', req.file);
  console.log('Body after file upload:', req.body);
  console.log('====================================');
  next();
}, uploadDockerContainer);

export default router; 