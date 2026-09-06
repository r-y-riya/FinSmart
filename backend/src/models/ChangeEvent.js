import mongoose from 'mongoose';

const signalSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
    },
  },
  { _id: false }
);

const changeEventSchema = new mongoose.Schema(
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
    eventType: {
      type: String,
      default: 'PRICE_VOLUME_MOVEMENT',
    },
    severity: {
      type: String,
      enum: ['NORMAL', 'WATCH', 'SIGNIFICANT'],
      default: 'NORMAL',
      index: true,
    },
    oldValue: {
      type: Number,
      required: true, // reference/baseline price
    },
    newValue: {
      type: Number,
      required: true, // current snapshot price
    },
    percentageChange: {
      type: Number,
      required: true,
    },
    volumeRatio: {
      type: Number,
      default: 1.0,
    },
    attentionScore: {
      type: Number,
      default: 0, // 0 - 100
      index: true,
    },
    signals: [signalSchema],
    primaryEventText: {
      type: String,
    },
    whyFlagged: {
      type: String,
    },
    detectedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

changeEventSchema.index({ symbol: 1, detectedAt: -1 });
changeEventSchema.index({ detectedAt: -1, attentionScore: -1 });

export const ChangeEvent = mongoose.model('ChangeEvent', changeEventSchema);
