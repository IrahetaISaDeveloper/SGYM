import express from 'express';
import { getUsers, getUserById, renewMembership } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(authorize('Admin', 'Staff'), getUsers);

// Permite a Admin/Staff ver cualquier usuario, y a un Miembro ver su propio perfil
router.route('/:id').get((req, res, next) => {
  if (
    req.user.role === 'Admin' || 
    req.user.role === 'Staff' || 
    req.user._id.toString() === req.params.id
  ) {
    return getUserById(req, res, next);
  }
  return res.status(403).json({ message: 'No autorizado para ver este perfil' });
});

router.route('/:id/renew').post(authorize('Admin', 'Staff'), renewMembership);

export default router;
