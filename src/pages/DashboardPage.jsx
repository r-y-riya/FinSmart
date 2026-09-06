import React, { useState } from 'react';
import { 
  Plus, 
  ArrowUpDown, 
  Grid, 
  List, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Clock,
  Trash2
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import ChangeBadge from '../components/ChangeBadge';
import FreshnessIndicator from '../components/FreshnessIndicator';
import MiniSparkline from '../components/MiniSparkline';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatPercent, formatRelativeTime, formatVolume } from '../utils/formatters';
import { SEVERITY } from '../services/changeDetectionEngine';

export default function DashboardPage({ onSelectStock }) {
  const { user } = useAuth();
  const { 
    watchlistStocks, 
    sinceLastVisitFeed, 
    attentionSummary, 
    sortOption, 
    setSortOption,
    setIsSearchOpen,
    removeFromWatchlist,
    isProviderOffline
  } = useWatchlist();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const timeSinceVisit = formatRelativeTime(user?.lastVisitedAt);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* 1. HERO SECTION: "Here's what changed." */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-pulse-text dark:text-pulse-dark-text">
              Here's what changed.
            </h1>
            <p className="text-xs sm:text-sm text-pulse-secondary dark:text-pulse-dark-secondary mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-pulse-secondary" />
              <span>Since your last visit · {timeSinceVisit}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <FreshnessIndicator lastUpdated={new Date().toISOString()} isOffline={isProviderOffline} />
          </div>
        </div>

        {/* 2. PROMINENT SUMMARY CARD: "3 things deserve your attention" */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#F4F0FF] via-[#EEF5FE] to-[#FFF1ED] dark:from-[#1A1829] dark:via-[#16202A] dark:to-[#2A1D1A] border border-pulse-border dark:border-pulse-dark-border shadow-subtle transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/90 dark:bg-[#1E2521] border border-white/60 dark:border-gray-700 flex items-center justify-center text-2xl font-bold font-mono text-pulse-purple dark:text-[#C5B3F2] shadow-sm shrink-0">
                {attentionSummary.totalMeaningful}
              </div>
              <div className="space-y-0.5">
                <h2 className="text-base sm:text-lg font-semibold text-pulse-text dark:text-pulse-dark-text">
                  {attentionSummary.totalMeaningful === 0
                    ? 'No urgent movements detected'
                    : `${attentionSummary.totalMeaningful} things deserve your attention`}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-pulse-secondary dark:text-pulse-dark-secondary">
                  <span className="inline-flex items-center gap-1 font-medium text-[#D95328] dark:text-pulse-peach">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF9B7A]" />
                    {attentionSummary.significant} significant
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 font-medium text-[#A6780C] dark:text-pulse-yellow">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5C95B]" />
                    {attentionSummary.worthWatching} worth watching
                  </span>
                  <span>·</span>
                  <span className="text-pulse-secondary">
                    {attentionSummary.normal} normal / quiet
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#1E2521] text-pulse-text dark:text-pulse-dark-text border border-pulse-border dark:border-pulse-dark-border hover:border-gray-400 dark:hover:border-gray-600 transition-all shadow-subtle flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-pulse-green" />
                <span>Add Stock</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CHANGE FEED: "Since you last checked" */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-semibold text-pulse-text dark:text-pulse-dark-text">
              Since you last checked
            </h2>
            <p className="text-xs text-pulse-secondary dark:text-pulse-dark-secondary">
              Surfacing events that crossed volatility or volume thresholds
            </p>
          </div>
          <span className="text-xs text-pulse-secondary">
            {sinceLastVisitFeed.length} updates
          </span>
        </div>

        {sinceLastVisitFeed.length === 0 ? (
          <EmptyState type="no-changes" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sinceLastVisitFeed.map((stock) => {
              const isHigh = stock.analysis.severity === SEVERITY.HIGH;
              const isWatch = stock.analysis.severity === SEVERITY.MEDIUM;
              const isNormal = stock.analysis.severity === SEVERITY.NORMAL;
              const isDrop = stock.dayPercentChange < 0;

              return (
                <div
                  key={stock.symbol}
                  onClick={() => onSelectStock(stock.symbol)}
                  className={`relative p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                    isHigh
                      ? 'bg-white dark:bg-[#171C19] border-[#FF9B7A]/40 hover:border-[#FF9B7A] shadow-subtle hover:shadow-card'
                      : isWatch
                      ? 'bg-white dark:bg-[#171C19] border-[#F5C95B]/40 hover:border-[#F5C95B] shadow-subtle hover:shadow-card'
                      : 'bg-white/60 dark:bg-[#171C19]/60 border-pulse-border dark:border-pulse-dark-border opacity-75 hover:opacity-100 hover:bg-white dark:hover:bg-[#171C19]'
                  }`}
                >
                  <div>
                    {/* Header: Symbol & Severity Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-pulse-text dark:text-pulse-dark-text">
                            {stock.symbol}
                          </span>
                          <span className="text-[10px] text-pulse-secondary font-mono">
                            {stock.exchange}
                          </span>
                        </div>
                        <p className="text-xs text-pulse-secondary dark:text-pulse-dark-secondary truncate max-w-[170px]">
                          {stock.name}
                        </p>
                      </div>
                      <ChangeBadge severity={stock.analysis.severity} />
                    </div>

                    {/* Price & Change Banner */}
                    <div className="flex items-baseline justify-between py-2 border-y border-dashed border-pulse-border dark:border-pulse-dark-border mb-3">
                      <div>
                        <div className="font-mono text-base font-semibold text-pulse-text dark:text-pulse-dark-text">
                          {formatCurrency(stock.currentPrice, stock.currency)}
                        </div>
                        <div className={`text-xs font-mono font-medium flex items-center gap-0.5 ${
                          isDrop ? 'text-[#D95328] dark:text-pulse-peach' : 'text-pulse-green dark:text-pulse-dark-green'
                        }`}>
                          {isDrop ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                          <span>{formatPercent(stock.dayPercentChange)}</span>
                        </div>
                      </div>

                      {/* Mini sparkline */}
                      <div className="opacity-90 group-hover:opacity-100 transition-opacity">
                        <MiniSparkline
                          data={stock.sparkline}
                          isPositive={!isDrop}
                          width={80}
                          height={28}
                        />
                      </div>
                    </div>

                    {/* Primary Event Statement */}
                    <div className="space-y-1.5">
                      <p className={`text-xs font-medium leading-relaxed ${
                        isHigh
                          ? 'text-[#C4461C] dark:text-[#FFB59E]'
                          : isWatch
                          ? 'text-[#946A08] dark:text-[#F7D57F]'
                          : 'text-pulse-secondary dark:text-pulse-dark-secondary'
                      }`}>
                        "{stock.analysis.primaryEventText}"
                      </p>

                      {/* Why Flagged Explanation */}
                      {!isNormal && (
                        <div className="pt-2">
                          <span className="block text-[10px] uppercase tracking-wider font-semibold text-pulse-secondary dark:text-pulse-dark-secondary mb-0.5">
                            Why flagged
                          </span>
                          <p className="text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary leading-snug">
                            {stock.analysis.whyFlagged}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer link */}
                  <div className="pt-4 mt-3 border-t border-pulse-border/60 dark:border-pulse-dark-border flex items-center justify-between text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary group-hover:text-pulse-green transition-colors">
                    <span>Inspect snapshot details</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. WATCHLIST SECTION */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-pulse-text dark:text-pulse-dark-text">
              Your watchlist
            </h2>
            <p className="text-xs text-pulse-secondary dark:text-pulse-dark-secondary">
              Active positions prioritized by attention significance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sorting Dropdown (Default: Most important) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#171C19] border border-pulse-border dark:border-pulse-dark-border text-xs shadow-subtle">
              <ArrowUpDown className="w-3.5 h-3.5 text-pulse-secondary" />
              <span className="text-pulse-secondary hidden sm:inline">Sort:</span>
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

            {/* View Mode Toggle (Grid / Table) */}
            <div className="flex items-center p-0.5 rounded-xl bg-gray-100 dark:bg-[#1E2521] border border-pulse-border dark:border-pulse-dark-border">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#171C19] text-pulse-text dark:text-white shadow-sm'
                    : 'text-pulse-secondary hover:text-pulse-text'
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-[#171C19] text-pulse-text dark:text-white shadow-sm'
                    : 'text-pulse-secondary hover:text-pulse-text'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add Stock Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-pulse-green hover:bg-emerald-600 text-white transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stock</span>
            </button>
          </div>
        </div>

        {/* Watchlist Cards or Table */}
        {watchlistStocks.length === 0 ? (
          <EmptyState type="watchlist" onAction={() => setIsSearchOpen(true)} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlistStocks.map((stock) => {
              const isHigh = stock.analysis.severity === SEVERITY.HIGH;
              const isWatch = stock.analysis.severity === SEVERITY.MEDIUM;
              const isDrop = stock.dayPercentChange < 0;

              return (
                <div
                  key={stock.symbol}
                  onClick={() => onSelectStock(stock.symbol)}
                  className={`group p-5 rounded-2xl bg-white dark:bg-[#171C19] border transition-all cursor-pointer flex flex-col justify-between ${
                    isHigh
                      ? 'border-[#FF9B7A]/30 hover:border-[#FF9B7A] shadow-subtle hover:shadow-card'
                      : isWatch
                      ? 'border-[#F5C95B]/30 hover:border-[#F5C95B] shadow-subtle hover:shadow-card'
                      : 'border-pulse-border dark:border-pulse-dark-border hover:border-gray-400 dark:hover:border-gray-600 shadow-subtle hover:shadow-card'
                  }`}
                >
                  <div>
                    {/* Card Header */}
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

                    {/* Price and Sparkline */}
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

                  {/* Card Footer: Metadata & Quick Remove */}
                  <div className="pt-3 border-t border-pulse-border/60 dark:border-pulse-dark-border flex items-center justify-between text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary">
                    <FreshnessIndicator lastUpdated={stock.lastUpdated} isOffline={isProviderOffline} compact />

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchlist(stock.symbol);
                        }}
                        className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-pulse-secondary group-hover:text-pulse-text dark:group-hover:text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white dark:bg-[#171C19] rounded-2xl border border-pulse-border dark:border-pulse-dark-border shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/75 dark:bg-[#1E2521]/50 text-pulse-secondary dark:text-pulse-dark-secondary border-b border-pulse-border dark:border-pulse-dark-border">
                  <tr>
                    <th className="py-3 px-4 font-medium">Company</th>
                    <th className="py-3 px-4 font-medium">Price</th>
                    <th className="py-3 px-4 font-medium">Day Change</th>
                    <th className="py-3 px-4 font-medium">Trend</th>
                    <th className="py-3 px-4 font-medium">Change Status</th>
                    <th className="py-3 px-4 font-medium">Volume</th>
                    <th className="py-3 px-4 font-medium text-right">Freshness</th>
                    <th className="py-3 px-3 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pulse-border dark:divide-pulse-dark-border">
                  {watchlistStocks.map((stock) => {
                    const isDrop = stock.dayPercentChange < 0;

                    return (
                      <tr
                        key={stock.symbol}
                        onClick={() => onSelectStock(stock.symbol)}
                        className="hover:bg-gray-50/80 dark:hover:bg-[#1E2521] transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-pulse-text dark:text-pulse-dark-text">
                            {stock.symbol}
                          </div>
                          <div className="text-[11px] text-pulse-secondary truncate max-w-[150px]">
                            {stock.name}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-pulse-text dark:text-pulse-dark-text">
                          {formatCurrency(stock.currentPrice, stock.currency)}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className={`inline-flex items-center gap-0.5 ${
                            isDrop ? 'text-[#D95328] dark:text-pulse-peach' : 'text-pulse-green dark:text-pulse-dark-green'
                          }`}>
                            {isDrop ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                            {formatPercent(stock.dayPercentChange)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <MiniSparkline data={stock.sparkline} isPositive={!isDrop} width={68} height={22} />
                        </td>
                        <td className="py-3.5 px-4">
                          <ChangeBadge severity={stock.analysis.severity} />
                        </td>
                        <td className="py-3.5 px-4 font-mono text-pulse-secondary dark:text-pulse-dark-secondary">
                          {formatVolume(stock.volume)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <FreshnessIndicator lastUpdated={stock.lastUpdated} isOffline={isProviderOffline} compact />
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromWatchlist(stock.symbol);
                            }}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
