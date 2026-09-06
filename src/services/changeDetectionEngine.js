/**
 * FinSmart Deterministic Change Detection Engine
 * Evaluates changes between stock snapshots and reference/visit baselines.
 */

export const SEVERITY = {
  HIGH: 'HIGH',       // Significant Change -> Peach accent
  MEDIUM: 'MEDIUM',   // Worth Watching -> Yellow accent
  NORMAL: 'NORMAL'    // Visually quiet -> Neutral / gentle green
};

export const DEFAULT_THRESHOLDS = {
  pricePercentThreshold: 2.0,   // 2% movement considered significant
  volumeRatioThreshold: 1.5,    // 1.5x reference volume considered unusual
};

/**
 * Computes deterministic change score based on market data
 */
export function calculateChangeScore({
  currentPrice,
  referencePrice,
  currentVolume,
  averageVolume,
  thresholds = DEFAULT_THRESHOLDS
}) {
  const priceDelta = currentPrice - referencePrice;
  const pricePercentChange = referencePrice > 0 ? (priceDelta / referencePrice) * 100 : 0;
  const absPriceChange = Math.abs(pricePercentChange);

  // 1. Price Score (< 1% = 0, 1-2% = 1, 2-4% = 2, > 4% = 3)
  let priceScore = 0;
  if (absPriceChange >= 4.0) {
    priceScore = 3;
  } else if (absPriceChange >= 2.0) {
    priceScore = 2;
  } else if (absPriceChange >= 1.0) {
    priceScore = 1;
  }

  // 2. Volume Score (< 1.2x = 0, 1.2-1.5x = 1, 1.5-2x = 2, > 2x = 3)
  const volumeRatio = averageVolume > 0 ? currentVolume / averageVolume : 1.0;
  let volumeScore = 0;
  if (volumeRatio >= 2.0) {
    volumeScore = 3;
  } else if (volumeRatio >= 1.5) {
    volumeScore = 2;
  } else if (volumeRatio >= 1.2) {
    volumeScore = 1;
  }

  // 3. User configured threshold cross
  let thresholdScore = 0;
  const crossedPriceThreshold = absPriceChange >= (thresholds.pricePercentThreshold || 2.0);
  const crossedVolumeThreshold = volumeRatio >= (thresholds.volumeRatioThreshold || 1.5);

  if (crossedPriceThreshold) thresholdScore += 2;
  if (crossedVolumeThreshold) thresholdScore += 1;

  // Composite score (range roughly 0 - 9)
  const totalScore = priceScore + volumeScore + thresholdScore;

  // Classification: 0-1 = NORMAL, 2-3 = MEDIUM, 4+ = HIGH
  let severity = SEVERITY.NORMAL;
  if (totalScore >= 4) {
    severity = SEVERITY.HIGH;
  } else if (totalScore >= 2) {
    severity = SEVERITY.MEDIUM;
  }

  // Calculate normalized 0-10 Change Signal score
  const signalScoreOutOf10 = Math.min(10, Math.max(0.8, Number(((totalScore / 8) * 10).toFixed(1))));

  // Level breakdowns for visual meters
  const priceSignalLevel = priceScore >= 2 ? 'HIGH' : priceScore === 1 ? 'MEDIUM' : 'LOW';
  const volumeSignalLevel = volumeScore >= 2 ? 'HIGH' : volumeScore === 1 ? 'MEDIUM' : 'LOW';
  const volatilityLevel = absPriceChange > 2.5 ? 'HIGH' : absPriceChange > 1.2 ? 'MEDIUM' : 'LOW';
  const otherSignalsLevel = thresholdScore > 0 ? 'MEDIUM' : 'LOW';

  // Generate plain-language summary statements
  const isDrop = pricePercentChange < 0;
  const volumeIncreasePct = Math.round((volumeRatio - 1) * 100);

  let primaryEventText = 'Trading within expected normal daily boundaries.';
  let whyFlagged = 'No significant deviations detected since last baseline.';
  let aiInsight = 'Stock is experiencing regular market fluctuations with stable participation.';

  if (severity === SEVERITY.HIGH) {
    if (crossedPriceThreshold && crossedVolumeThreshold) {
      primaryEventText = `Price ${isDrop ? 'dropped' : 'surged'} ${absPriceChange.toFixed(1)}% while trading volume increased ${volumeIncreasePct > 0 ? volumeIncreasePct + '%' : 'sharply'}.`;
      whyFlagged = `Price movement crossed your configured ${thresholds.pricePercentThreshold}% significance threshold while volume was unusually high.`;
      aiInsight = `${isDrop ? 'Experienced a significant price decline' : 'Experienced an aggressive rally'} accompanied by heavy institutional and retail trading activity.`;
    } else if (crossedPriceThreshold) {
      primaryEventText = `Price ${isDrop ? 'fell' : 'rose'} ${absPriceChange.toFixed(1)}%, breaching normal volatility bands.`;
      whyFlagged = `Price movement crossed your configured ${thresholds.pricePercentThreshold}% threshold.`;
      aiInsight = `Notable directional pressure with ${isDrop ? 'selling' : 'buying'} surpassing standard intraday thresholds.`;
    } else {
      primaryEventText = `Unusual volume surge: trading volume is ${volumeRatio.toFixed(1)}× historical average.`;
      whyFlagged = `Trading activity jumped significantly beyond the ${thresholds.volumeRatioThreshold}× volume baseline.`;
      aiInsight = `Unusual surge in market liquidity, often signaling pending corporate news or positioning shifts.`;
    }
  } else if (severity === SEVERITY.MEDIUM) {
    if (volumeRatio >= 1.3) {
      primaryEventText = `Trading volume increased ${volumeIncreasePct > 0 ? volumeIncreasePct + '%' : 'moderately'}.`;
      whyFlagged = `Activity is elevated compared to historical reference volume.`;
      aiInsight = `Volume expansion indicates accumulating market interest, though price remains relatively contained.`;
    } else {
      primaryEventText = `Price shifted ${formatPriceShift(pricePercentChange)}, nearing threshold.`;
      whyFlagged = `Moderate movement registered; monitoring for directional confirmation.`;
      aiInsight = `Moderate directional test within weekly resistance/support bands.`;
    }
  }

  return {
    severity,
    changeScore: totalScore,
    signalScoreOutOf10,
    priceScore,
    volumeScore,
    thresholdScore,
    priceDelta,
    pricePercentChange,
    absPriceChange,
    volumeRatio,
    volumeIncreasePct,
    crossedPriceThreshold,
    crossedVolumeThreshold,
    primaryEventText,
    whyFlagged,
    aiInsight,
    signals: {
      priceMovement: priceSignalLevel,
      volumeActivity: volumeSignalLevel,
      volatility: volatilityLevel,
      otherSignals: otherSignalsLevel,
    }
  };
}

function formatPriceShift(percent) {
  if (percent > 0) return `+${percent.toFixed(1)}%`;
  return `${percent.toFixed(1)}%`;
}
