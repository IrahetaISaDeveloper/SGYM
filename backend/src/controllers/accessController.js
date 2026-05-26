import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../../config.js';
import { totp } from '../utils/totp.js';
import AccessLog from '../models/AccessLog.js';

// @desc    Generate QR Token for access
// @route   GET /api/access/generate-qr
// @access  Private
export const generateQR = async (req, res) => {
  try {
    // This endpoint is no longer strictly needed for TOTP since frontend generates it,
    // but we can return the current TOTP token just in case or for legacy support.
    const user = req.user;
    if (!user.totpSecret) {
      user.totpSecret = totp.generateSecret();
      await user.save();
    }
    const token = await totp.generate({ secret: user.totpSecret });
    // Return a JSON string that will be encoded into the QR
    const qrPayload = JSON.stringify({ id: user._id, code: token });
    res.json({ qrToken: qrPayload });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Scan QR Token for access
// @route   POST /api/access/scan
// @access  Private/Admin/Staff
export const scanQR = async (req, res) => {
  try {
    const { token } = req.body; // Expects JSON string from QR

    if (!token) {
      return res.status(400).json({ message: 'No se proporcionó token' });
    }

    let payload;
    try {
      payload = JSON.parse(token);
    } catch (e) {
      return res.status(400).json({ message: 'Formato de QR inválido', granted: false });
    }

    const { id, code } = payload;
    if (!id || !code) {
      return res.status(400).json({ message: 'QR incompleto', granted: false });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado', granted: false });
    }

    // Verify TOTP
    if (!user.totpSecret) {
      return res.status(400).json({ message: 'El usuario no tiene TOTP configurado', granted: false });
    }

    const result = await totp.verify(code, { secret: user.totpSecret });
    const isValid = result?.valid;
    if (!isValid) {
      return res.status(400).json({ message: 'Código QR expirado o inválido', granted: false });
    }

    // Verificar estado de la membresía
    if (user.membershipStatus !== 'Activa') {
      await AccessLog.create({
        user: user._id,
        granted: false,
        reason: 'Membresía inactiva o vencida',
      });
      return res.status(403).json({ message: 'Acceso denegado: Membresía inactiva', granted: false });
    }

    // Streak Logic (48 hours window)
    const now = new Date();
    if (user.lastAccessDate) {
      const lastAccess = new Date(user.lastAccessDate);
      const diffMs = now - lastAccess;
      const diffHours = diffMs / (1000 * 60 * 60);

      // Are they on the same calendar day?
      const isSameDay = now.toDateString() === lastAccess.toDateString();

      if (!isSameDay) {
        if (diffHours <= 48) {
          user.currentStreak += 1;
        } else {
          user.currentStreak = 1;
        }
      }
    } else {
      user.currentStreak = 1;
    }

    user.lastAccessDate = now;
    await user.save();

    // Registrar acceso concedido
    await AccessLog.create({
      user: user._id,
      granted: true,
      reason: 'Membresía activa',
    });

    res.json({ 
      message: 'Acceso concedido', 
      granted: true, 
      user: { name: user.name, currentStreak: user.currentStreak } 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get access logs for logged in user
// @route   GET /api/access/my-logs
// @access  Private
export const getMyLogs = async (req, res) => {
  try {
    const logs = await AccessLog.find({ user: req.user._id, granted: true }).sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
