import mongoose from 'mongoose';

const accessLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    timestamp: { type: Date, default: Date.now },
    granted: { type: Boolean, required: true },
    reason: { type: String },
  },
  { timestamps: true }
);

const AccessLog = mongoose.model('AccessLog', accessLogSchema);
export default AccessLog;
