import mongoose from 'mongoose';
import Plan from './src/models/Plan.js';
import { MONGO_URI } from './config.js';

async function seedPlans() {
  try {
    await mongoose.connect(MONGO_URI);
    
    const count = await Plan.countDocuments();
    if (count === 0) {
      await Plan.insertMany([
        { name: 'Membresía Básica', price: 29.99, durationInDays: 30, description: 'Acceso a todas las máquinas' },
        { name: 'Membresía Premium', price: 49.99, durationInDays: 30, description: 'Acceso a todas las máquinas + clases' },
        { name: 'Pase Anual', price: 299.99, durationInDays: 365, description: 'Acceso total por un año' },
      ]);
      console.log('Planes creados exitosamente');
    } else {
      console.log('Ya existen planes en la base de datos');
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedPlans();
