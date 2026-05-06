import express from 'express';
import { getExercises } from '../controllers/exerciseController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getExercises);

export default router;
