import express from 'express';
import {
  openShift,
  closeShift,
  getActiveShift,
  registerSale,
} from '../controllers/shiftController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes here are protected and require Admin or Staff role
router.use(protect, authorize('Admin', 'Staff'));

router.post('/open', openShift);
router.post('/close', closeShift);
router.get('/active', getActiveShift);
router.post('/sale', registerSale);

export default router;
