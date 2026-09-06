import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    exchange: {
      type: String,
      default: 'NSE',
      index: true,
    },
    country: {
      type: String,
      default: 'India',
    },
    currency: {
      type: String,
      default: 'INR',
    },
    sector: {
      type: String,
      default: 'General',
    },
  },
  { timestamps: true }
);

stockSchema.index({ symbol: 1, exchange: 1 });

export const Stock = mongoose.model('Stock', stockSchema);
