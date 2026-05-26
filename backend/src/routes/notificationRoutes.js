import express from 'express';
import { manualCheckExpiring } from '../controllers/notificationController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All notification routes require Admin role
router.use(protect, authorize('Admin'));

router.post('/check-expiring', manualCheckExpiring);

export default router;
