import React, { useState } from 'react';
import { Sliders, RefreshCw, WifiOff, Wifi, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

export default function SimulationBar() {
  const {
    simulatePriceSpike,
    toggleProviderOffline,
    isProviderOffline,
    resetDemoData,
    liveToast,
  } = useWatchlist();

  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside aria-label="Demo Simulator" className="relative z-30 bg-white/95 dark:bg-[#171C19]/95 border-b border-pulse-border dark:border-pulse-dark-border py-2 px-4 text-xs transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-pulse-text dark:text-pulse-dark-text">
            <Sliders className="w-3.5 h-3.5 text-pulse-purple" />
            <span className="tracking-wide uppercase text-[10px] text-pulse-purple font-mono">Demo Simulator</span>
          </div>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <span className="text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary hidden md:inline">
            Test deterministic change engine & resilience
          </span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="sm:hidden p-1 text-pulse-secondary"
          >
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isOpen && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Action 1: Simulate drop on Reliance */}
            <button
              onClick={() => simulatePriceSpike('RELIANCE', -3.2, 1.67)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FFF1ED] dark:bg-[#FF9B7A]/15 text-[#D95328] dark:text-[#FF9B7A] hover:bg-[#FFE5DC] transition-colors border border-[#FF9B7A]/30"
              title="Simulate -3.2% drop on Reliance"
            >
              <Zap className="w-3 h-3" />
              <span>Simulate RELIANCE -3.2%</span>
            </button>

            {/* Action 2: Simulate rally on Tata Motors */}
            <button
              onClick={() => simulatePriceSpike('TATAMOTORS', 4.1, 1.8)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-pulse-green-light dark:bg-[#16A66A]/15 text-pulse-green dark:text-pulse-dark-green hover:bg-emerald-100 dark:hover:bg-[#16A66A]/25 transition-colors border border-pulse-green/30"
              title="Simulate +4.1% surge on Tata Motors"
            >
              <Zap className="w-3 h-3" />
              <span>Simulate TATAMOTORS +4.1%</span>
            </button>

            {/* Action 3: Toggle Provider Offline to test graceful degradation */}
            <button
              onClick={toggleProviderOffline}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                isProviderOffline
                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-pulse-secondary dark:bg-gray-800 dark:text-pulse-dark-secondary dark:hover:bg-gray-700 border-transparent'
              }`}
              title="Simulate market API outage and stale data fallback"
            >
              {isProviderOffline ? <WifiOff className="w-3 h-3 text-amber-600" /> : <Wifi className="w-3 h-3" />}
              <span>{isProviderOffline ? 'Provider: OFFLINE (Stale Mode)' : 'Simulate API Outage'}</span>
            </button>

            {/* Action 4: Reset Demo Data */}
            <button
              onClick={resetDemoData}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary hover:text-pulse-text dark:hover:text-white transition-colors"
              title="Reset initial baseline"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {/* Live Toast feedback */}
      {liveToast && (
        <div className="mt-2 p-2 rounded-xl bg-white dark:bg-[#101412] border border-pulse-border dark:border-pulse-dark-border shadow-elevated flex items-center justify-between text-xs animate-slideDown">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pulse-purple animate-ping" />
            <span className="font-semibold text-pulse-text dark:text-pulse-dark-text">{liveToast.title}:</span>
            <span className="text-pulse-secondary dark:text-pulse-dark-secondary">{liveToast.message}</span>
          </div>
          <span className="text-[10px] font-mono text-pulse-purple">LIVE TICK</span>
        </div>
      )}
    </aside>
  );
}
