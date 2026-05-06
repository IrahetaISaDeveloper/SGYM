import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AccessLog from '../models/AccessLog.js';
import { JWT_SECRET } from '../../config.js';

// @desc    Generate QR Token for access
// @route   GET /api/access/generate-qr
// @access  Private
export const generateQR = async (req, res) => {
  try {
    const user = req.user;
    
    // Generar un token con duración corta, ej. 60s
    const qrToken = jwt.sign({ id: user._id, type: 'access' }, JWT_SECRET, {
      expiresIn: '60s',
    });

    user.qrToken = qrToken;
    await user.save();

    res.json({ qrToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Scan QR Token for access
// @route   POST /api/access/scan
// @access  Private/Admin/Staff
export const scanQR = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'No se proporcionó token' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: 'Token inválido o expirado', granted: false });
    }

    if (decoded.type !== 'access') {
      return res.status(400).json({ message: 'Tipo de token inválido', granted: false });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado', granted: false });
    }

    // Verificar si el token coincide con el generado
    if (user.qrToken !== token) {
       return res.status(400).json({ message: 'Token QR obsoleto', granted: false });
    }

    // Invalidar token tras su uso para evitar re-uso
    user.qrToken = '';
    await user.save();

    // Verificar estado de la membresía
    if (user.membershipStatus !== 'Activa') {
      await AccessLog.create({
        user: user._id,
        granted: false,
        reason: 'Membresía inactiva o vencida',
      });
      return res.status(403).json({ message: 'Acceso denegado: Membresía inactiva', granted: false });
    }

    // Registrar acceso concedido
    await AccessLog.create({
      user: user._id,
      granted: true,
      reason: 'Membresía activa',
    });

    res.json({ message: 'Acceso concedido', granted: true, user: { name: user.name } });

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
