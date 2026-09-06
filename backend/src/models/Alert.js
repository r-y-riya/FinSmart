import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    alertType: {
      type: String,
      enum: ['PRICE_MOVEMENT', 'VOLUME_SURGE', 'ATTENTION_SCORE'],
      default: 'PRICE_MOVEMENT',
    },
    threshold: {
      type: Number,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Alert = mongoose.model('Alert', alertSchema);
