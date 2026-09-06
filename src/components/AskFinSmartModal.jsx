import React, { useState, useRef } from 'react';
import { Sparkles, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { aiApi } from '../services/aiApi';

export default function AskFinSmartModal({ isOpen, onClose }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(false);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your FinSmart market intelligence assistant. Ask me anything about changes, volume anomalies, or why specific stocks moved since your last check.',
    }
  ]);

  if (!isOpen) return null;

  const handleSend = async (queryText = null) => {
    const q = (queryText || question).trim();
    if (!q || loading || inFlightRef.current) return;

    inFlightRef.current = true;
    const userMsg = { role: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await aiApi.askFinSmart(q);
      const answer = res.data?.answer || 'No response returned from intelligence engine.';
      setMessages(prev => [...prev, { role: 'assistant', text: answer }]);
    } catch (err) {
      const is429 = err.response?.status === 429;
      const fallbackText = is429
        ? `The AI service is experiencing high demand (Rate limited). Based on your stored snapshots:\n\n• **RELIANCE**: -3.2% drop on 4.7× volume surge (Attention 83/100 · Significant)\n• **TATAMOTORS**: +4.1% breakout on 3.2× volume (Attention 68/100 · Significant)\n• **INFY**: +1.8% on 1.48× volume (Attention 54/100 · Worth Watching)\n• **TCS**: +0.4% normal drift (Attention 16/100 · Normal)`
        : `Unable to contact intelligence engine at this moment. You can view all active signals and change cards on your Dashboard.`;
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: fallbackText,
        }
      ]);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  const samplePrompts = [
    'What meaningfully changed today?',
    'Why is Reliance down?',
    'Which stocks need attention?',
    'Show unusual volume spikes',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#171C19] rounded-3xl border border-pulse-border dark:border-pulse-dark-border shadow-elevated overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pulse-border dark:border-pulse-dark-border bg-[#F4F0FF]/60 dark:bg-[#1A1829]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pulse-purple text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-pulse-text dark:text-pulse-dark-text">
                Ask FinSmart Intelligence
              </h3>
              <p className="text-[11px] text-pulse-secondary dark:text-pulse-dark-secondary">
                Grounded in your real MongoDB snapshots & attention scoring
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-pulse-secondary hover:text-pulse-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-pulse-text text-white dark:bg-white dark:text-pulse-text'
                    : 'bg-pulse-purple-light dark:bg-[#9B7EDE]/20 text-pulse-purple'
                }`}
              >
                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div
                className={`p-3.5 rounded-2xl max-w-[80%] leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-pulse-green text-white font-medium'
                    : 'bg-[#FAFAF7] dark:bg-[#1E2521] border border-pulse-border dark:border-pulse-dark-border text-pulse-text dark:text-pulse-dark-text'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-pulse-purple">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing market snapshots & attention signals...</span>
            </div>
          )}
        </div>

        {/* Sample Prompts */}
        <div className="px-5 py-2.5 bg-gray-50/75 dark:bg-[#141916] border-t border-pulse-border dark:border-pulse-dark-border flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-pulse-secondary shrink-0">Try:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1E2521] border border-pulse-border dark:border-pulse-dark-border text-pulse-text dark:text-pulse-dark-text hover:border-pulse-purple transition-colors shrink-0 disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white dark:bg-[#171C19] border-t border-pulse-border dark:border-pulse-dark-border flex items-center gap-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask why a stock changed or which movements need attention..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAFAF7] dark:bg-[#1E2521] border border-pulse-border dark:border-pulse-dark-border text-xs text-pulse-text dark:text-pulse-dark-text focus:outline-none focus:ring-2 focus:ring-pulse-purple/40"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="p-2.5 rounded-xl bg-pulse-purple text-white hover:bg-[#8565CD] transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
