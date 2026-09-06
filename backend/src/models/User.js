import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    lastVisitedAt: {
      type: Date,
      default: () => new Date(Date.now() - (7 * 60 + 42) * 60 * 1000), // default ~7h 42m ago for demo realism
    },
    preferences: {
      priceThreshold: {
        type: Number,
        default: 2.0, // 2% price movement
      },
      volumeThreshold: {
        type: Number,
        default: 1.5, // 1.5x reference volume
      },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
