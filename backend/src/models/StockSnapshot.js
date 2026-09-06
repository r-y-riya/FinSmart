import mongoose from 'mongoose';

const stockSnapshotSchema = new mongoose.Schema(
  {
    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },
    open: {
      type: Number,
    },
    high: {
      type: Number,
    },
    low: {
      type: Number,
    },
    previousClose: {
      type: Number,
    },
    volume: {
      type: Number,
      default: 0,
    },
    averageVolume: {
      type: Number,
      default: 0,
    },
    fiftyTwoWeekHigh: {
      type: Number,
    },
    fiftyTwoWeekLow: {
      type: Number,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      default: 'TWELVE_DATA', // 'TWELVE_DATA', 'SEED', 'SIMULATED'
    },
    freshnessStatus: {
      type: String,
      enum: ['FRESH', 'DELAYED', 'STALE', 'UNAVAILABLE'],
      default: 'FRESH',
    },
  },
  { timestamps: true }
);

// High performance compound indexes for fast snapshot retrieval
stockSnapshotSchema.index({ symbol: 1, timestamp: -1 });
stockSnapshotSchema.index({ stockId: 1, timestamp: -1 });

export const StockSnapshot = mongoose.model('StockSnapshot', stockSnapshotSchema);
