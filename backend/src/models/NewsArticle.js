import mongoose from 'mongoose';

const newsArticleSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      unique: true, // Deduplication strategy
      trim: true,
    },
    source: {
      type: String,
      default: 'Financial News',
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    sentiment: {
      type: String,
      enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'],
      default: 'NEUTRAL',
    },
    relevanceScore: {
      type: Number,
      default: 0.5, // 0.0 to 1.0
    },
  },
  { timestamps: true }
);

newsArticleSchema.index({ symbol: 1, publishedAt: -1 });

export const NewsArticle = mongoose.model('NewsArticle', newsArticleSchema);
