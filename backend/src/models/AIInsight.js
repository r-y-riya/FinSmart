import mongoose from 'mongoose';

const aiInsightSchema = new mongoose.Schema(
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
    changeEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChangeEvent',
      index: true,
    },
    summary: {
      type: String,
      required: true,
    },
    whyItMatters: {
      type: String,
      required: true,
    },
    confidence: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'HIGH',
    },
    evidence: [
      {
        type: String,
      },
    ],
    model: {
      type: String,
      default: 'gpt-4o-mini',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

aiInsightSchema.index({ symbol: 1, generatedAt: -1 });

export const AIInsight = mongoose.model('AIInsight', aiInsightSchema);
