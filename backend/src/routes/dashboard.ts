import express from 'express';
import { authenticate } from '../middleware/auth';
import { getDashboardData } from '../controllers/dashboard';

const router = express.Router();

// Apply authentication middleware to all dashboard routes
router.use(authenticate);

// Get dashboard data
router.get('/', getDashboardData);

export default router; 