import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema(
  {
    internalCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ['Operativa', 'Mantenimiento', 'Dañada'],
      default: 'Operativa',
    },
    lastMaintenance: { type: Date },
  },
  { timestamps: true }
);

const Machine = mongoose.model('Machine', machineSchema);
export default Machine;
