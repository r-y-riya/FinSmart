import mongoose from 'mongoose';

const watchlistItemSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    exchange: {
      type: String,
      default: 'NSE',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      default: 'My Watchlist',
      trim: true,
    },
    items: [watchlistItemSchema],
  },
  { timestamps: true }
);

export const Watchlist = mongoose.model('Watchlist', watchlistSchema);
