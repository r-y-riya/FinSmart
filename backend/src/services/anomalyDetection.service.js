/**
 * Market Anomaly Detection Service
 * Answers: "Is this movement unusual relative to this stock's historical baseline?"
 * Uses rolling statistical z-scores and multidimensional divergence.
 */

export const anomalyDetectionService = {
  /**
   * Calculates an anomaly score (0.0 - 1.0) given current snapshot and historical snapshots
   */
  calculateAnomalyScore({ currentPrice, referencePrice, currentVolume, averageVolume, history = [] }) {
    // 1. Calculate percentage return
    const priceDelta = currentPrice - referencePrice;
    const currentReturn = referencePrice > 0 ? (priceDelta / referencePrice) * 100 : 0;
    const absReturn = Math.abs(currentReturn);

    // 2. Volume expansion ratio
    const volumeRatio = averageVolume > 0 ? currentVolume / averageVolume : 1.0;

    // 3. Historical standard deviation (volatility) of returns
    let historicalMeanReturn = 0;
    let historicalStdDev = 1.2; // default standard deviation baseline (%)

    if (history.length >= 3) {
      const returns = [];
      for (let i = 1; i < history.length; i++) {
        const prev = history[i - 1].price;
        const curr = history[i].price;
        if (prev > 0) {
          returns.push(((curr - prev) / prev) * 100);
        }
      }
      if (returns.length > 0) {
        historicalMeanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - historicalMeanReturn, 2), 0) / returns.length;
        historicalStdDev = Math.max(0.5, Math.sqrt(variance));
      }
    }

    // 4. Return Z-Score: |return - mean| / stdDev
    const returnZScore = Math.abs(currentReturn - historicalMeanReturn) / historicalStdDev;

    // 5. Volume Z-Score estimation: volumeRatio - 1.0
    const volumeAnomaly = Math.max(0, volumeRatio - 1.0);

    // 6. Multidimensional composite anomaly metric
    // Normalize into a 0.0 - 1.0 score using sigmoid-like curve
    const rawMetric = (returnZScore * 0.65) + (volumeAnomaly * 0.35);
    const anomalyScore = Math.min(0.99, Math.max(0.05, 1 / (1 + Math.exp(-0.8 * (rawMetric - 2.0)))));

    const isAnomaly = anomalyScore >= 0.65;

    return {
      anomalyScore: parseFloat(anomalyScore.toFixed(2)),
      isAnomaly,
      returnZScore: parseFloat(returnZScore.toFixed(2)),
      volumeRatio: parseFloat(volumeRatio.toFixed(2)),
      description: isAnomaly 
        ? `Statistical outlier: price deviation is ${returnZScore.toFixed(1)}σ from normal volatility`
        : `Within normal statistical boundaries (${returnZScore.toFixed(1)}σ)`
    };
  }
};
