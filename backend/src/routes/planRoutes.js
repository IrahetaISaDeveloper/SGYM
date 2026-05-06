import express from 'express';
import { getPlans } from '../controllers/planController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get plans (could be public, but let's keep it protected for Staff/Admin to fetch for renewal)
router.get('/', protect, getPlans);

export default router;
