import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../../config.js';
import { totp } from '../utils/totp.js';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Miembro',
      totpSecret: totp.generateSecret(),
      currentStreak: 0
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipStatus: user.membershipStatus,
        membershipExpiration: user.membershipExpiration,
        planId: user.currentPlan,
        totpSecret: user.totpSecret,
        currentStreak: user.currentStreak,
        lastAccessDate: user.lastAccessDate,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Datos de usuario inválidos' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Ensure totpSecret exists for legacy users
      if (!user.totpSecret) {
        user.totpSecret = totp.generateSecret();
        await user.save();
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipStatus: user.membershipStatus,
        membershipExpiration: user.membershipExpiration,
        planId: user.currentPlan,
        totpSecret: user.totpSecret,
        currentStreak: user.currentStreak,
        lastAccessDate: user.lastAccessDate,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email o contraseña inválidos' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
