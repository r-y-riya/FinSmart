import { useState } from "react";
import { Search, Bell, Sun, Moon, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useTheme } from '../context/ThemeContext';
import { formatRelativeTime } from '../utils/formatters';

export default function Navbar({ currentTab, setCurrentTab }) {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { setIsSearchOpen, setIsAskOpen, attentionSummary } = useWatchlist();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'watchlist', label: 'Watchlist' },
    { id: 'insights', label: 'Insights & Rules' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAFAF7]/90 dark:bg-[#101412]/90 backdrop-blur-md border-b border-pulse-border dark:border-pulse-dark-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT: Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              {/* Minimal pulse brand mark */}
              <div className="w-8 h-8 rounded-lg bg-pulse-green/15 dark:bg-pulse-green/20 flex items-center justify-center text-pulse-green dark:text-pulse-dark-green transition-transform group-hover:scale-105">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h3.5l2-5 3.5 10 3-7 2 4 1.5-2H21" />
                  <circle cx="21" cy="12" r="1" fill="currentColor" />
                </svg>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold tracking-tight text-base sm:text-lg text-pulse-text dark:text-pulse-dark-text font-sans">
                  FINSMART
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-pulse-green animate-pulse" />
              </div>
            </button>

            {/* Nav Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {tabs.map((tab) => {
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'text-pulse-text dark:text-white bg-white dark:bg-[#171C19] shadow-subtle border border-pulse-border dark:border-pulse-dark-border font-semibold'
                        : 'text-pulse-secondary dark:text-pulse-dark-secondary hover:text-pulse-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* RIGHT: Ask FinSmart, Search, Notifications, Theme, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Ask FinSmart AI Trigger */}
            <button
              onClick={() => setIsAskOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-pulse-purple-light dark:bg-[#9B7EDE]/15 text-pulse-purple dark:text-[#C5B3F2] border border-[#9B7EDE]/30 hover:border-pulse-purple transition-colors shadow-subtle"
              title="Ask FinSmart AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Quick Search trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-pulse-secondary dark:text-pulse-dark-secondary bg-white dark:bg-[#171C19] border border-pulse-border dark:border-pulse-dark-border hover:border-gray-400 transition-colors shadow-subtle"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search stocks...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-gray-800 rounded text-pulse-secondary">
                ⌘K
              </kbd>
            </button>

            {/* Notification Bell with Attention Badge */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl text-pulse-secondary dark:text-pulse-dark-secondary hover:text-pulse-text dark:hover:text-white bg-white dark:bg-[#171C19] border border-pulse-border dark:border-pulse-dark-border shadow-subtle transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {attentionSummary.significant > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF9B7A] text-[10px] font-bold text-white flex items-center justify-center">
                    {attentionSummary.significant}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotifOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#171C19] rounded-2xl shadow-elevated border border-pulse-border dark:border-pulse-dark-border p-4 z-50 animate-fadeIn"
                  onClick={() => setIsNotifOpen(false)}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-pulse-border dark:border-pulse-dark-border">
                    <span className="text-xs font-semibold text-pulse-text dark:text-pulse-dark-text">
                      Recent Activity
                    </span>
                    <span className="text-[11px] text-pulse-secondary">
                      {attentionSummary.totalMeaningful} unacknowledged
                    </span>
                  </div>
                  <div className="py-2.5 space-y-2">
                    <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#FFF1ED]/60 dark:bg-[#FF9B7A]/10 text-xs">
                      <span className="w-2 h-2 mt-1 rounded-full bg-[#FF9B7A] shrink-0" />
                      <div>
                        <div className="font-semibold text-pulse-text dark:text-pulse-dark-text">
                          Reliance dropped 3.2%
                        </div>
                        <p className="text-[11px] text-pulse-secondary">
                          Crossed 2% significance threshold on 4.2M volume.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#FEF9EC]/60 dark:bg-[#F5C95B]/10 text-xs">
                      <span className="w-2 h-2 mt-1 rounded-full bg-[#F5C95B] shrink-0" />
                      <div>
                        <div className="font-semibold text-pulse-text dark:text-pulse-dark-text">
                          Infosys volume surge +48%
                        </div>
                        <p className="text-[11px] text-pulse-secondary">
                          Elevated trading activity flagged for attention.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className="w-full text-center text-[11px] font-medium text-pulse-green dark:text-pulse-dark-green pt-1 hover:underline"
                  >
                    View Since-Last-Visit Feed
                  </button>
                </div>
              )}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-pulse-secondary dark:text-pulse-dark-secondary hover:text-pulse-text dark:hover:text-white bg-white dark:bg-[#171C19] border border-pulse-border dark:border-pulse-dark-border shadow-subtle transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl bg-white dark:bg-[#171C19] border border-pulse-border dark:border-pulse-dark-border shadow-subtle hover:border-gray-400 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-pulse-purple-light dark:bg-[#9B7EDE]/20 text-pulse-purple dark:text-pulse-dark-purple font-semibold text-xs flex items-center justify-center">
                  {user?.avatar || 'AM'}
                </div>
                <span className="text-xs font-medium text-pulse-text dark:text-pulse-dark-text hidden sm:inline">
                  {user?.name?.split(' ')[0] || 'Demo'}
                </span>
                <ChevronDown className="w-3 h-3 text-pulse-secondary" />
              </button>

              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#171C19] rounded-2xl shadow-elevated border border-pulse-border dark:border-pulse-dark-border p-3 z-50 animate-fadeIn"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <div className="px-2 py-1.5 border-b border-pulse-border dark:border-pulse-dark-border">
                    <div className="text-xs font-semibold text-pulse-text dark:text-pulse-dark-text">
                      {user?.name || 'Investor'}
                    </div>
                    <div className="text-[11px] text-pulse-secondary truncate">
                      {user?.email || 'demo@finsmart.io'}
                    </div>
                  </div>
                  <div className="py-2 px-2 text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary">
                    Last active: <span className="font-mono text-pulse-text dark:text-white">{formatRelativeTime(user?.lastVisitedAt)}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-pulse-border dark:border-pulse-dark-border">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'text-pulse-green font-semibold bg-pulse-green-light dark:bg-[#16A66A]/15'
                    : 'text-pulse-secondary'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
