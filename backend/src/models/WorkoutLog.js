import mongoose from 'mongoose';

const setSchema = new mongoose.Schema(
  {
    weight: { type: Number, required: true, min: 0 },
    reps: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const workoutLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Exercise',
    },
    sets: {
      type: [setSchema],
      validate: [arr => arr.length > 0, 'Debe registrar al menos una serie'],
    },
    notes: { type: String, maxlength: 300 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for fast user+exercise+date queries
workoutLogSchema.index({ user: 1, exercise: 1, date: -1 });

const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);
export default WorkoutLog;
