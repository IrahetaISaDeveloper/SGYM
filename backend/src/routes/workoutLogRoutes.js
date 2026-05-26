import express from 'express';
import {
  createWorkoutLog,
  getLastLog,
  getExerciseHistory,
} from '../controllers/workoutLogController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createWorkoutLog);
router.get('/last/:exerciseId', protect, getLastLog);
router.get('/history/:exerciseId', protect, getExerciseHistory);

export default router;
