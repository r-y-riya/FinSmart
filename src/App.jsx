import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WatchlistProvider, useWatchlist } from './context/WatchlistContext';
import Navbar from './components/Navbar';
import SimulationBar from './components/SimulationBar';
import SearchModal from './components/SearchModal';
import AskFinSmartModal from './components/AskFinSmartModal';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import StockDetailPage from './pages/StockDetailPage';
import InsightsConfigPage from './pages/InsightsConfigPage';
import ChangeBadge from './components/ChangeBadge';
import FreshnessIndicator from './components/FreshnessIndicator';
import MiniSparkline from './components/MiniSparkline';
import EmptyState from './components/EmptyState';
import { formatCurrency, formatPercent } from './utils/formatters';
import { Plus, ArrowUpDown, TrendingDown, TrendingUp, Trash2 } from 'lucide-react';
import { SEVERITY } from './services/changeDetectionEngine';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const { 
    selectedSymbol, 
    setSelectedSymbol, 
    isSearchOpen, 
    setIsSearchOpen,
    isAskOpen,
    setIsAskOpen,
    watchlistStocks,
    sortOption,
    setSortOption,
    removeFromWatchlist,
    isProviderOffline
  } = useWatchlist();

  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard' | 'watchlist' | 'insights'
  const [severityFilter, setSeverityFilter] = useState('ALL'); // 'ALL' | 'HIGH' | 'MEDIUM' | 'NORMAL'

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const filteredWatchlist = watchlistStocks.filter(stock => {
    if (severityFilter === 'ALL') return true;
    return stock.analysis.severity === severityFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] dark:bg-[#101412] text-[#17212B] dark:text-[#F1F5F2] transition-colors">
      {/* 1. Interactive Demo Simulator Bar */}
      <SimulationBar />

      {/* 2. Global Navbar */}
      <Navbar
        currentTab={selectedSymbol ? '' : currentTab}
        setCurrentTab={(tab) => {
          setSelectedSymbol(null);
          setCurrentTab(tab);
        }}
      />

      {/* 3. Search & Ask FinSmart Modals */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AskFinSmartModal isOpen={isAskOpen} onClose={() => setIsAskOpen(false)} />

      {/* 4. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {selectedSymbol ? (
          <StockDetailPage
            stockSymbol={selectedSymbol}
            onBack={() => setSelectedSymbol(null)}
          />
        ) : currentTab === 'dashboard' ? (
          <DashboardPage onSelectStock={(sym) => setSelectedSymbol(sym)} />
        ) : currentTab === 'insights' ? (
          <InsightsConfigPage />
        ) : (
          /* Dedicated Watchlist Tab View */
          <div className="space-y-6 animate-fadeIn pb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pulse-border dark:border-pulse-dark-border">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-pulse-text dark:text-pulse-dark-text">
                  Your Watchlist
                </h1>
                <p className="text-xs sm:text-sm text-pulse-secondary dark:text-pulse-dark-secondary">
                  Monitoring {watchlistStocks.length} assets for meaningful market signals
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Filter by severity */}
                <div className="flex items-center p-0.5 rounded-xl bg-gray-100 dark:bg-[#1E2521] border border-pulse-border dark:border-pulse-dark-border text-xs">
                  {['ALL', SEVERITY.HIGH, SEVERITY.MEDIUM, SEVERITY.NORMAL].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        severityFilter === sev
                          ? 'bg-white dark:bg-[#171C19] text-pulse-text dark:text-white shadow-sm'
                          : 'text-pulse-secondary hover:text-pulse-text'
                      }`}
                    >
                      {sev === 'ALL' ? 'All' : sev === SEVERITY.HIGH ? 'Significant' : sev === SEVERITY.MEDIUM ? 'Watch' : 'Normal'}
                    </button>
                  ))}
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#171C19] border border-pulse-border dark:border-pulse-dark-border text-xs shadow-subtle">
                  <ArrowUpDown className="w-3.5 h-3.5 text-pulse-secondary" />
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-transparent font-medium text-pulse-text dark:text-pulse-dark-text focus:outline-none cursor-pointer"
                  >
                    <option value="importance" className="dark:bg-[#171C19]">Most important</option>
                    <option value="movement" className="dark:bg-[#171C19]">Biggest movement</option>
                    <option value="recent" className="dark:bg-[#171C19]">Recently added</option>
                    <option value="alphabetical" className="dark:bg-[#171C19]">Alphabetical</option>
                  </select>
                </div>

                {/* Add button */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-pulse-green hover:bg-emerald-600 text-white shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stock</span>
                </button>
              </div>
            </div>

            {/* List or Grid */}
            {filteredWatchlist.length === 0 ? (
              <EmptyState type="watchlist" onAction={() => setIsSearchOpen(true)} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWatchlist.map((stock) => {
                  const isHigh = stock.analysis.severity === SEVERITY.HIGH;
                  const isWatch = stock.analysis.severity === SEVERITY.MEDIUM;
                  const isDrop = stock.dayPercentChange < 0;

                  return (
                    <div
                      key={stock.symbol}
                      onClick={() => setSelectedSymbol(stock.symbol)}
                      className={`group p-5 rounded-2xl bg-white dark:bg-[#171C19] border transition-all cursor-pointer flex flex-col justify-between ${
                        isHigh
                          ? 'border-[#FF9B7A]/30 hover:border-[#FF9B7A] shadow-subtle hover:shadow-card'
                          : isWatch
                          ? 'border-[#F5C95B]/30 hover:border-[#F5C95B] shadow-subtle hover:shadow-card'
                          : 'border-pulse-border dark:border-pulse-dark-border hover:border-gray-400 dark:hover:border-gray-600 shadow-subtle hover:shadow-card'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-pulse-text dark:text-pulse-dark-text">
                                {stock.symbol}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-pulse-secondary font-mono">
                                {stock.exchange}
                              </span>
                            </div>
                            <p className="text-xs text-pulse-secondary dark:text-pulse-dark-secondary truncate max-w-[180px]">
                              {stock.name}
                            </p>
                          </div>
                          <ChangeBadge severity={stock.analysis.severity} />
                        </div>

                        <div className="flex items-end justify-between my-3">
                          <div>
                            <div className="font-mono text-lg font-semibold text-pulse-text dark:text-pulse-dark-text">
                              {formatCurrency(stock.currentPrice, stock.currency)}
                            </div>
                            <div className={`text-xs font-mono font-medium flex items-center gap-1 ${
                              isDrop ? 'text-[#D95328] dark:text-pulse-peach' : 'text-pulse-green dark:text-pulse-dark-green'
                            }`}>
                              {isDrop ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                              <span>{formatPercent(stock.dayPercentChange)}</span>
                            </div>
                          </div>

                          <div className="pr-1">
                            <MiniSparkline
                              data={stock.sparkline}
                              isPositive={!isDrop}
                              width={88}
                              height={30}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-pulse-border/60 dark:border-pulse-dark-border flex items-center justify-between text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary">
                        <FreshnessIndicator lastUpdated={stock.lastUpdated} isOffline={isProviderOffline} compact />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWatchlist(stock.symbol);
                          }}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 5. Minimal Editorial Footer */}
      <footer className="mt-auto border-t border-pulse-border dark:border-pulse-dark-border py-6 bg-white/50 dark:bg-[#141916]/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-pulse-secondary dark:text-pulse-dark-secondary">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-pulse-text dark:text-pulse-dark-text">FinSmart</span>
            <span>·</span>
            <span>Know what changed. Know why it matters.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Deterministic Scoring Engine</span>
            <span>·</span>
            <span>Resilient Snapshot Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WatchlistProvider>
          <MainApp />
        </WatchlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
