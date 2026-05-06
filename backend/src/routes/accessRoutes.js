import express from 'express';
import { generateQR, scanQR, getMyLogs } from '../controllers/accessController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/generate-qr', protect, generateQR);
router.post('/scan', protect, authorize('Admin', 'Staff'), scanQR);
router.get('/my-logs', protect, getMyLogs);

export default router;
