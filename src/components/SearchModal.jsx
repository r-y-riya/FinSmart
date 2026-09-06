import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Plus, Check, TrendingUp, TrendingDown } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function SearchModal({ isOpen, onClose }) {
  const { allStocks, addToWatchlist, removeFromWatchlist, isWatched, setSelectedSymbol } = useWatchlist();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const filtered = allStocks.filter(stock => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      stock.symbol.toLowerCase().includes(q) ||
      stock.name.toLowerCase().includes(q) ||
      stock.exchange.toLowerCase().includes(q)
    );
  });

  return (
    <div onClick={handleClose} className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#171C19] rounded-2xl border border-pulse-border dark:border-pulse-dark-border shadow-elevated overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-pulse-border dark:border-pulse-dark-border">
          <Search className="w-5 h-5 text-pulse-secondary dark:text-pulse-dark-secondary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stocks by name or symbol (e.g. RELIANCE, TCS, AAPL)..."
            className="w-full bg-transparent text-sm text-pulse-text dark:text-pulse-dark-text placeholder-pulse-secondary/60 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-pulse-secondary hover:text-pulse-text dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-pulse-secondary dark:text-pulse-dark-secondary bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-gray-50 dark:divide-gray-800/40">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-pulse-secondary dark:text-pulse-dark-secondary">
              No stocks found matching "<span className="font-semibold">{query}</span>"
            </div>
          ) : (
            filtered.map((stock) => {
              const watched = isWatched(stock.symbol);
              const isPositive = stock.dayPercentChange >= 0;

              return (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1E2521] transition-colors cursor-pointer group"
                  onClick={() => {
                    setSelectedSymbol(stock.symbol);
                    handleClose();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#101412] flex items-center justify-center font-bold text-xs text-pulse-text dark:text-pulse-dark-text border border-pulse-border dark:border-pulse-dark-border">
                      {stock.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-pulse-text dark:text-pulse-dark-text">
                          {stock.symbol}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-pulse-secondary dark:text-pulse-dark-secondary font-mono">
                          {stock.exchange}
                        </span>
                      </div>
                      <p className="text-xs text-pulse-secondary dark:text-pulse-dark-secondary truncate max-w-[200px] sm:max-w-xs">
                        {stock.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono text-sm font-medium text-pulse-text dark:text-pulse-dark-text">
                        {formatCurrency(stock.currentPrice, stock.currency)}
                      </div>
                      <div className={`text-xs font-mono flex items-center justify-end gap-0.5 ${
                        isPositive ? 'text-pulse-green dark:text-pulse-dark-green' : 'text-[#D95328] dark:text-pulse-peach'
                      }`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{formatPercent(stock.dayPercentChange)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (watched) {
                          removeFromWatchlist(stock.symbol);
                        } else {
                          addToWatchlist(stock.symbol);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                        watched
                          ? 'bg-pulse-green-light dark:bg-[#16A66A]/15 text-pulse-green dark:text-pulse-dark-green hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20'
                          : 'bg-pulse-text text-white hover:bg-black dark:bg-white dark:text-pulse-text dark:hover:bg-gray-200'
                      }`}
                    >
                      {watched ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Watching</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-gray-50/80 dark:bg-[#141916] border-t border-pulse-border dark:border-pulse-dark-border text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary flex justify-between items-center">
          <span>Search stocks to watch for meaningful changes</span>
          <span>{filtered.length} available</span>
        </div>
      </div>
    </div>
  );
}
