import express from 'express';
import { getMachines, createMachine, reportMachine } from '../controllers/machineController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMachines)
  .post(protect, authorize('Admin', 'Staff'), createMachine);

router.route('/:id/report')
  .put(protect, reportMachine);

export default router;
