import React, { useState } from 'react';
import { Sliders, ShieldCheck, RotateCcw, Zap } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { calculateChangeScore } from '../services/changeDetectionEngine';
import ChangeBadge from '../components/ChangeBadge';

export default function InsightsConfigPage() {
  const { thresholds, setThresholds } = useWatchlist();

  // Local state for interactive test calculator
  const [testPriceChange, setTestPriceChange] = useState(-3.2);
  const [testVolumeRatio, setTestVolumeRatio] = useState(1.67);

  // Live calculation based on current thresholds
  const testAnalysis = calculateChangeScore({
    currentPrice: 100 * (1 + testPriceChange / 100),
    referencePrice: 100,
    currentVolume: 1000000 * testVolumeRatio,
    averageVolume: 1000000,
    thresholds
  });

  const handlePriceThresholdChange = (val) => {
    setThresholds(prev => ({ ...prev, pricePercentThreshold: Number(val) }));
  };

  const handleVolumeThresholdChange = (val) => {
    setThresholds(prev => ({ ...prev, volumeRatioThreshold: Number(val) }));
  };

  const handleReset = () => {
    setThresholds({ pricePercentThreshold: 2.0, volumeRatioThreshold: 1.5 });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1.5 pb-4 border-b border-pulse-border dark:border-pulse-dark-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pulse-purple-light dark:bg-[#9B7EDE]/20 flex items-center justify-center text-pulse-purple">
            <Sliders className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-pulse-text dark:text-pulse-dark-text">
            Significance Engine & Thresholds
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-pulse-secondary dark:text-pulse-dark-secondary">
          Configure what counts as a "meaningful change" in your market watchlist.
        </p>
      </div>

      {/* Grid: Config Card + Live Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Threshold Sliders */}
        <div className="lg:col-span-6 bg-white dark:bg-[#171C19] rounded-3xl p-6 border border-pulse-border dark:border-pulse-dark-border shadow-subtle space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-pulse-text dark:text-pulse-dark-text">
              User Threshold Configuration
            </h2>
            <button
              onClick={handleReset}
              className="text-xs text-pulse-secondary hover:text-pulse-text flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Slider 1: Price Movement Threshold */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-gray-50/80 dark:bg-[#1E2521] border border-pulse-border/60 dark:border-pulse-dark-border">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-pulse-text dark:text-pulse-dark-text">
                Price Movement Threshold
              </span>
              <span className="font-mono font-bold text-pulse-purple dark:text-[#C5B3F2] text-sm">
                ±{thresholds.pricePercentThreshold.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="6.0"
              step="0.5"
              value={thresholds.pricePercentThreshold}
              onChange={(e) => handlePriceThresholdChange(e.target.value)}
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#9B7EDE]"
            />
            <p className="text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary">
              Movements exceeding this percentage trigger elevated attention in the Since-Last-Visit feed.
            </p>
          </div>

          {/* Slider 2: Volume Surge Multiplier */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-gray-50/80 dark:bg-[#1E2521] border border-pulse-border/60 dark:border-pulse-dark-border">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-pulse-text dark:text-pulse-dark-text">
                Volume Activity Multiplier
              </span>
              <span className="font-mono font-bold text-pulse-purple dark:text-[#C5B3F2] text-sm">
                {thresholds.volumeRatioThreshold.toFixed(1)}×
              </span>
            </div>
            <input
              type="range"
              min="1.1"
              max="3.0"
              step="0.1"
              value={thresholds.volumeRatioThreshold}
              onChange={(e) => handleVolumeThresholdChange(e.target.value)}
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#9B7EDE]"
            />
            <p className="text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary">
              Trading volume relative to reference baseline required to register a volume flag.
            </p>
          </div>

          {/* Transparent Engine Rules */}
          <div className="pt-2 space-y-3">
            <h3 className="text-xs font-semibold text-pulse-text dark:text-pulse-dark-text uppercase tracking-wider">
              Deterministic Scoring Rubric
            </h3>
            <div className="text-xs font-mono space-y-1.5 p-3.5 rounded-xl bg-[#FAFAF7] dark:bg-[#121614] border border-pulse-border dark:border-pulse-dark-border text-pulse-secondary">
              <div className="flex justify-between">
                <span>Price: &lt; 1% (0pt) · 1-2% (1pt) · 2-4% (2pt) · &gt; 4% (3pt)</span>
              </div>
              <div className="flex justify-between">
                <span>Volume: &lt; 1.2× (0pt) · 1.2-1.5× (1pt) · 1.5-2× (2pt) · &gt; 2× (3pt)</span>
              </div>
              <div className="flex justify-between text-pulse-purple font-semibold">
                <span>Total Score: 0-1 Normal · 2-3 Medium · 4+ High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Live Interactive Simulator */}
        <div className="lg:col-span-6 bg-white dark:bg-[#171C19] rounded-3xl p-6 border border-pulse-border dark:border-pulse-dark-border shadow-subtle space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-pulse-green" />
              <h2 className="text-base font-semibold text-pulse-text dark:text-pulse-dark-text">
                Interactive Rule Simulator
              </h2>
            </div>
            <ChangeBadge severity={testAnalysis.severity} size="md" />
          </div>

          <div className="space-y-4">
            {/* Price Delta Input */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-pulse-secondary">Simulated Price Shift</span>
                <span className="font-mono font-semibold text-pulse-text dark:text-pulse-dark-text">
                  {testPriceChange > 0 ? `+${testPriceChange}%` : `${testPriceChange}%`}
                </span>
              </div>
              <input
                type="range"
                min="-6.0"
                max="6.0"
                step="0.1"
                value={testPriceChange}
                onChange={(e) => setTestPriceChange(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#16A66A]"
              />
            </div>

            {/* Volume Ratio Input */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-pulse-secondary">Simulated Volume Ratio</span>
                <span className="font-mono font-semibold text-pulse-text dark:text-pulse-dark-text">
                  {testVolumeRatio}× average
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.1"
                value={testVolumeRatio}
                onChange={(e) => setTestVolumeRatio(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#16A66A]"
              />
            </div>
          </div>

          {/* Engine Output Preview */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAFAF7] to-[#F4F0FF] dark:from-[#171C19] dark:to-[#1A1829] border border-pulse-border dark:border-pulse-dark-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-pulse-text dark:text-pulse-dark-text">Computed Signal Output</span>
              <span className="font-mono text-pulse-purple font-bold">{testAnalysis.signalScoreOutOf10} / 10</span>
            </div>

            <p className="text-xs font-medium text-pulse-text dark:text-pulse-dark-text">
              "{testAnalysis.primaryEventText}"
            </p>

            <div className="text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary">
              <span className="font-semibold">Rationale: </span>
              {testAnalysis.whyFlagged}
            </div>
          </div>

          {/* Why Deterministic Architecture Note */}
          <div className="p-4 rounded-2xl bg-[#EEF5FE] dark:bg-[#5B9CF6]/10 border border-[#5B9CF6]/20 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-pulse-blue">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Transparent & Defensible Engineering</span>
            </div>
            <p className="text-pulse-secondary dark:text-pulse-dark-secondary text-[11px] leading-relaxed">
              Detection is 100% deterministic and explainable. No opaque hallucinating black-box logic determines financial priority.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
