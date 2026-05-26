import { checkExpiringMemberships } from '../utils/cronJobs.js';

// @desc    Manually trigger membership expiration check
// @route   POST /api/notifications/check-expiring
// @access  Private (Admin only)
export const manualCheckExpiring = async (req, res) => {
  try {
    const results = await checkExpiringMemberships();
    res.json({
      message: 'Verificación de vencimientos ejecutada manualmente.',
      results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
