import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    muscleGroup: {
      type: String,
      required: true,
      enum: ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Abdomen'],
    },
    description: { type: String, required: true },
    howTo: { type: String, required: true },
    mediaUrl: { type: String }, // GIF or video embed URL
    mediaType: { type: String, enum: ['gif', 'video', 'image'], default: 'gif' },
    sets: { type: String, default: '3-4' },
    reps: { type: String, default: '10-12' },
    difficulty: { type: String, enum: ['Principiante', 'Intermedio', 'Avanzado'], default: 'Intermedio' },
  },
  { timestamps: true }
);

const Exercise = mongoose.model('Exercise', exerciseSchema);
export default Exercise;
