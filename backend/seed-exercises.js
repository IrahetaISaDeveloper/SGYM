// seed-exercises.js - Run with: node seed-exercises.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import Exercise from './src/models/Exercise.js';
import Plan from './src/models/Plan.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gymdb';

const exercises = [
  // ── PECHO ────────────────────────────────────────────────────────────────
  {
    name: 'Press de Banca con Barra',
    muscleGroup: 'Pecho',
    description: 'Ejercicio compuesto fundamental para desarrollar el pecho, hombros y tríceps.',
    howTo: '1. Acuéstate en el banco con los pies apoyados. 2. Agarra la barra a la anchura de los hombros. 3. Baja la barra hasta el pecho. 4. Empuja hacia arriba hasta extender los brazos. 5. Repite de manera controlada.',
    mediaUrl: 'https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif',
    mediaType: 'gif',
    sets: '4', reps: '8-10', difficulty: 'Intermedio',
  },
  {
    name: 'Fondos en Paralelas',
    muscleGroup: 'Pecho',
    description: 'Ejercicio con peso corporal que trabaja el pecho inferior, tríceps y hombros.',
    howTo: '1. Sujétate en las barras paralelas. 2. Inclínate ligeramente hacia adelante. 3. Baja doblando los codos hasta 90°. 4. Empuja hacia arriba hasta extender los brazos. 5. Controla el movimiento en todo momento.',
    mediaUrl: 'https://media.giphy.com/media/3o7TKT2kgRMpELPY08/giphy.gif',
    mediaType: 'gif',
    sets: '3', reps: '10-15', difficulty: 'Intermedio',
  },
  {
    name: 'Press Inclinado con Mancuernas',
    muscleGroup: 'Pecho',
    description: 'Variante del press enfocada en la parte superior del pectoral.',
    howTo: '1. Ajusta el banco a 30-45°. 2. Siéntate con las mancuernas en los muslos. 3. Lleva las mancuernas a los lados del pecho. 4. Empuja hacia arriba y adelante. 5. Baja de forma controlada.',
    mediaUrl: 'https://media.giphy.com/media/4JVTF9zR9BicshFAb7/giphy.gif',
    mediaType: 'gif',
    sets: '3', reps: '10-12', difficulty: 'Principiante',
  },
  {
    name: 'Aperturas con Mancuernas',
    muscleGroup: 'Pecho',
    description: 'Ejercicio de aislamiento para estirar y contraer el pecho.',
    howTo: '1. Acuéstate en banco plano con mancuernas. 2. Extiende los brazos con leve flexión del codo. 3. Baja los brazos a los lados en arco. 4. Regresa al centro contrayendo el pecho. 5. No bloquees los codos.',
    mediaUrl: 'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif',
    mediaType: 'gif',
    sets: '3', reps: '12-15', difficulty: 'Principiante',
  },

  // ── ESPALDA ──────────────────────────────────────────────────────────────
  {
    name: 'Jalón al Pecho',
    muscleGroup: 'Espalda',
    description: 'Ejercicio de tracción vertical que trabaja los dorsales y bíceps.',
    howTo: '1. Siéntate y agarra la barra con agarre prono ancho. 2. Inclínate ligeramente hacia atrás. 3. Jala la barra hacia el pecho. 4. Aprieta los dorsales. 5. Sube la barra de forma controlada.',
    mediaUrl: 'https://media.giphy.com/media/xT9DPF4e1Ec5bJ7Lde/giphy.gif',
    mediaType: 'gif',
    sets: '4', reps: '10-12', difficulty: 'Principiante',
  },
  {
    name: 'Remo con Barra',
    muscleGroup: 'Espalda',
    description: 'Ejercicio compuesto para dorsales, trapecios y bíceps.',
    howTo: '1. Inclínate hacia adelante con la barra. 2. Mantén la espalda recta. 3. Jala la barra hacia el abdomen. 4. Lleva los codos hacia atrás. 5. Baja con control.',
    mediaUrl: 'https://media.giphy.com/media/3o7TKsQ8MoIBkSoHF6/giphy.gif',
    mediaType: 'gif',
    sets: '4', reps: '8-10', difficulty: 'Intermedio',
  },
  {
    name: 'Dominadas',
    muscleGroup: 'Espalda',
    description: 'El mejor ejercicio de peso corporal para los dorsales.',
    howTo: '1. Agarra la barra con agarre prono. 2. Cuelga con los brazos extendidos. 3. Jala hacia arriba hasta que el mentón supere la barra. 4. Baja de forma controlada. 5. Evita el balanceo.',
    mediaUrl: 'https://media.giphy.com/media/l4FGIOkCKiL1RdqeQ/giphy.gif',
    mediaType: 'gif',
    sets: '3', reps: '6-10', difficulty: 'Avanzado',
  },
  {
    name: 'Remo con Mancuerna',
    muscleGroup: 'Espalda',
    description: 'Ejercicio unilateral para trabajar cada lado de la espalda independientemente.',
    howTo: '1. Apoya una rodilla y mano en el banco. 2. Con la otra mano sostén la mancuerna. 3. Jala hacia la cadera, codo al cielo. 4. Aprieta el dorsal. 5. Baja con control.',
    mediaUrl: 'https://media.giphy.com/media/3o7TKMt2qoHBYW2Z0k/giphy.gif',
    mediaType: 'gif',
    sets: '3', reps: '10-12', difficulty: 'Principiante',
  },

  // ── PIERNAS ──────────────────────────────────────────────────────────────
  {
    name: 'Sentadilla con Barra',
    muscleGroup: 'Piernas',
    description: 'El rey de los ejercicios. Trabaja cuádriceps, glúteos e isquiotibiales.',
    howTo: '1. Barra sobre los trapecios. 2. Pies separados al ancho de hombros. 3. Baja doblando rodillas y cadera. 4. Mantén el pecho arriba. 5. Sube empujando el suelo.',
    mediaUrl: 'https://media.giphy.com/media/3o7TKSt77Mf9hDKfQY/giphy.gif',
    mediaType: 'gif',
    sets: '4', reps: '8-10', difficulty: 'Intermedio',
  },
  {
    name: 'Peso Muerto Rumano',
    muscleGroup: 'Piernas',
    description: 'Excelente ejercicio para isquiotibiales y glúteos.',
    howTo: '1. Sostén la barra frente a ti. 2. Inclínate desde la cadera manteniendo la espalda recta. 3. Baja hasta sentir estiramiento en isquiotibiales. 4. Vuelve a la posición inicial. 5. No redondees la espalda.',
    mediaUrl: 'https://media.giphy.com/media/xT9DPzUHK9E3Xm2sJq/giphy.gif',
    mediaType: 'gif',
    sets: '3', reps: '10-12', difficulty: 'Intermedio',
  },
  {
    name: 'Prensa de Piernas',
    muscleGroup: 'Piernas',
    description: 'Máquina ideal para trabajar cuádriceps con menor riesgo para la espalda.',
    howTo: '1. Siéntate en la prensa. 2. Pies a la anchura de caderas. 3. Empuja la plataforma hasta casi extender las rodillas. 4. Baja de forma controlada. 5. No bloquees las rodillas.',
    mediaUrl: 'https://media.giphy.com/media/26BRsKpJHO2NGvFiE/giphy.gif',
    mediaType: 'gif',
    sets: '4', reps: '12-15', difficulty: 'Principiante',
  },
  {
    name: 'Extensión de Cuádriceps',
    muscleGroup: 'Piernas',
    description: 'Ejercicio de aislamiento para los cuádriceps en máquina.',
    howTo: '1. Siéntate en la máquina. 2. Ajusta el rodillo sobre los tobillos. 3. Extiende las piernas hasta arriba. 4. Mantén 1 segundo en la cima. 5. Baja lentamente.',
    mediaUrl: 'https://media.giphy.com/media/l46CsyVXOu3UWrHtS/giphy.gif',
    mediaType: 'gif',
    sets: '3', reps: '12-15', difficulty: 'Principiante',
  },

  // ── HOMBROS ──────────────────────────────────────────────────────────────
  {
    name: 'Press Militar con Barra',
    muscleGroup: 'Hombros',
    description: 'Ejercicio compuesto para deltoides anterior y lateral.',
    howTo: '1. Sostén la barra a la altura del cuello. 2. Empuja verticalmente hasta extender los brazos. 3. Baja de forma controlada. 4. Mantén el core activo. 5. Evita arquear la espalda.',
    mediaUrl: 'https://media.giphy.com/media/3o7TKqnN349PBUtGFO/giphy.gif',
    mediaType: 'gif',
    sets: '4', reps: '8-10', difficulty: 'Intermedio',
  },
  {
    name: 'Elevaciones Laterales',
    muscleGroup: 'Hombros',
    description: 'Aislamiento para el deltoides lateral y definición de hombros.',
    howTo: '1. Sostén mancuernas a los lados. 2. Eleva los brazos lateralmente hasta la altura del hombro. 3. Controla la bajada. 4. Codos ligeramente flexionados. 5. No uses impulso.',
    mediaUrl: 'https://media.giphy.com/media/3o7TKQ5jeDDwXlMGrm/giphy.gif',
    mediaType: 'gif',
    sets: '3', reps: '12-15', difficulty: 'Principiante',
  },
  {
    name: 'Pájaros con Mancuernas',
    muscleGroup: 'Hombros',
    description: 'Ejercicio para el deltoides posterior, crucial para una espalda equilibrada.',
    howTo: '1. Inclínate hacia adelante a 45°. 2. Mancuernas colgando. 3. Eleva los brazos hacia los lados. 4. Aprieta los hombros. 5. Baja lentamente.',
    mediaUrl: 'https://media.giphy.com/media/l4FGGafcOHmrlQxG0/giphy.gif',
    mediaType: 'gif',
    sets: '3', reps: '12-15', difficulty: 'Principiante',
  },

  // ── BRAZOS ───────────────────────────────────────────────────────────────
  {
    name: 'Curl de Bíceps con Barra',
    muscleGroup: 'Brazos',
    description: 'Ejercicio clásico y efectivo para el desarrollo de bíceps.',
    howTo: '1. Sostén la barra con agarre supino. 2. Mantén los codos pegados al cuerpo. 3. Flexiona los codos hasta contraer el bíceps. 4. Baja de forma lenta y controlada. 5. No balancees el torso.',
    mediaUrl: 'https://media.giphy.com/media/l4FGGe9y4LMesDMGQ/giphy.gif',
    mediaType: 'gif',
    sets: '3', reps: '10-12', difficulty: 'Principiante',
  },
  {
    name: 'Extensión de Tríceps en Polea',
    muscleGroup: 'Brazos',
    description: 'Aislamiento completo del tríceps en máquina de polea alta.',
    howTo: '1. Agarra la cuerda o barra de la polea alta. 2. Codos fijos a los lados del cuerpo. 3. Extiende los brazos hacia abajo. 4. Separa los extremos de la cuerda al final. 5. Sube de forma controlada.',
    mediaUrl: 'https://media.giphy.com/media/3o7TKP9ln2Dr6ze6f6/giphy.gif',
    mediaType: 'gif',
    sets: '3', reps: '12-15', difficulty: 'Principiante',
  },
  {
    name: 'Martillo con Mancuernas',
    muscleGroup: 'Brazos',
    description: 'Trabaja el bíceps braquial y el braquioradial para brazos más anchos.',
    howTo: '1. Mancuernas en posición neutra (pulgares al frente). 2. Flexiona los codos alternamente. 3. Sube hasta el hombro. 4. Baja con control. 5. Mantén la espalda recta.',
    mediaUrl: 'https://media.giphy.com/media/3o7TKEP8xqd8HEqYvK/giphy.gif',
    mediaType: 'gif',
    sets: '3', reps: '10-12', difficulty: 'Principiante',
  },

  // ── ABDOMEN ──────────────────────────────────────────────────────────────
  {
    name: 'Crunch Abdominal',
    muscleGroup: 'Abdomen',
    description: 'El ejercicio abdominal más clásico para el recto abdominal.',
    howTo: '1. Acuéstate boca arriba, rodillas flexionadas. 2. Manos detrás de la cabeza. 3. Contrae el abdomen y eleva los hombros. 4. Exhala al subir, inhala al bajar. 5. No jales el cuello.',
    mediaUrl: 'https://media.giphy.com/media/5t9ujj9cMErxC/giphy.gif',
    mediaType: 'gif',
    sets: '4', reps: '20', difficulty: 'Principiante',
  },
  {
    name: 'Plancha Frontal',
    muscleGroup: 'Abdomen',
    description: 'Ejercicio isométrico que fortalece todo el core y estabilizadores.',
    howTo: '1. Apóyate en antebrazos y punta de los pies. 2. Cuerpo en línea recta. 3. Core contraído. 4. Mantén la posición el tiempo indicado. 5. Respira de forma constante.',
    mediaUrl: 'https://media.giphy.com/media/l4FGmHTcdl3R4jGyk/giphy.gif',
    mediaType: 'gif',
    sets: '3', reps: '30-60 seg', difficulty: 'Principiante',
  },
  {
    name: 'Rueda Abdominal',
    muscleGroup: 'Abdomen',
    description: 'Ejercicio avanzado que trabaja todo el core, especialmente el recto abdominal.',
    howTo: '1. Arrodíllate sujetando la rueda. 2. Rueda hacia adelante extendiendo el cuerpo. 3. Llega hasta casi tocar el suelo. 4. Regresa contrayendo el abdomen. 5. Mantén la espalda plana.',
    mediaUrl: 'https://media.giphy.com/media/3o7TKT7BMZP6rfn5kA/giphy.gif',
    mediaType: 'gif',
    sets: '3', reps: '8-12', difficulty: 'Avanzado',
  },
];

async function seedExercises() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    await Exercise.deleteMany({});
    console.log('🗑️  Ejercicios anteriores eliminados');

    const created = await Exercise.insertMany(exercises);
    console.log(`✅ ${created.length} ejercicios insertados`);

    // Update Premium plans
    const result = await Plan.updateMany(
      { name: { $regex: /premium|anual/i } },
      { isPremium: true }
    );
    console.log(`✅ ${result.modifiedCount} plan(es) marcados como Premium`);

    await mongoose.disconnect();
    console.log('✅ Listo. Ejecuta el frontend y prueba la sección de rutinas.');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seedExercises();
