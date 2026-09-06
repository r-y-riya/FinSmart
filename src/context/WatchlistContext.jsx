import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { SEARCHABLE_UNIVERSE } from '../services/mockStocks';
import { calculateChangeScore, SEVERITY, DEFAULT_THRESHOLDS } from '../services/changeDetectionEngine';
import { watchlistApi } from '../services/watchlistApi';
import { changeApi } from '../services/changeApi';
import { demoApi } from '../services/demoApi';

const WatchlistContext = createContext();

const INITIAL_WATCHLIST = ['RELIANCE', 'INFY', 'TCS', 'HDFCBANK', 'TATAMOTORS', 'BHARTIARTL'];

export function WatchlistProvider({ children }) {
  // Watchlist symbols
  const [watchlistSymbols, setWatchlistSymbols] = useState(() => {
    const saved = localStorage.getItem('finsmart_watchlist');
    return saved ? JSON.parse(saved) : INITIAL_WATCHLIST;
  });

  // Stocks database (seeded locally + synced with backend)
  const [stocksMap, setStocksMap] = useState(() => {
    const map = {};
    SEARCHABLE_UNIVERSE.forEach(s => {
      map[s.symbol] = { ...s };
    });
    return map;
  });

  // Backend live changes and summary
  const [backendSummary, setBackendSummary] = useState(null);
  const [backendChanges, setBackendChanges] = useState([]);

  // User configured thresholds
  const [thresholds, setThresholds] = useState(() => {
    const saved = localStorage.getItem('finsmart_thresholds');
    return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
  });

  // Sorting: 'importance' (default), 'movement', 'recent', 'alphabetical'
  const [sortOption, setSortOption] = useState('importance');

  // Simulated provider outage state
  const [isProviderOffline, setIsProviderOffline] = useState(false);

  // Selected stock for detail view
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');

  // Notification / live tick toast
  const [liveToast, setLiveToast] = useState(null);

  // Search modal & Ask FinSmart modal states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAskOpen, setIsAskOpen] = useState(false);

  // Synchronize with backend on mount and after changes
  const syncWithBackend = useCallback(async () => {
    try {
      // 1. Fetch watchlist from backend
      const wlRes = await watchlistApi.getWatchlist();
      if (wlRes.success && wlRes.data?.items) {
        const symbols = wlRes.data.items.map(i => i.symbol);
        if (symbols.length > 0) {
          setWatchlistSymbols(symbols);
        }

        // Update stocksMap prices and freshness from backend
        setStocksMap(prev => {
          const next = { ...prev };
          for (const item of wlRes.data.items) {
            if (next[item.symbol]) {
              next[item.symbol] = {
                ...next[item.symbol],
                currentPrice: item.currentPrice || next[item.symbol].currentPrice,
                volume: item.volume || next[item.symbol].volume,
                dayHigh: item.dayHigh || next[item.symbol].dayHigh,
                dayLow: item.dayLow || next[item.symbol].dayLow,
                lastUpdated: item.lastUpdated || next[item.symbol].lastUpdated,
              };
            }
          }
          return next;
        });
      }

      // 2. Fetch changes since last visit from backend
      const changeRes = await changeApi.getChangesSinceLastVisit();
      if (changeRes.success && changeRes.data) {
        setBackendSummary(changeRes.data.summary);
        setBackendChanges(changeRes.data.events || []);
      }
    } catch (err) {
      console.warn('[WatchlistContext] Running with in-memory resilient engine:', err.message);
    }
  }, []);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Persist watchlist & thresholds locally
  useEffect(() => {
    localStorage.setItem('finsmart_watchlist', JSON.stringify(watchlistSymbols));
  }, [watchlistSymbols]);

  useEffect(() => {
    localStorage.setItem('finsmart_thresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  // Add stock to watchlist
  const addToWatchlist = async (symbol, companyName, exchange) => {
    const cleanSym = symbol.trim().toUpperCase();
    if (!watchlistSymbols.includes(cleanSym)) {
      setWatchlistSymbols(prev => [cleanSym, ...prev]);
    }
    try {
      await watchlistApi.addStock(cleanSym, companyName, exchange);
      syncWithBackend();
    } catch (err) {
      console.warn('[WatchlistContext] Saved locally:', err.message);
    }
  };

  // Remove stock from watchlist
  const removeFromWatchlist = async (symbol) => {
    const cleanSym = symbol.trim().toUpperCase();
    setWatchlistSymbols(prev => prev.filter(s => s !== cleanSym));
    try {
      await watchlistApi.removeStock(cleanSym);
      syncWithBackend();
    } catch (err) {
      console.warn('[WatchlistContext] Removed locally:', err.message);
    }
  };

  const isWatched = (symbol) => watchlistSymbols.includes(symbol);

  // Evaluate each watched stock with the change detection engine
  const evaluatedStocks = useMemo(() => {
    return Object.values(stocksMap).map(stock => {
      const isWatchlisted = watchlistSymbols.includes(stock.symbol);
      const referencePrice = stock.lastVisitedSnapshot?.price || stock.previousClose;
      const currentPrice = stock.currentPrice;
      const currentVolume = stock.volume;
      const averageVolume = stock.averageVolume;

      const analysis = calculateChangeScore({
        currentPrice,
        referencePrice,
        currentVolume,
        averageVolume,
        thresholds
      });

      // Override with backend attention score if available
      const backendEvent = backendChanges.find(b => b.symbol === stock.symbol);
      if (backendEvent) {
        analysis.changeScore = backendEvent.attentionScore;
        analysis.severity = backendEvent.severity === 'SIGNIFICANT' 
          ? SEVERITY.HIGH 
          : backendEvent.severity === 'WATCH' 
          ? SEVERITY.MEDIUM 
          : SEVERITY.NORMAL;
        analysis.signalScoreOutOf10 = Number((backendEvent.attentionScore / 10).toFixed(1));
        analysis.primaryEventText = backendEvent.primaryEventText || analysis.primaryEventText;
        analysis.whyFlagged = backendEvent.whyFlagged || analysis.whyFlagged;
      }

      return {
        ...stock,
        isWatchlisted,
        analysis,
        dayNetChange: currentPrice - stock.previousClose,
        dayPercentChange: ((currentPrice - stock.previousClose) / stock.previousClose) * 100,
      };
    });
  }, [stocksMap, watchlistSymbols, thresholds, backendChanges]);

  // Watchlist stocks filtered and sorted
  const sortedWatchlistStocks = useMemo(() => {
    const watched = evaluatedStocks.filter(s => watchlistSymbols.includes(s.symbol));

    return [...watched].sort((a, b) => {
      if (sortOption === 'importance') {
        const severityRank = { [SEVERITY.HIGH]: 3, [SEVERITY.MEDIUM]: 2, [SEVERITY.NORMAL]: 1 };
        const diff = severityRank[b.analysis.severity] - severityRank[a.analysis.severity];
        if (diff !== 0) return diff;
        return b.analysis.changeScore - a.analysis.changeScore;
      }
      if (sortOption === 'movement') {
        return Math.abs(b.dayPercentChange) - Math.abs(a.dayPercentChange);
      }
      if (sortOption === 'alphabetical') {
        return a.symbol.localeCompare(b.symbol);
      }
      if (sortOption === 'recent') {
        return watchlistSymbols.indexOf(a.symbol) - watchlistSymbols.indexOf(b.symbol);
      }
      return 0;
    });
  }, [evaluatedStocks, watchlistSymbols, sortOption]);

  // Feed items for "Since you last checked"
  const sinceLastVisitFeed = useMemo(() => {
    const meaningful = sortedWatchlistStocks.filter(
      s => s.analysis.severity === SEVERITY.HIGH || s.analysis.severity === SEVERITY.MEDIUM
    );
    const normal = sortedWatchlistStocks.filter(s => s.analysis.severity === SEVERITY.NORMAL);
    return [...meaningful, ...normal.slice(0, 1)];
  }, [sortedWatchlistStocks]);

  // Attention summary metrics
  const attentionSummary = useMemo(() => {
    if (backendSummary) {
      return {
        totalMeaningful: backendSummary.totalMeaningful,
        significant: backendSummary.significant,
        worthWatching: backendSummary.worthWatching,
        normal: backendSummary.normal,
        totalWatched: backendSummary.totalWatched || sortedWatchlistStocks.length,
      };
    }

    const watched = sortedWatchlistStocks;
    const significant = watched.filter(s => s.analysis.severity === SEVERITY.HIGH).length;
    const worthWatching = watched.filter(s => s.analysis.severity === SEVERITY.MEDIUM).length;
    const normal = watched.filter(s => s.analysis.severity === SEVERITY.NORMAL).length;

    return {
      totalMeaningful: significant + worthWatching,
      significant,
      worthWatching,
      normal,
      totalWatched: watched.length,
    };
  }, [backendSummary, sortedWatchlistStocks]);

  const activeStock = useMemo(() => {
    return evaluatedStocks.find(s => s.symbol === selectedSymbol) || evaluatedStocks[0];
  }, [evaluatedStocks, selectedSymbol]);

  // Simulator helper: Trigger price movement in backend and sync state
  const simulatePriceSpike = async (symbol, pctDelta, volMultiplier = 1.6) => {
    // 1. Update local state immediately for instant UI responsiveness
    setStocksMap(prev => {
      const current = prev[symbol];
      if (!current) return prev;
      const newPrice = Number((current.currentPrice * (1 + pctDelta / 100)).toFixed(2));
      const newVolume = Math.round(current.volume * volMultiplier);
      const newSpark = [...(current.sparkline || []), newPrice].slice(-8);

      const newTimelineItem = {
        id: 'sim-' + Date.now(),
        time: 'Just now',
        type: pctDelta < 0 ? 'PRICE_DROP' : 'PRICE_RISE',
        title: `Price ${pctDelta < 0 ? '↓' : '↑'} ${Math.abs(pctDelta).toFixed(1)}%`,
        note: `Simulated market event: ${pctDelta < 0 ? 'Downside movement' : 'Upside breakout'} with ${volMultiplier}× volume.`,
        severity: Math.abs(pctDelta) >= 2.0 ? 'HIGH' : 'MEDIUM',
      };

      return {
        ...prev,
        [symbol]: {
          ...current,
          currentPrice: newPrice,
          dayHigh: Math.max(current.dayHigh, newPrice),
          dayLow: Math.min(current.dayLow, newPrice),
          volume: newVolume,
          sparkline: newSpark,
          lastUpdated: new Date().toISOString(),
          timeline: [newTimelineItem, ...(current.timeline || [])],
        }
      };
    });

    // 2. Call real backend simulation endpoint
    try {
      const res = await demoApi.simulateMovement(symbol, pctDelta, volMultiplier);
      if (res.success) {
        setLiveToast({
          title: `${symbol} Backend Movement Stored`,
          message: res.data?.message || `Snapshot saved & Attention Score computed: ${res.data?.evaluation?.attentionScore}/100.`,
          type: res.data?.evaluation?.severity || 'HIGH',
        });
        syncWithBackend();
      }
    } catch (err) {
      setLiveToast({
        title: `${symbol} Movement Simulated`,
        message: `Simulated ${pctDelta > 0 ? '+' : ''}${pctDelta}% movement on ${symbol}. Change engine recalculated severity.`,
        type: Math.abs(pctDelta) >= 2.0 ? 'HIGH' : 'MEDIUM',
      });
    }

    setTimeout(() => {
      setLiveToast(null);
    }, 4500);
  };

  // Toggle provider offline
  const toggleProviderOffline = async () => {
    setIsProviderOffline(prev => !prev);
    try {
      await demoApi.toggleOutage();
    } catch (e) {
      // Local fallback
    }
  };

  // Reset baseline
  const resetDemoData = async () => {
    try {
      await demoApi.seedDatabase();
    } catch (e) {
      // Local fallback
    }

    const map = {};
    SEARCHABLE_UNIVERSE.forEach(s => {
      map[s.symbol] = { ...s };
    });
    setStocksMap(map);
    setWatchlistSymbols(INITIAL_WATCHLIST);
    setThresholds(DEFAULT_THRESHOLDS);
    setIsProviderOffline(false);
    setSortOption('importance');
    localStorage.removeItem('finsmart_watchlist');
    localStorage.removeItem('finsmart_thresholds');

    setLiveToast({
      title: 'Demo Baseline Reset',
      message: 'Restored initial MongoDB snapshots and default thresholds.',
      type: 'NORMAL'
    });
    setTimeout(() => setLiveToast(null), 3000);
    syncWithBackend();
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlistSymbols,
        allStocks: evaluatedStocks,
        watchlistStocks: sortedWatchlistStocks,
        sinceLastVisitFeed,
        attentionSummary,
        activeStock,
        selectedSymbol,
        setSelectedSymbol,
        sortOption,
        setSortOption,
        thresholds,
        setThresholds,
        isProviderOffline,
        toggleProviderOffline,
        liveToast,
        setLiveToast,
        isSearchOpen,
        setIsSearchOpen,
        isAskOpen,
        setIsAskOpen,
        addToWatchlist,
        removeFromWatchlist,
        isWatched,
        simulatePriceSpike,
        resetDemoData,
        syncWithBackend,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within WatchlistProvider');
  }
  return context;
}
