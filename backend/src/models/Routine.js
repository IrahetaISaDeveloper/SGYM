import mongoose from 'mongoose';

const muscleGroups = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Abdomen', 'Descanso'];

const daySchedule = {
  type: [{ type: String, enum: muscleGroups }],
  default: ['Descanso'],
};

const routineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true,
    },
    weeklySchedule: {
      monday:    daySchedule,
      tuesday:   daySchedule,
      wednesday: daySchedule,
      thursday:  daySchedule,
      friday:    daySchedule,
      saturday:  daySchedule,
      sunday:    daySchedule,
    },
  },
  { timestamps: true }
);

const Routine = mongoose.model('Routine', routineSchema);
export default Routine;
