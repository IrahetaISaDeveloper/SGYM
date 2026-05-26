import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const saleSchema = new mongoose.Schema({
  products: [saleItemSchema],
  total: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const shiftSchema = new mongoose.Schema(
  {
    staffUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    openedAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    initialCash: {
      type: Number,
      required: true,
      default: 0,
    },
    totalSales: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Abierto', 'Cerrado'],
      default: 'Abierto',
    },
    sales: [saleSchema],
  },
  { timestamps: true }
);

const Shift = mongoose.model('Shift', shiftSchema);
export default Shift;
