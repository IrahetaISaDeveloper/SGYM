import { connectDB } from './database.js';
import User from './src/models/User.js';
import Plan from './src/models/Plan.js';
import { checkExpiringMemberships } from './src/utils/cronJobs.js';

const runTest = async () => {
  await connectDB();

  // Create a dummy plan
  const plan = await Plan.create({
    name: 'Cron Test Plan',
    price: 30,
    durationInDays: 30,
    description: 'Test'
  });

  const now = new Date();
  const expiresSoonDate = new Date();
  expiresSoonDate.setDate(now.getDate() + 2); // expires in 2 days

  const expiredDate = new Date();
  expiredDate.setDate(now.getDate() - 1); // expired 1 day ago

  // Create 1 user expiring soon
  const user1 = await User.create({
    name: 'Expiring Soon User',
    email: 'expiring@test.com',
    password: 'password123',
    role: 'Miembro',
    membershipStatus: 'Activa',
    currentPlan: plan._id,
    membershipExpiration: expiresSoonDate
  });

  // Create 1 user already expired
  const user2 = await User.create({
    name: 'Expired User',
    email: 'expired@test.com',
    password: 'password123',
    role: 'Miembro',
    membershipStatus: 'Activa',
    currentPlan: plan._id,
    membershipExpiration: expiredDate
  });

  console.log('Test users created. Running checkExpiringMemberships...');

  const results = await checkExpiringMemberships();

  console.log('\nResults:', JSON.stringify(results, null, 2));

  // Cleanup
  await User.findByIdAndDelete(user1._id);
  await User.findByIdAndDelete(user2._id);
  await Plan.findByIdAndDelete(plan._id);

  console.log('\nTest complete. Cleaned up.');
  process.exit(0);
};

runTest();
