import { ChangeEvent } from '../models/ChangeEvent.js';
import { StockSnapshot } from '../models/StockSnapshot.js';
import { NewsArticle } from '../models/NewsArticle.js';
import { attentionScoreService } from './attentionScore.service.js';
import { anomalyDetectionService } from './anomalyDetection.service.js';
import { logger } from '../utils/logger.js';

export const changeDetectionService = {
  /**
   * Evaluates current snapshot against previous baseline and generates a ChangeEvent
   */
  async evaluateChange({
    stock,
    currentSnapshot,
    referenceSnapshot = null,
    userPreferences = { priceThreshold: 2.0, volumeThreshold: 1.5 },
  }) {
    const symbol = stock.symbol.toUpperCase();

    // 1. Find reference snapshot if not provided (e.g., previous snapshot before current one)
    let baseline = referenceSnapshot;
    if (!baseline) {
      baseline = await StockSnapshot.findOne({
        symbol,
        _id: { $ne: currentSnapshot._id },
        timestamp: { $lt: currentSnapshot.timestamp }
      }).sort({ timestamp: -1 });
    }

    // Default reference price
    const referencePrice = baseline?.price || currentSnapshot.previousClose || currentSnapshot.price;
    const currentPrice = currentSnapshot.price;
    const priceDelta = currentPrice - referencePrice;
    const percentageChange = referencePrice > 0 ? (priceDelta / referencePrice) * 100 : 0;
    const absChange = Math.abs(percentageChange);

    const averageVolume = currentSnapshot.averageVolume || baseline?.volume || 1000000;
    const volumeRatio = averageVolume > 0 ? currentSnapshot.volume / averageVolume : 1.0;

    // 2. Anomaly detection via ML service
    const history = await StockSnapshot.find({ symbol }).sort({ timestamp: -1 }).limit(10);
    const anomalyResult = anomalyDetectionService.calculateAnomalyScore({
      currentPrice,
      referencePrice,
      currentVolume: currentSnapshot.volume,
      averageVolume,
      history,
    });

    // 3. Check for correlated recent news
    const recentNews = await NewsArticle.find({
      symbol,
      publishedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).sort({ publishedAt: -1 }).limit(3);

    // 4. Threshold checking
    const isThresholdCrossed = absChange >= (userPreferences.priceThreshold || 2.0);

    // 5. Calculate composite attention score (0 - 100)
    const attentionResult = attentionScoreService.calculateScore({
      percentageChange,
      volumeRatio,
      hasRelevantNews: recentNews.length > 0,
      newsCount: recentNews.length,
      anomalyScore: anomalyResult.anomalyScore,
      isThresholdCrossed,
    });

    // 6. Generate plain-language summary statements
    const isDrop = percentageChange < 0;
    let primaryEventText = 'Within expected daily trading boundaries.';
    let whyFlagged = 'No significant deviations detected from baseline.';

    if (attentionResult.severity === 'SIGNIFICANT') {
      const volPct = Math.round((volumeRatio - 1) * 100);
      primaryEventText = `Price ${isDrop ? 'dropped' : 'surged'} ${absChange.toFixed(1)}% while trading volume ${volPct > 0 ? `increased ${volPct}%` : 'was unusually heavy'}.`;
      whyFlagged = `Price movement crossed your significance threshold (${userPreferences.priceThreshold || 2.0}%) while volume was elevated.`;
    } else if (attentionResult.severity === 'WATCH') {
      if (volumeRatio >= 1.3) {
        primaryEventText = `Trading volume expanded ${Math.round((volumeRatio - 1) * 100)}% above average.`;
        whyFlagged = 'Trading volume activity is elevated compared to historical reference baseline.';
      } else {
        primaryEventText = `Price shifted ${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(1)}%, nearing significance boundaries.`;
        whyFlagged = 'Moderate directional movement registered.';
      }
    }

    // 7. Persist ChangeEvent in MongoDB
    const changeEvent = await ChangeEvent.create({
      stockId: stock._id,
      symbol,
      eventType: 'PRICE_VOLUME_MOVEMENT',
      severity: attentionResult.severity,
      oldValue: referencePrice,
      newValue: currentPrice,
      percentageChange: parseFloat(percentageChange.toFixed(2)),
      volumeRatio: parseFloat(volumeRatio.toFixed(2)),
      attentionScore: attentionResult.attentionScore,
      signals: attentionResult.signals,
      primaryEventText,
      whyFlagged,
      detectedAt: currentSnapshot.timestamp || new Date(),
    });

    return {
      changeEvent,
      attentionScore: attentionResult.attentionScore,
      severity: attentionResult.severity,
      percentageChange,
      volumeRatio,
      primaryEventText,
      whyFlagged,
      signals: attentionResult.signals,
    };
  }
};
