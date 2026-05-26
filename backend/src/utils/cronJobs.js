import cron from 'node-cron';
import User from '../models/User.js';

/**
 * Check for expiring memberships and auto-expire past-due ones.
 * - Alerts users whose membership expires within the next 3 days.
 * - Marks users whose membership has already expired as 'Vencida'.
 * Returns a summary object for API/logging purposes.
 */
export const checkExpiringMemberships = async () => {
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  const results = {
    timestamp: now.toISOString(),
    expiringSoon: [],
    autoExpired: [],
  };

  try {
    // 1. Find users whose membership expires within the next 3 days
    const expiringSoon = await User.find({
      membershipStatus: 'Activa',
      membershipExpiration: {
        $gte: now,
        $lte: threeDaysFromNow,
      },
    }).populate('currentPlan');

    for (const user of expiringSoon) {
      const daysLeft = Math.ceil(
        (user.membershipExpiration - now) / (1000 * 60 * 60 * 24)
      );

      results.expiringSoon.push({
        _id: user._id,
        name: user.name,
        email: user.email,
        plan: user.currentPlan?.name || 'Sin plan',
        expiresAt: user.membershipExpiration,
        daysLeft,
      });

      // Simulate notification (log to console)
      console.log(
        `📧 [ALERTA] Membresía de "${user.name}" (${user.email}) vence en ${daysLeft} día(s) — Plan: ${user.currentPlan?.name || 'N/A'}`
      );
    }

    // 2. Auto-expire memberships that are past due
    const expired = await User.find({
      membershipStatus: 'Activa',
      membershipExpiration: { $lt: now },
    }).populate('currentPlan');

    for (const user of expired) {
      user.membershipStatus = 'Vencida';
      await user.save();

      results.autoExpired.push({
        _id: user._id,
        name: user.name,
        email: user.email,
        plan: user.currentPlan?.name || 'Sin plan',
        expiredAt: user.membershipExpiration,
      });

      console.log(
        `🔴 [VENCIDA] Membresía de "${user.name}" (${user.email}) ha sido marcada como Vencida automáticamente.`
      );
    }

    console.log(
      `\n✅ [CRON ${now.toLocaleTimeString()}] Verificación completada: ${results.expiringSoon.length} por vencer, ${results.autoExpired.length} auto-expiradas.\n`
    );
  } catch (error) {
    console.error('❌ [CRON] Error al verificar membresías:', error.message);
  }

  return results;
};

/**
 * Start all scheduled cron jobs.
 * Called once after DB connection in index.js.
 */
export const startCronJobs = () => {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('\n⏰ [CRON] Ejecutando verificación diaria de membresías (8:00 AM)...');
    await checkExpiringMemberships();
  });

  console.log('🕐 [CRON] Tarea programada registrada: Verificación de vencimientos a las 8:00 AM diariamente.');
};
