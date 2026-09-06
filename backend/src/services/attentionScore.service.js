export const SEVERITY = {
  NORMAL: 'NORMAL',
  WATCH: 'WATCH',
  SIGNIFICANT: 'SIGNIFICANT'
};

export const attentionScoreService = {
  /**
   * Computes explainable 0-100 Attention Score based on weighted pillars
   */
  calculateScore({
    percentageChange = 0,
    volumeRatio = 1.0,
    hasRelevantNews = false,
    newsCount = 0,
    anomalyScore = 0.2, // 0.0 to 1.0 from ML anomaly service
    sectorRelativeReturn = 0,
    isThresholdCrossed = false,
  }) {
    const absChange = Math.abs(percentageChange);
    const signals = [];

    // 1. Price Movement Pillar (Max 25 pts)
    // <1% = 5pt, 1-2% = 12pt, 2-4% = 20pt, >4% = 25pt
    let pricePillar = 5;
    if (absChange >= 4.0) {
      pricePillar = 25;
      signals.push({ type: 'PRICE', score: 25, description: `Large price shift: ${absChange.toFixed(1)}%` });
    } else if (absChange >= 2.0) {
      pricePillar = 20;
      signals.push({ type: 'PRICE', score: 20, description: `Price crossed significance threshold: ${absChange.toFixed(1)}%` });
    } else if (absChange >= 1.0) {
      pricePillar = 12;
      signals.push({ type: 'PRICE', score: 12, description: `Moderate price movement: ${absChange.toFixed(1)}%` });
    } else {
      signals.push({ type: 'PRICE', score: 5, description: `Quiet price range (${absChange.toFixed(1)}%)` });
    }

    // 2. Volume Anomaly Pillar (Max 20 pts)
    // <1.2x = 4pt, 1.2-1.5x = 10pt, 1.5-2x = 16pt, >2x = 20pt
    let volumePillar = 4;
    if (volumeRatio >= 2.0) {
      volumePillar = 20;
      signals.push({ type: 'VOLUME', score: 20, description: `Heavy volume surge: ${volumeRatio.toFixed(1)}× historical average` });
    } else if (volumeRatio >= 1.5) {
      volumePillar = 16;
      signals.push({ type: 'VOLUME', score: 16, description: `Elevated volume: ${volumeRatio.toFixed(1)}× average` });
    } else if (volumeRatio >= 1.2) {
      volumePillar = 10;
      signals.push({ type: 'VOLUME', score: 10, description: `Mild volume expansion: ${volumeRatio.toFixed(1)}× average` });
    }

    // 3. News / Context Evidence Pillar (Max 20 pts)
    let newsPillar = 0;
    if (hasRelevantNews || newsCount > 0) {
      newsPillar = Math.min(20, 10 + newsCount * 5);
      signals.push({ type: 'NEWS', score: newsPillar, description: `${newsCount} correlated breaking news article(s)` });
    }

    // 4. ML Anomaly Pillar (Max 15 pts)
    let mlPillar = Math.round(anomalyScore * 15);
    if (anomalyScore >= 0.65) {
      signals.push({ type: 'ML_ANOMALY', score: mlPillar, description: `Statistical behavior outlier (score: ${anomalyScore})` });
    }

    // 5. Market / Sector Relative Pillar (Max 10 pts)
    let marketPillar = 3;
    if (Math.abs(sectorRelativeReturn) >= 2.0) {
      marketPillar = 10;
      signals.push({ type: 'SECTOR_DIVERGENCE', score: 10, description: `Diverging significantly from broad sector benchmark` });
    } else if (Math.abs(sectorRelativeReturn) >= 1.0) {
      marketPillar = 6;
    }

    // 6. Volatility & Threshold Bonus Pillar (Max 10 pts)
    let volPillar = 2;
    if (isThresholdCrossed) {
      volPillar = 10;
      signals.push({ type: 'USER_THRESHOLD', score: 10, description: `Breached custom user significance threshold` });
    } else if (absChange > 2.5) {
      volPillar = 7;
    }

    // Total Composite Attention Score (0 - 100)
    const rawTotal = pricePillar + volumePillar + newsPillar + mlPillar + marketPillar + volPillar;
    const attentionScore = Math.min(100, Math.max(8, rawTotal));

    // Classification: 0-30 NORMAL, 31-60 WATCH, 61-100 SIGNIFICANT
    let severity = SEVERITY.NORMAL;
    if (attentionScore >= 61) {
      severity = SEVERITY.SIGNIFICANT;
    } else if (attentionScore >= 31) {
      severity = SEVERITY.WATCH;
    }

    return {
      attentionScore,
      severity,
      pillars: {
        priceMovement: pricePillar,
        volumeAnomaly: volumePillar,
        newsEvidence: newsPillar,
        mlAnomaly: mlPillar,
        marketRelative: marketPillar,
        volatility: volPillar,
      },
      signals,
    };
  }
};
