import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Check, 
  TrendingDown, 
  TrendingUp, 
  Sparkles,
  Newspaper,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceDot 
} from 'recharts';
import { useWatchlist } from '../context/WatchlistContext';
import ChangeBadge from '../components/ChangeBadge';
import FreshnessIndicator from '../components/FreshnessIndicator';
import { formatCurrency, formatPercent, formatVolume } from '../utils/formatters';
import { SEVERITY } from '../services/changeDetectionEngine';
import { aiApi } from '../services/aiApi';
import { stockApi } from '../services/stockApi';

export default function StockDetailPage({ stockSymbol, onBack }) {
  const { allStocks, isWatched, addToWatchlist, removeFromWatchlist, isProviderOffline } = useWatchlist();
  const [timeframe, setTimeframe] = useState('1D');

  const stock = allStocks.find(s => s.symbol === stockSymbol) || allStocks[0];
  const watched = isWatched(stock.symbol);
  const isDrop = stock.dayPercentChange < 0;

  // Real backend AI & News & Changes state
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [newsList, setNewsList] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState(stock.timeline || []);

  useEffect(() => {
    let isMounted = true;

    async function loadBackendData() {
      // 1. Fetch AI Why This Matters
      setLoadingAi(true);
      try {
        const res = await aiApi.getWhyItMatters(stock.symbol);
        if (isMounted && res.success && res.data) {
          setAiInsight(res.data);
        }
      } catch (err) {
        // Fallback to stock's built-in insight
      } finally {
        if (isMounted) setLoadingAi(false);
      }

      // 2. Fetch Correlated News
      try {
        const newsRes = await stockApi.getNews(stock.symbol);
        if (isMounted && newsRes.success && newsRes.data?.length) {
          setNewsList(newsRes.data);
        }
      } catch (err) {
        // Fallback
      }

      // 3. Fetch Change Timeline from backend
      try {
        const changesRes = await stockApi.getChanges(stock.symbol);
        if (isMounted && changesRes.success && changesRes.data?.length) {
          const formatted = changesRes.data.map(c => ({
            id: c._id,
            time: new Date(c.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: c.percentageChange < 0 ? 'PRICE_DROP' : 'PRICE_RISE',
            title: `Price ${c.percentageChange < 0 ? '↓' : '↑'} ${Math.abs(c.percentageChange).toFixed(1)}%`,
            note: c.whyFlagged || c.primaryEventText,
            severity: c.severity,
          }));
          setTimelineEvents(formatted);
        }
      } catch (err) {
        // Fallback
      }
    }

    loadBackendData();

    return () => {
      isMounted = false;
    };
  }, [stock.symbol]);

  // Chart data
  const chartData = stock.chartHistory || [
    { time: '09:15', price: stock.previousClose, volume: 100000 },
    { time: '13:45', price: stock.currentPrice, volume: stock.volume }
  ];

  const minPrice = Math.floor(Math.min(...chartData.map(d => d.price)) * 0.995);
  const maxPrice = Math.ceil(Math.max(...chartData.map(d => d.price)) * 1.005);
  const eventPoints = chartData.filter(d => d.isEvent);
  const signalScore = stock.analysis.signalScoreOutOf10 || 8.2;

  return (
    <div className="space-y-8 animate-fadeIn pb-20 max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-medium text-pulse-secondary dark:text-pulse-dark-secondary hover:text-pulse-text dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Watchlist</span>
      </button>

      {/* 1. STOCK HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-pulse-border dark:border-pulse-dark-border">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-pulse-text dark:text-pulse-dark-text">
              {stock.name}
            </h1>
            <ChangeBadge severity={stock.analysis.severity} size="md" />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-pulse-secondary dark:text-pulse-dark-secondary">
            <span className="font-semibold text-pulse-text dark:text-pulse-dark-text">{stock.symbol}</span>
            <span>·</span>
            <span>{stock.exchange}</span>
            <span>·</span>
            <FreshnessIndicator lastUpdated={stock.lastUpdated} isOffline={isProviderOffline} />
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between md:justify-end gap-6">
          <div className="text-left md:text-right">
            <div className="font-mono text-2xl sm:text-3xl font-bold text-pulse-text dark:text-pulse-dark-text">
              {formatCurrency(stock.currentPrice, stock.currency)}
            </div>
            <div className={`text-sm font-mono font-medium flex items-center md:justify-end gap-1 ${
              isDrop ? 'text-[#D95328] dark:text-pulse-peach' : 'text-pulse-green dark:text-pulse-dark-green'
            }`}>
              {isDrop ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              <span>{formatPercent(stock.dayPercentChange)}</span>
              <span className="text-pulse-secondary dark:text-pulse-dark-secondary text-xs">
                ({formatCurrency(stock.dayNetChange, stock.currency)})
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (watched) {
                removeFromWatchlist(stock.symbol);
              } else {
                addToWatchlist(stock.symbol, stock.name, stock.exchange);
              }
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm shrink-0 ${
              watched
                ? 'bg-pulse-green-light dark:bg-[#16A66A]/20 text-pulse-green dark:text-pulse-dark-green border border-pulse-green/30 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20'
                : 'bg-pulse-text text-white hover:bg-black dark:bg-white dark:text-pulse-text'
            }`}
          >
            {watched ? (
              <>
                <Check className="w-4 h-4" />
                <span>Watching</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to Watchlist</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. PRICE CHART */}
      <div className="bg-white dark:bg-[#171C19] rounded-3xl p-6 border border-pulse-border dark:border-pulse-dark-border shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-pulse-text dark:text-pulse-dark-text uppercase tracking-wider">
              Price Action & Change Points
            </span>
            {eventPoints.length > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFF1ED] dark:bg-[#FF9B7A]/15 text-[#D95328] dark:text-[#FF9B7A] font-medium">
                {eventPoints.length} triggers marked
              </span>
            )}
          </div>

          {/* Timeframe buttons */}
          <div className="flex items-center p-0.5 rounded-xl bg-gray-100 dark:bg-[#1E2521] border border-pulse-border dark:border-pulse-dark-border text-xs">
            {['1D', '1W', '1M', '1Y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  timeframe === tf
                    ? 'bg-white dark:bg-[#171C19] text-pulse-text dark:text-white shadow-sm font-semibold'
                    : 'text-pulse-secondary hover:text-pulse-text'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isDrop ? '#FF9B7A' : '#16A66A'} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={isDrop ? '#FF9B7A' : '#16A66A'} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#66727D', fontSize: 11 }} 
              />
              <YAxis 
                domain={[minPrice, maxPrice]} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#66727D', fontSize: 11, fontFamily: 'DM Mono' }}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 bg-white dark:bg-[#1E2521] border border-pulse-border dark:border-pulse-dark-border rounded-xl shadow-elevated text-xs space-y-1">
                        <div className="text-pulse-secondary">{data.time}</div>
                        <div className="font-mono font-bold text-sm text-pulse-text dark:text-pulse-dark-text">
                          {formatCurrency(data.price, stock.currency)}
                        </div>
                        {data.eventTitle && (
                          <div className="mt-1 pt-1 border-t border-pulse-border text-[11px] font-semibold text-[#D95328] dark:text-pulse-peach flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9B7A]" />
                            {data.eventTitle}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={isDrop ? '#FF9B7A' : '#16A66A'} 
                strokeWidth={2} 
                fill="url(#chartGradient)" 
              />

              {/* Highlight points where changes crossed thresholds */}
              {eventPoints.map((pt, i) => (
                <ReferenceDot
                  key={i}
                  x={pt.time}
                  y={pt.price}
                  r={5}
                  fill="#FF9B7A"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. TODAY'S KEY STATS */}
      <div className="bg-white dark:bg-[#171C19] rounded-3xl p-6 border border-pulse-border dark:border-pulse-dark-border shadow-subtle space-y-3">
        <h3 className="text-xs font-semibold text-pulse-text dark:text-pulse-dark-text uppercase tracking-wider">
          Today's Market Data
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-3 rounded-2xl bg-gray-50/75 dark:bg-[#1E2521]/60 border border-pulse-border/50 dark:border-pulse-dark-border">
            <span className="text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary block mb-1">Open</span>
            <span className="font-mono font-medium text-sm text-pulse-text dark:text-pulse-dark-text">
              {formatCurrency(stock.dayOpen, stock.currency)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50/75 dark:bg-[#1E2521]/60 border border-pulse-border/50 dark:border-pulse-dark-border">
            <span className="text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary block mb-1">Day High</span>
            <span className="font-mono font-medium text-sm text-pulse-text dark:text-pulse-dark-text">
              {formatCurrency(stock.dayHigh, stock.currency)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50/75 dark:bg-[#1E2521]/60 border border-pulse-border/50 dark:border-pulse-dark-border">
            <span className="text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary block mb-1">Day Low</span>
            <span className="font-mono font-medium text-sm text-pulse-text dark:text-pulse-dark-text">
              {formatCurrency(stock.dayLow, stock.currency)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50/75 dark:bg-[#1E2521]/60 border border-pulse-border/50 dark:border-pulse-dark-border">
            <span className="text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary block mb-1">Volume</span>
            <span className="font-mono font-medium text-sm text-pulse-text dark:text-pulse-dark-text">
              {formatVolume(stock.volume)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50/75 dark:bg-[#1E2521]/60 border border-pulse-border/50 dark:border-pulse-dark-border">
            <span className="text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary block mb-1">52W High</span>
            <span className="font-mono font-medium text-sm text-pulse-text dark:text-pulse-dark-text">
              {formatCurrency(stock.fiftyTwoWeekHigh, stock.currency)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50/75 dark:bg-[#1E2521]/60 border border-pulse-border/50 dark:border-pulse-dark-border">
            <span className="text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary block mb-1">52W Low</span>
            <span className="font-mono font-medium text-sm text-pulse-text dark:text-pulse-dark-text">
              {formatCurrency(stock.fiftyTwoWeekLow, stock.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* 4. "WHAT CHANGED?" & "✦ WHY THIS MATTERS" & "CHANGE SIGNAL" GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: "WHAT CHANGED?" + "✦ WHY THIS MATTERS" + "CORRELATED NEWS" */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION: WHAT CHANGED? */}
          <div className="bg-white dark:bg-[#171C19] rounded-3xl p-6 border border-pulse-border dark:border-pulse-dark-border shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-pulse-text dark:text-pulse-dark-text">
                What Changed?
              </h3>
              <span className="text-xs text-pulse-secondary">
                Comparing current snapshot to last visit baseline
              </span>
            </div>

            {/* Event Cards */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#FFF1ED] dark:bg-[#FF9B7A]/15 border border-[#FF9B7A]/30 flex items-start gap-3">
                <span className="w-2.5 h-2.5 mt-1 rounded-full bg-[#FF9B7A] shrink-0" />
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-[#D95328] dark:text-[#FFB59E]">
                    {stock.analysis.primaryEventText || 'Price movement flagged by change engine'}
                  </div>
                  <p className="text-xs text-pulse-secondary dark:text-pulse-dark-secondary">
                    {stock.analysis.whyFlagged}
                  </p>
                </div>
              </div>

              {stock.analysis.volumeRatio >= 1.2 && (
                <div className="p-4 rounded-2xl bg-[#FEF9EC] dark:bg-[#F5C95B]/15 border border-[#F5C95B]/30 flex items-start gap-3">
                  <span className="w-2.5 h-2.5 mt-1 rounded-full bg-[#F5C95B] shrink-0" />
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-[#946A08] dark:text-[#F7D57F]">
                      Volume ratio {stock.analysis.volumeRatio.toFixed(1)}× reference
                    </div>
                    <p className="text-xs text-pulse-secondary dark:text-pulse-dark-secondary">
                      Unusual trading volume activity recorded relative to baseline average.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION: "✦ WHY THIS MATTERS" (Pale lavender card #F4F0FF) */}
          <div className="p-6 rounded-3xl bg-[#F4F0FF] dark:bg-[#1A1829] border border-[#9B7EDE]/30 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-pulse-purple dark:text-[#C5B3F2]">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-sm font-semibold tracking-wide">
                  ✦ Why this matters
                </h3>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-pulse-purple/10 text-pulse-purple font-semibold">
                AI Synthesis
              </span>
            </div>

            <p className="text-sm text-pulse-text dark:text-pulse-dark-text leading-relaxed">
              {aiInsight?.whyItMatters || stock.name + " registered attention-worthy price divergence accompanied by unusual volume activity, indicating institutional repositioning rather than ordinary retail fluctuation."}
            </p>

            {aiInsight?.evidence?.length > 0 && (
              <div className="pt-2 border-t border-[#9B7EDE]/20 space-y-1">
                <span className="text-[11px] font-semibold text-pulse-purple dark:text-[#C5B3F2] block">
                  Grounding Evidence:
                </span>
                <ul className="text-xs text-pulse-secondary dark:text-pulse-dark-secondary list-disc pl-4 space-y-0.5">
                  {aiInsight.evidence.map((ev, idx) => (
                    <li key={idx}>{ev}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* SECTION: CORRELATED NEWS & EVIDENCE */}
          {newsList.length > 0 && (
            <div className="bg-white dark:bg-[#171C19] rounded-3xl p-6 border border-pulse-border dark:border-pulse-dark-border shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-pulse-blue" />
                  <h3 className="text-sm font-semibold text-pulse-text dark:text-pulse-dark-text">
                    Correlated News & Market Evidence
                  </h3>
                </div>
                <span className="text-[11px] text-pulse-secondary font-mono">
                  {newsList.length} articles
                </span>
              </div>

              <div className="space-y-3">
                {newsList.slice(0, 3).map((item, idx) => (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#1E2521] border border-pulse-border/60 dark:border-pulse-dark-border hover:border-pulse-blue transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-pulse-text dark:text-pulse-dark-text group-hover:text-pulse-blue transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-pulse-secondary">
                          <span className="font-medium text-pulse-text dark:text-pulse-dark-text">{item.source}</span>
                          <span>·</span>
                          <span>Relevance: {Math.round(item.relevanceScore * 100)}%</span>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-pulse-secondary group-hover:text-pulse-blue shrink-0 mt-0.5" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Cols: "CHANGE SIGNAL" METER & "CHANGE TIMELINE" */}
        <div className="lg:col-span-5 space-y-6">
          {/* CHANGE SIGNAL ANALYTICAL COMPONENT */}
          <div className="bg-white dark:bg-[#171C19] rounded-3xl p-6 border border-pulse-border dark:border-pulse-dark-border shadow-subtle space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-pulse-text dark:text-pulse-dark-text uppercase tracking-wider">
                Change Signal
              </h3>
              <span className="text-[11px] font-mono text-pulse-secondary">
                Deterministic Score
              </span>
            </div>

            {/* Overall Score Badge */}
            <div className="p-4 rounded-2xl bg-gray-50/90 dark:bg-[#1E2521] border border-pulse-border dark:border-pulse-dark-border flex items-center justify-between">
              <div>
                <span className="text-[11px] text-pulse-secondary block">Overall Significance</span>
                <span className="text-xs font-semibold text-[#D95328] dark:text-pulse-peach">
                  {stock.analysis.severity === SEVERITY.HIGH ? 'HIGH ATTENTION' : 'MODERATE WATCH'}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-2xl font-bold text-pulse-text dark:text-pulse-dark-text">
                  {signalScore}
                </span>
                <span className="text-xs text-pulse-secondary"> / 10</span>
              </div>
            </div>

            {/* Signal breakdown meters */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-pulse-secondary">Price Movement</span>
                  <span className="font-semibold text-[#D95328] dark:text-pulse-peach">
                    {stock.analysis.signals.priceMovement}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF9B7A] rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-pulse-secondary">Volume Activity</span>
                  <span className="font-semibold text-[#D95328] dark:text-pulse-peach">
                    {stock.analysis.signals.volumeActivity}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF9B7A] rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-pulse-secondary">Volatility Index</span>
                  <span className="font-semibold text-[#A6780C] dark:text-pulse-yellow">
                    {stock.analysis.signals.volatility}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F5C95B] rounded-full" style={{ width: '55%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-pulse-secondary">Threshold Signal</span>
                  <span className="font-semibold text-pulse-secondary">
                    {stock.analysis.signals.otherSignals}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-pulse-blue rounded-full" style={{ width: '40%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* VERTICAL CHANGE TIMELINE */}
          <div className="bg-white dark:bg-[#171C19] rounded-3xl p-6 border border-pulse-border dark:border-pulse-dark-border shadow-subtle space-y-4">
            <h3 className="text-xs font-semibold text-pulse-text dark:text-pulse-dark-text uppercase tracking-wider">
              Change History
            </h3>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-pulse-border dark:before:bg-pulse-dark-border">
              {timelineEvents.map((item) => {
                const isItemHigh = item.severity === 'HIGH' || item.severity === 'SIGNIFICANT';
                const isItemMedium = item.severity === 'MEDIUM' || item.severity === 'WATCH';

                return (
                  <div key={item.id} className="relative">
                    <span className={`absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#171C19] ${
                      isItemHigh ? 'bg-[#FF9B7A]' : isItemMedium ? 'bg-[#F5C95B]' : 'bg-[#16A66A]'
                    }`} />

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-pulse-secondary">
                          {item.time}
                        </span>
                        <span className={`text-xs font-semibold ${
                          isItemHigh ? 'text-[#D95328] dark:text-pulse-peach' : 'text-pulse-text dark:text-pulse-dark-text'
                        }`}>
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary">
                        {item.note}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
