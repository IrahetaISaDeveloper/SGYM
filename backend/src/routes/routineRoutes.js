import express from 'express';
import { getMyRoutine, saveMyRoutine } from '../controllers/routineController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyRoutine);
router.put('/me', protect, saveMyRoutine);

export default router;
