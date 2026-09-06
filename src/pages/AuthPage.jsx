import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AuthPage({ onLoginSuccess }) {
  const { login, register, loginDemo } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('arjun.mehta@finsmart.io');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Arjun Mehta');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      register(name, email, password);
    } else {
      login(email, password);
    }
    if (onLoginSuccess) onLoginSuccess();
  };

  const handleDemoClick = () => {
    loginDemo();
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#FAFAF7] dark:bg-[#101412] transition-colors">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-[#171C19] rounded-3xl border border-pulse-border dark:border-pulse-dark-border shadow-card overflow-hidden">
        {/* Left Column: Form */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-lg bg-pulse-green/15 dark:bg-pulse-green/20 flex items-center justify-center text-pulse-green">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h3.5l2-5 3.5 10 3-7 2 4 1.5-2H21" />
                  <circle cx="21" cy="12" r="1" fill="currentColor" />
                </svg>
              </div>
              <span className="font-bold tracking-tight text-lg text-pulse-text dark:text-pulse-dark-text font-sans">
                FINSMART
              </span>
            </div>

            {/* Editorial Heading */}
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-pulse-text dark:text-pulse-dark-text leading-tight mb-3">
              Know what changed.<br />
              <span className="text-pulse-secondary dark:text-pulse-dark-secondary">Know why it matters.</span>
            </h1>

            <p className="text-sm text-pulse-secondary dark:text-pulse-dark-secondary leading-relaxed mb-8">
              Your market watchlist, designed around the changes that actually deserve your attention.
            </p>

            {/* 1-Click Demo Account (Evaluator Friendly) */}
            <div className="mb-6 p-4 rounded-2xl bg-pulse-purple-light dark:bg-[#9B7EDE]/10 border border-[#9B7EDE]/25">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-pulse-purple dark:text-[#C5B3F2]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Quick Evaluator Access</span>
                  </div>
                  <p className="text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary">
                    Pre-populated with Reliance, Infosys, and TCS snapshots.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDemoClick}
                  className="shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-pulse-purple text-white hover:bg-[#8565CD] transition-colors shadow-sm"
                >
                  Enter as Demo User
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-medium text-pulse-text dark:text-pulse-dark-text mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Arjun Mehta"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#FAFAF7] dark:bg-[#1E2521] border border-pulse-border dark:border-pulse-dark-border text-pulse-text dark:text-pulse-dark-text focus:outline-none focus:ring-2 focus:ring-pulse-green/40"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-pulse-text dark:text-pulse-dark-text mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@finsmart.io"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#FAFAF7] dark:bg-[#1E2521] border border-pulse-border dark:border-pulse-dark-border text-pulse-text dark:text-pulse-dark-text focus:outline-none focus:ring-2 focus:ring-pulse-green/40"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-pulse-text dark:text-pulse-dark-text">
                    Password
                  </label>
                  {!isRegister && (
                    <span className="text-[11px] text-pulse-secondary hover:underline cursor-pointer">
                      Forgot?
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#FAFAF7] dark:bg-[#1E2521] border border-pulse-border dark:border-pulse-dark-border text-pulse-text dark:text-pulse-dark-text focus:outline-none focus:ring-2 focus:ring-pulse-green/40"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-pulse-green hover:bg-emerald-600 text-white transition-all shadow-sm flex items-center justify-center gap-2 group"
              >
                <span>{isRegister ? 'Create Account' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={handleDemoClick}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-medium bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-pulse-text dark:text-pulse-dark-text border border-pulse-border dark:border-pulse-dark-border transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-pulse-border dark:border-pulse-dark-border text-center text-xs text-pulse-secondary dark:text-pulse-dark-secondary">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="font-semibold text-pulse-green hover:underline"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="font-semibold text-pulse-green hover:underline"
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Abstract Minimal Pulse Visual */}
        <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-[#F4F0FF] via-[#EEF5FE] to-[#FFF1ED] dark:from-[#171C19] dark:via-[#1E2521] dark:to-[#171C19] p-12 flex-col justify-between relative overflow-hidden border-l border-pulse-border dark:border-pulse-dark-border">
          {/* Abstract background decorative shapes */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-pulse-purple/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-pulse-peach/10 blur-3xl pointer-events-none" />

          {/* Top pill */}
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-[#1E2521]/80 backdrop-blur-md border border-white/40 dark:border-gray-800 text-xs text-pulse-text dark:text-pulse-dark-text shadow-sm">
              <span className="w-2 h-2 rounded-full bg-pulse-green animate-pulse" />
              <span>Deterministic Change Engine</span>
            </div>
          </div>

          {/* Center Graphic: Calm Signal Stream Visual */}
          <div className="my-auto space-y-4 max-w-sm mx-auto w-full">
            {/* Sample Signal Card 1: Significant */}
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#1E2521]/90 backdrop-blur-sm border border-[#FF9B7A]/30 shadow-subtle transform hover:-translate-y-0.5 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-xs text-pulse-text dark:text-white">RELIANCE</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FFF1ED] dark:bg-[#FF9B7A]/20 text-[#D95328] dark:text-[#FF9B7A]">
                  Significant Change
                </span>
              </div>
              <p className="text-xs text-pulse-secondary dark:text-pulse-dark-secondary">
                Price dropped 3.2% while trading volume jumped 67%.
              </p>
            </div>

            {/* Sample Signal Card 2: Receding Normal */}
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#1E2521]/40 backdrop-blur-sm border border-pulse-border dark:border-pulse-dark-border shadow-subtle opacity-70">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-xs text-pulse-text dark:text-white">TCS</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-pulse-secondary">
                  Normal · Receding
                </span>
              </div>
              <p className="text-xs text-pulse-secondary dark:text-pulse-dark-secondary">
                Within expected daily boundaries. No action needed.
              </p>
            </div>

            {/* Core Principle Quote */}
            <div className="p-4 rounded-2xl bg-pulse-purple-light/80 dark:bg-[#9B7EDE]/15 border border-pulse-purple/20">
              <p className="text-xs italic text-pulse-text dark:text-pulse-dark-text leading-relaxed">
                "The database remembers the past. The market tells us the present. FinSmart surfaces what deserves your attention."
              </p>
            </div>
          </div>

          {/* Bottom security assurance */}
          <div className="flex items-center gap-2 text-xs text-pulse-secondary dark:text-pulse-dark-secondary">
            <ShieldCheck className="w-4 h-4 text-pulse-green" />
            <span>Snapshot-based comparison · Zero terminal noise</span>
          </div>
        </div>
      </div>
    </main>
  );
}
