import User from '../models/User.js';
import Plan from '../models/Plan.js';
import Payment from '../models/Payment.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin/Staff
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).populate('currentPlan');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin/Staff
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('currentPlan');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Renew user membership
// @route   POST /api/users/:id/renew
// @access  Private/Admin/Staff
export const renewMembership = async (req, res) => {
  try {
    const { planId, amount } = req.body;
    
    const user = await User.findById(req.params.id);
    const plan = await Plan.findById(planId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (!plan) {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }

    // Registrar pago
    const payment = await Payment.create({
      user: user._id,
      amount: amount || plan.price,
      status: 'Completado',
    });

    // Calcular fecha de expiración
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + plan.durationInDays);

    // Actualizar usuario
    user.membershipStatus = 'Activa';
    user.currentPlan = plan._id;
    user.membershipExpiration = expirationDate;
    await user.save();

    res.json({
      message: 'Membresía renovada exitosamente',
      user: {
        _id: user._id,
        name: user.name,
        membershipStatus: user.membershipStatus,
        currentPlan: plan,
      },
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
